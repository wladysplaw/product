import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const directionPath = path.join(projectRoot, "src/scripts/page-motion-direction.ts");
const controllerPath = path.join(projectRoot, "src/scripts/page-motion.ts");
const identityRuntimePath = path.join(projectRoot, "src/scripts/site-identity.ts");
const layoutPath = path.join(projectRoot, "src/layouts/BaseLayout.astro");
const homePath = path.join(projectRoot, "src/pages/index.astro");
const cardPath = path.join(projectRoot, "src/components/ProjectCard.astro");
const detailPath = path.join(projectRoot, "src/components/ProjectDetail.astro");
const identityPath = path.join(projectRoot, "src/components/SiteIdentity.astro");
const displacementPath = path.join(projectRoot, "src/scripts/dom-snapshot-displacement.ts");
const risingInkPath = path.join(projectRoot, "src/scripts/rising-ink.ts");
const calloutPath = path.join(projectRoot, "src/scripts/scroll-callout.ts");
const caseScrollAdvancePath = path.join(projectRoot, "src/scripts/case-scroll-advance.ts");
const stylesPath = path.join(projectRoot, "src/styles/global.css");

test("resolves explicit and history page-motion directions", async () => {
  assert.equal(existsSync(directionPath), true, "page motion needs a pure direction resolver");

  const { resolvePageMotionDirection } = await import("../src/scripts/page-motion-direction.ts");

  assert.equal(resolvePageMotionDirection("push", "forward"), "forward");
  assert.equal(resolvePageMotionDirection("push", "forward", "back"), "back");
  assert.equal(resolvePageMotionDirection("traverse", "back"), "back");
  assert.equal(resolvePageMotionDirection("traverse", "forward"), "forward");
  assert.equal(resolvePageMotionDirection("replace", "none"), "forward");
});

test("uses Astro routing only for internal editorial routes", () => {
  const layout = readFileSync(layoutPath, "utf8");
  const home = readFileSync(homePath, "utf8");
  const card = readFileSync(cardPath, "utf8");
  const detail = readFileSync(detailPath, "utf8");

  assert.match(layout, /import \{ ClientRouter \} from "astro:transitions";/);
  assert.match(layout, /<ClientRouter fallback="animate" \/>/);
  assert.match(card, /data-motion-reveal="home-card"/);
  assert.match(detail, /data-page-motion-direction="back"/);
  assert.match(home, /data-motion-reveal="home-intro"/);
  assert.match(home, /data-motion-reveal="home-right"/);
  assert.match(home, /https:\/\/t\.me\/saysskyy" target="_blank"/);
  assert.doesNotMatch(home, /data-page-motion-direction="back"[^>]*https:\/\/t\.me/);
});

test("owns page effects through one persistent route lifecycle", () => {
  assert.equal(existsSync(controllerPath), true, "page transitions need one persistent controller");
  assert.equal(existsSync(identityRuntimePath), true, "the portrait hover needs a disposable runtime");
  assert.equal(existsSync(caseScrollAdvancePath), true, "case overscroll needs a disposable page effect");

  const controller = readFileSync(controllerPath, "utf8");
  const layout = readFileSync(layoutPath, "utf8");
  const identity = readFileSync(identityPath, "utf8");
  const displacement = readFileSync(displacementPath, "utf8");
  const risingInk = readFileSync(risingInkPath, "utf8");
  const callouts = readFileSync(calloutPath, "utf8");
  const caseScrollAdvance = readFileSync(caseScrollAdvancePath, "utf8");

  assert.match(layout, /import \{ startPageMotion \} from "\.\.\/scripts\/page-motion";/);
  assert.match(layout, /startPageMotion\(\)/);
  assert.match(controller, /new Lenis\(/, "only the controller may create Lenis");
  assert.match(controller, /mountDomSnapshotDisplacement\(\)/);
  assert.match(controller, /mountRisingInk\(\)/);
  assert.match(controller, /mountScrollCallouts\(\)/);
  assert.match(controller, /mountCaseScrollAdvance\(\)/);
  assert.match(controller, /mountSiteIdentity\(\)/);
  assert.match(controller, /astro:before-preparation/);
  assert.match(controller, /astro:before-swap/);
  assert.match(controller, /astro:after-swap/);
  assert.match(controller, /astro:page-load/);
  assert.match(controller, /prefers-reduced-motion: reduce/);
  assert.match(controller, /pagehide/);
  assert.doesNotMatch(identity, /<script>/, "portrait listeners must not be stranded after a soft route swap");
  assert.match(displacement, /export function mountDomSnapshotDisplacement\(\): \(\) => void\s*\{[\s\S]*?return \(\) =>/);
  assert.match(risingInk, /export function mountRisingInk\(\): \(\) => void\s*\{[\s\S]*?return \(\) =>/);
  assert.match(callouts, /export function mountScrollCallouts\(\): \(\) => void\s*\{[\s\S]*?return \(\) =>/);
  assert.match(caseScrollAdvance, /const NEXT_LINK_SELECTOR = ['"]\.case-footer__next['"]/, "the auto-advance destination must find the existing case footer next link outside main");
  assert.match(caseScrollAdvance, /navigate\(nextLink\.href\)/, "overscroll must use the shared Astro route transition rather than a hard navigation");
  assert.match(caseScrollAdvance, /AUTO_ADVANCE_START_EVENT/, "automatic case navigation must identify itself before it changes the route");
  assert.match(caseScrollAdvance, /AUTO_ADVANCE_ABORT_EVENT/, "a failed automatic navigation must reopen input on the current case");
  assert.match(controller, /AUTO_ADVANCE_START_EVENT/, "the persistent motion controller must receive the automatic advance signal");
  assert.match(controller, /lenis\?\.stop\(\)/, "the controller must halt Lenis before residual input can enter the next route");
  assert.match(caseScrollAdvance, /export function mountCaseScrollAdvance\(\): \(\) => void\s*\{[\s\S]*?return \(\) =>/, "case overscroll listeners must be disposed on route changes");
});

test("uses one directional shutter with staged local entry and a no-motion fallback", () => {
  const layout = readFileSync(layoutPath, "utf8");
  const controller = readFileSync(controllerPath, "utf8");
  const styles = readFileSync(stylesPath, "utf8");

  assert.match(layout, /document\.documentElement\.dataset\.pageMotion = "booting"/);
  assert.match(controller, /root\.dataset\.pageMotion = reducedMotion\.matches \? "entered" : "leaving"/);
  assert.match(controller, /root\.dataset\.pageMotion = "entering"/);
  assert.match(controller, /root\.dataset\.pageMotion = "entered"/);
  assert.match(styles, /html\[data-page-motion="booting"\] \[data-motion-reveal\]/);
  assert.match(styles, /html\[data-page-motion="entered"\] \[data-motion-reveal\]/);
  assert.match(styles, /animation:\s*editorial-reveal 680ms cubic-bezier\(0\.16, 1, 0\.3, 1\) backwards;/, "ordinary text reveals must release their clip-path after entry so link glyphs can travel outside the reveal bounds");
  assert.match(styles, /@keyframes editorial-reveal \{[\s\S]*?translate3d\(0, 16px, 0\);/, "reveals need a visible travel distance before easing into place");
  assert.match(styles, /\[data-motion-reveal="home-card"\]\[data-motion-revealed="true"\]\s*\{[\s\S]*?animation:\s*editorial-card-reveal 1040ms cubic-bezier\(0\.16, 1, 0\.3, 1\) var\(--scroll-reveal-delay\) both;/, "home cards must use a dedicated, longer scroll entry instead of finishing during the page load");
  assert.match(styles, /\[data-motion-reveal="home-card"\]\[data-motion-revealed="true"\] \.project-card__media\s*\{[\s\S]*?animation:\s*editorial-card-media-reveal 1180ms cubic-bezier\(0\.16, 1, 0\.3, 1\) var\(--scroll-reveal-delay\) both;/, "the card raster and its hover canvas host must travel together during entry");
  assert.match(styles, /\[data-motion-reveal="case-continuation"\]\s*\{[\s\S]*?--scroll-reveal-delay:\s*0ms;/, "case continuations need the animation delay variable defined so the browser does not discard their animation shorthand");
  assert.match(styles, /@keyframes editorial-card-reveal \{[\s\S]*?translate3d\(0, 72px, 0\) scale\(0\.985\);/, "home cards need a visibly larger entrance travel");
  assert.match(styles, /@keyframes editorial-scroll-reveal \{[\s\S]*?translate3d\(0, 52px, 0\);/, "continuation blocks need a visibly larger entrance travel");
  assert.match(styles, /::view-transition-group\(root\)\s*\{[\s\S]*?animation-duration:\s*680ms;/, "the shared page shutter must have enough duration to read");
  assert.match(styles, /editorial-shutter-out-forward 360ms cubic-bezier\(0\.65, 0, 0\.35, 1\) both/, "the outgoing page needs an explicit eased departure");
  assert.match(styles, /editorial-shutter-in-forward 540ms cubic-bezier\(0\.16, 1, 0\.3, 1\) both/, "the incoming page needs a longer eased arrival");
  assert.match(styles, /\.project-card:nth-child\(even\)\s*\{[\s\S]*?--scroll-reveal-delay:\s*120ms;/, "each card pair must retain a restrained stagger once it reaches the viewport");
  assert.match(styles, /\[data-motion-reveal="case-nav"\]/);
  assert.match(styles, /html\[data-page-motion-direction="forward"\]::view-transition-old\(root\)/);
  assert.match(styles, /html\[data-page-motion-direction="back"\]::view-transition-new\(root\)/);
  assert.match(styles, /@keyframes editorial-shutter-in-back \{[\s\S]*?clip-path:\s*inset\(0 0 100% 0\);/);
  assert.match(styles, /html\[data-astro-transition-fallback="old"\]\[data-page-motion="leaving"\]\[data-page-motion-direction="forward"\] body[\s\S]*?editorial-shutter-out-forward/);
  assert.match(styles, /html\[data-astro-transition-fallback="old"\]\[data-page-motion="leaving"\]\[data-page-motion-direction="back"\] body[\s\S]*?editorial-shutter-out-back/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\[data-motion-reveal\][\s\S]*?animation:\s*none/);
});

test("starts local entry only after the route shutter has finished", () => {
  const controller = readFileSync(controllerPath, "utf8");

  assert.match(controller, /routeEvent\.viewTransition\?\.finished/);
  assert.match(controller, /routeTransitionFinished\.then\(/);
  assert.match(controller, /const handlePageLoad = \(\) => \{[\s\S]*?mountPage\(\);[\s\S]*?enterAfterRouteTransition\(/);
});

test("keeps automatic case input blocked through the route shutter", () => {
  const controller = readFileSync(controllerPath, "utf8");
  const ready = controller.match(/const markAutoAdvanceRouteReady = \(\) => \{([\s\S]*?)\n  \};\n\n  const handleAutoAdvanceStart/)?.[1] ?? "";

  assert.match(ready, /routeTransitionFinished\.then\(/, "the residual-input shield must remain active until the Astro shutter has completed");
  assert.match(ready, /scheduleAutoAdvanceRelease\(\)/, "the quiet input window may begin only after the shutter finishes");
});

test("uses a vertical full-page handoff only for automatic case advance", () => {
  const controller = readFileSync(controllerPath, "utf8");
  const styles = readFileSync(stylesPath, "utf8");
  const beforePreparation = controller.match(/const handleBeforePreparation = \(event: Event\) => \{([\s\S]*?)\n  \};\n\n  const handleBeforeSwap/)?.[1] ?? "";
  const beforeSwap = controller.match(/const handleBeforeSwap = \(event: Event\) => \{([\s\S]*?)\n  \};\n\n  const resetDocumentScroll/)?.[1] ?? "";
  const pageLoad = controller.match(/const handlePageLoad = \(\) => \{([\s\S]*?)\n  \};\n\n  const handleReducedMotionChange/)?.[1] ?? "";

  assert.match(controller, /import \{ resolveRouteTransitionPresentation(?:, type RouteTransitionPresentation)? \} from "\.\.\/lib\/route-transition-presentation";/, "the route lifecycle must resolve snapshot presentation separately from scroll reset");
  assert.match(beforePreparation, /routePresentation = resolveRouteTransitionPresentation\(\{[\s\S]*?autoAdvance: pendingAutoAdvance/, "the explicit auto-advance event must select the special visual handoff");
  assert.match(controller, /const handleAutoAdvanceStart = \(\) => \{[\s\S]*?root\.dataset\.pageMotionHideOutgoingFooter = "true";/, "the old case footer must disappear before its transition snapshot is captured");
  assert.match(controller, /const handleAutoAdvanceAbort = \(\) => \{[\s\S]*?root\.removeAttribute\("data-page-motion-hide-outgoing-footer"\);/, "an aborted automatic route must restore the current case footer");
  assert.match(beforePreparation, /root\.dataset\.pageMotionAutoAdvance = "true"/, "the outgoing snapshot needs an auto-advance marker before Astro captures it");
  assert.match(beforeSwap, /routeEvent\.newDocument\.documentElement\.dataset\.pageMotion = routePresentation\.incomingMotion;/, "the incoming snapshot must already render the new page rather than start from its hidden entry state");
  assert.match(beforeSwap, /routeEvent\.newDocument\.documentElement\.dataset\.pageMotionAutoAdvance = "true"/, "the incoming snapshot must retain the auto-advance marker for its dedicated transition");
  assert.match(beforeSwap, /routeEvent\.newDocument\.documentElement\.removeAttribute\("data-page-motion-hide-outgoing-footer"\);/, "the footer-suppression marker must never carry into the next case");
  assert.match(pageLoad, /if \(routePresentation\.playLocalEntry\) \{\s*enterAfterRouteTransition\(routeId\);\s*\}/, "automatic routes must not run a second local entry after the view transition");
  assert.match(styles, /html\[data-page-motion-auto-advance="true"\]::view-transition-old\(root\)/, "automatic routes need a dedicated outgoing view-transition layer");
  assert.match(styles, /html\[data-page-motion-auto-advance="true"\]::view-transition-new\(root\)/, "automatic routes need a dedicated incoming view-transition layer");
  assert.match(styles, /html\[data-page-motion-auto-advance="true"\]::view-transition-group\(root\)\s*\{\s*animation-duration:\s*980ms/, "the automatic handoff needs a longer window than the ordinary route shutter");
  assert.match(styles, /html\[data-page-motion-auto-advance="true"\]::view-transition-old\(root\)\s*\{\s*z-index:\s*1;\s*mix-blend-mode:\s*normal;\s*animation:\s*editorial-auto-advance-out 980ms/, "the outgoing case must stay as an opaque layer while it leaves upward");
  assert.match(styles, /html\[data-page-motion-auto-advance="true"\]::view-transition-new\(root\)\s*\{\s*z-index:\s*0;\s*mix-blend-mode:\s*normal;\s*animation:\s*editorial-auto-advance-in 980ms/, "the incoming case must rise from below underneath the departing case");
  assert.match(styles, /html\[data-page-motion-auto-advance="true"\]::view-transition-image-pair\(root\)\s*\{\s*overflow:\s*clip;\s*isolation:\s*isolate;/, "the two root snapshots must be clipped and composited in isolation");
  assert.match(styles, /html\[data-page-motion-hide-outgoing-footer="true"\] \.case-footer\s*\{\s*visibility:\s*hidden;/, "only the outgoing case footer may be hidden before the automatic handoff");
  assert.match(styles, /@keyframes editorial-auto-advance-out/, "the outgoing automatic page needs its own upward motion instead of the normal shutter clip");
  assert.match(styles, /@keyframes editorial-auto-advance-in/, "the incoming automatic page needs to enter from below during the same handoff");
  assert.match(styles, /@keyframes editorial-auto-advance-out \{[\s\S]*?opacity:\s*1;[\s\S]*?transform:\s*translate3d\(0, 0, 0\);[\s\S]*?opacity:\s*1;[\s\S]*?transform:\s*translate3d\(0, -100svh, 0\);/, "the outgoing case must stay opaque and leave the viewport completely upward");
  assert.match(styles, /@keyframes editorial-auto-advance-in \{[\s\S]*?opacity:\s*1;[\s\S]*?transform:\s*translate3d\(0, 100svh, 0\);[\s\S]*?opacity:\s*1;[\s\S]*?transform:\s*translate3d\(0, 0, 0\);/, "the incoming case must stay opaque and enter from below without blending with the old footer");
});

test("resets the browser and Lenis after a route swap, including a case-to-home browser Back", () => {
  const controller = readFileSync(controllerPath, "utf8");
  const beforePreparation = controller.match(/const handleBeforePreparation = \(event: Event\) => \{([\s\S]*?)\n  \};\n\n  const handleBeforeSwap/)?.[1] ?? "";
  const beforeSwap = controller.match(/const handleBeforeSwap = \(event: Event\) => \{([\s\S]*?)\n  \};\n\n  const resetDocumentScroll/)?.[1] ?? "";
  const afterSwap = controller.match(/const handleAfterSwap = \(\) => \{([\s\S]*?)\n  \};\n\n  const handlePageLoad/)?.[1] ?? "";

  assert.match(controller, /import \{ shouldResetRouteScroll \} from "\.\.\/lib\/route-scroll-reset"/);
  assert.match(beforePreparation, /pendingSourcePageKind = getPageKind\(document\);/, "the controller needs the page it is leaving before deciding history behaviour");
  assert.match(beforeSwap, /const targetPageKind = routeEvent\.newDocument \? getPageKind\(routeEvent\.newDocument\) : undefined;/, "the final reset decision needs the incoming page kind");
  assert.match(beforeSwap, /shouldResetRouteScroll\(\{[\s\S]*?from: pendingSourcePageKind,[\s\S]*?to: targetPageKind/, "case-to-home history traversal must deliberately override native restoration");
  assert.match(afterSwap, /if \(resetScrollAfterSwap\) \{[\s\S]*?resetDocumentScroll\(\);[\s\S]*?resetScrollAfterSwap = false;/, "a route swap must reset the native browser position as well as Lenis before fresh input resumes");
});

test("reasserts the top after the new route has loaded when the route resolver requests it", () => {
  const controller = readFileSync(controllerPath, "utf8");
  const pageLoad = controller.match(/const handlePageLoad = \(\) => \{([\s\S]*?)\n  \};\n\n  const handleReducedMotionChange/)?.[1] ?? "";

  assert.match(pageLoad, /if \(resetScrollAfterPageLoad\) \{[\s\S]*?resetDocumentScroll\(\);[\s\S]*?resetScrollAfterPageLoad = false;/, "a pushed route must reset again after Astro has finished loading its new document");
});

test("holds Lenis until a scroll-resetting route has settled", () => {
  const controller = readFileSync(controllerPath, "utf8");
  const beforePreparation = controller.match(/const handleBeforePreparation = \(event: Event\) => \{([\s\S]*?)\n  \};\n\n  const handleBeforeSwap/)?.[1] ?? "";
  const beforeSwap = controller.match(/const handleBeforeSwap = \(event: Event\) => \{([\s\S]*?)\n  \};\n\n  const resetDocumentScroll/)?.[1] ?? "";
  const pageLoad = controller.match(/const handlePageLoad = \(\) => \{([\s\S]*?)\n  \};\n\n  const handleReducedMotionChange/)?.[1] ?? "";

  assert.match(beforePreparation, /if \(resetRouteScroll\) \{[\s\S]*?holdRouteScroll\((?:routeId|pageLoadRouteId)\);/, "residual Lenis momentum must be paused before a pushed route starts swapping");
  assert.match(beforeSwap, /if \(resetRouteScroll\) \{\s*holdRouteScroll\(pageLoadRouteId\);/, "history traversal into or out of Home must pause Lenis once the target page is known");
  assert.match(pageLoad, /if \(routeScrollLockId === routeId\) \{\s*settleRouteScroll\(routeId\);/, "the new page must not resume Lenis before its final top reset");
  assert.match(controller, /routeTransitionFinished\.then\(settle, settle\)/, "the final top reset must wait for the shutter to finish");
  assert.match(controller, /window\.requestAnimationFrame\(\(\) => \{[\s\S]*?resetDocumentScroll\(\);[\s\S]*?releaseRouteScroll\(routeId\);/, "a final frame must put both browser and Lenis at the top before input resumes");
});

test("returns a hard initial load or reload to the top without changing history traversal restoration", () => {
  const controller = readFileSync(controllerPath, "utf8");
  const pageLoad = controller.match(/const handlePageLoad = \(\) => \{([\s\S]*?)\n  \};\n\n  const handleReducedMotionChange/)?.[1] ?? "";

  assert.match(controller, /let resetInitialScroll = true;/, "the controller must distinguish the first document load from an internal route swap");
  assert.match(controller, /const resetDocumentScroll = \(\) => \{[\s\S]*?window\.scrollTo\(0, 0\);[\s\S]*?lenis\?\.scrollTo\(0, \{ immediate: true, force: true \}\);/, "a hard load must clear both the browser and Lenis scroll positions");
  assert.match(pageLoad, /if \(!routePending\) \{[\s\S]*?if \(resetInitialScroll && !window\.location\.hash\) \{[\s\S]*?resetDocumentScroll\(\);[\s\S]*?resetInitialScroll = false;[\s\S]*?return;/, "the initial document load must reset to the top while preserving intentional hash deep links");
  assert.match(pageLoad, /routePending = false;[\s\S]*?resetInitialScroll = false;[\s\S]*?mountPage\(\);/, "route swaps must remain separate from the initial-load reset path");
});

test("cleans active effect layers before a route snapshot and cancels unfinished entry", () => {
  const controller = readFileSync(controllerPath, "utf8");
  const beforePreparation = controller.match(/const handleBeforePreparation = \(event: Event\) => \{([\s\S]*?)\n  \};\n\n  const handleBeforeSwap/)?.[1] ?? "";
  const beforeSwap = controller.match(/const handleBeforeSwap = \(event: Event\) => \{([\s\S]*?)\n  \};\n\n  const handleAfterSwap/)?.[1] ?? "";

  assert.match(beforePreparation, /stopEntry\(\);/);
  assert.match(beforePreparation, /unmountPage\(\);/);
  assert.doesNotMatch(beforeSwap, /unmountPage\(/);
});

test("defers continuation stories and home cards until they enter the viewport", () => {
  const controller = readFileSync(controllerPath, "utf8");
  const detail = readFileSync(detailPath, "utf8");
  const styles = readFileSync(stylesPath, "utf8");
  const hiddenContinuation = styles.match(/html\[data-page-motion-scroll-reveals="enhanced"\]\[data-page-motion="entered"\] \[data-motion-reveal="case-continuation"\]:not\(\[data-motion-revealed="true"\]\) \{([\s\S]*?)\n  \}/)?.[1] ?? "";

  assert.match(detail, /data-motion-reveal="case-continuation"/);
  assert.match(controller, /IntersectionObserver/);
  assert.match(controller, /\[data-motion-reveal="case-continuation"\], \[data-motion-reveal="home-card"\]/, "the home cards must be observed rather than only staged at initial page entry");
  assert.match(controller, /rootMargin: "0px 0px -5% 0px", threshold: 0\.14/, "scroll reveals must begin once a visible portion reaches the viewport, not while still offscreen");
  assert.match(controller, /dataset\.motionRevealed = "true"/);
  assert.match(styles, /\[data-motion-reveal="case-continuation"\]\[data-motion-revealed="true"\]/);
  assert.match(styles, /\[data-motion-reveal="home-card"\]\[data-motion-revealed="true"\]/);
  assert.doesNotMatch(hiddenContinuation, /clip-path:/, "the observer target cannot be clipped out of its own viewport");
});

test("preserves the shared controller across a BFCache restore", () => {
  const controller = readFileSync(controllerPath, "utf8");

  assert.match(controller, /const handlePageHide = \(event: PageTransitionEvent\) => \{[\s\S]*?if \(event\.persisted\) return;[\s\S]*?dispose\(\);/);
  assert.match(controller, /const handlePageShow = \(event: PageTransitionEvent\) => \{[\s\S]*?if \(!event\.persisted \|\| disposed\) return;[\s\S]*?lenis\?\.resize\(\);/);
  assert.match(controller, /window\.addEventListener\("pageshow", handlePageShow\)/);
});

test("keeps scroll-reveal content visible until the controller has enhanced it", () => {
  const controller = readFileSync(controllerPath, "utf8");
  const styles = readFileSync(stylesPath, "utf8");

  assert.match(controller, /root\.dataset\.pageMotionScrollReveals = "enhanced"/);
  assert.match(controller, /root\.removeAttribute\("data-page-motion-scroll-reveals"\)/);
  assert.match(styles, /html\[data-page-motion-scroll-reveals="enhanced"\]\[data-page-motion="entered"\] \[data-motion-reveal="case-continuation"\]/);
});
