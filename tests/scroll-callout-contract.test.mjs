import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const layoutPath = path.join(projectRoot, "src/layouts/BaseLayout.astro");
const controllerPath = path.join(projectRoot, "src/scripts/page-motion.ts");
const siteFooterPath = path.join(projectRoot, "src/components/SiteFooter.astro");
const caseFooterPath = path.join(projectRoot, "src/components/CaseFooter.astro");
const runtimePath = path.join(projectRoot, "src/scripts/scroll-callout.ts");
const geometryPath = path.join(projectRoot, "src/lib/scroll-callout-stage.ts");
const stylesPath = path.join(projectRoot, "src/styles/global.css");

test("maps the final card edge into a 20–80 viewport CTA field", async () => {
  assert.equal(existsSync(geometryPath), true, "the callout needs a pure geometry resolver");

  const { resolveScrollCalloutStage } = await import("../src/lib/scroll-callout-stage.ts");

  assert.deepEqual(
    resolveScrollCalloutStage({ regionTop: 800, viewportHeight: 1000 }),
    { stageHeight: 200, expanded: false },
    "when the card reaches the lower fifth, the small CTA occupies only the remaining fifth"
  );
  assert.deepEqual(
    resolveScrollCalloutStage({ regionTop: 500, viewportHeight: 1000 }),
    { stageHeight: 500, expanded: false },
    "the CTA remains centred in the exact white field while the card travels upward"
  );
  assert.deepEqual(
    resolveScrollCalloutStage({ regionTop: 200, viewportHeight: 1000 }),
    { stageHeight: 800, expanded: true },
    "the card settling in the top fifth is the discrete enlargement trigger"
  );
  assert.deepEqual(
    resolveScrollCalloutStage({ regionTop: 200.25, viewportHeight: 1000 }),
    { stageHeight: 800, expanded: true },
    "sub-pixel layout rounding at the final 20–80 boundary must still trigger the large CTA and symbol assembly"
  );
  assert.deepEqual(
    resolveScrollCalloutStage({ regionTop: 216, viewportHeight: 1000 }),
    { stageHeight: 784, expanded: true },
    "the large CTA and symbol assembly should begin slightly before the card reaches its final top boundary"
  );
  assert.deepEqual(
    resolveScrollCalloutStage({ regionTop: -120, viewportHeight: 1000 }),
    { stageHeight: 800, expanded: true },
    "the final CTA field never grows past the lower four fifths"
  );
  assert.deepEqual(
    resolveScrollCalloutStage({ regionTop: 217, viewportHeight: 1000 }),
    { stageHeight: 783, expanded: false },
    "scrolling back across the threshold restores the compact CTA state"
  );
});

test("keeps final cards, CTA and footer marks in one 20–80 geometry", () => {
  const layout = readFileSync(layoutPath, "utf8");
  const controller = readFileSync(controllerPath, "utf8");
  const siteFooter = readFileSync(siteFooterPath, "utf8");
  const caseFooter = readFileSync(caseFooterPath, "utf8");
  const runtime = readFileSync(runtimePath, "utf8");
  const styles = readFileSync(stylesPath, "utf8");

  assert.match(siteFooter, /<section class="scroll-callout-region" data-scroll-callout-region>/);
  assert.match(caseFooter, /<section class="scroll-callout-region" data-scroll-callout-region>/);
  assert.match(siteFooter, /data-scroll-callout-stage/);
  assert.match(caseFooter, /data-scroll-callout-stage/);
  assert.match(layout, /import \{ startPageMotion \} from "\.\.\/scripts\/page-motion"/);
  assert.match(controller, /import \{ mountScrollCallouts \} from "\.\/scroll-callout"/);
  assert.match(controller, /mountScrollCallouts\(\)/);
  assert.match(runtime, /import \{ resolveScrollCalloutStage \} from "\.\.\/lib\/scroll-callout-stage"/);
  assert.match(runtime, /const \{ stageHeight, expanded \} = resolveScrollCalloutStage\(/);
  assert.match(runtime, /window\.addEventListener\("scroll", schedule, \{ passive: true \}\)/);
  assert.match(runtime, /requestAnimationFrame/);
  assert.match(runtime, /data-scroll-callout-state/);
  assert.match(runtime, /is-scroll-callout-expanded/);
  assert.match(runtime, /function runGlyphScramble\(/, "the symbol sequence must run once when the threshold is crossed");
  assert.match(runtime, /if \(expanded !== callout\.expanded\)/, "scrolling within either field must not continuously resize the type");
  assert.match(runtime, /SCRAMBLE_SYMBOLS/, "the threshold animation needs a deliberate editorial symbol cycle");
  assert.match(runtime, /function setGlyphCharacter\([\s\S]*?glyph\.face\.textContent = character;[\s\S]*?glyph\.plates\.forEach\(/, "the visible and chromatic glyph layers must receive the same temporary symbol");
  assert.match(runtime, /setGlyphCharacter\(glyph, nextSymbol\);/);
  assert.doesNotMatch(runtime, /const stagedProgress =/, "CTA scale must not be derived from continuous scroll progress");
  assert.doesNotMatch(runtime, /const finalSpace =/, "CTA fields derive from the card boundary, not interpolated padding");
  assert.doesNotMatch(runtime, /--scroll-callout-space/, "the stage must use one measured field height rather than padding growth");
  assert.match(styles, /\.scroll-callout-region\s*\{[^}]*\bmin-height:\s*80svh/, "the ending state must stop with cards in the upper fifth");
  assert.match(styles, /\.scroll-callout-region > \.site-footer,[\s\S]*?\.scroll-callout-region > \.case-footer\s*\{[^}]*\bposition:\s*sticky;[^}]*\btop:\s*20svh;[^}]*\bheight:\s*80svh;[^}]*\bmin-height:\s*80svh;/);
  assert.match(styles, /\.scroll-callout-stage\s*\{[\s\S]*?height:\s*var\(--scroll-callout-stage-height\);[\s\S]*?place-items:\s*center;[\s\S]*?padding-block:\s*0;/, "the CTA must centre itself in the white field instead of staying at its top");
  assert.match(styles, /\.scroll-callout\.is-scroll-callout-ready\s*\{[\s\S]*?transition:\s*font-size/, "the type should enlarge with one timed easing after the threshold");
  assert.match(styles, /\.scroll-callout-region \.footer-marks\s*\{[\s\S]*?top:\s*calc\(var\(--scroll-callout-stage-height\) - 33px\);/, "footer marks must remain at the bottom of the currently visible white field");
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.scroll-callout-stage\s*\{[\s\S]*?height:\s*var\(--scroll-callout-stage-height\);/, "reduced-motion users retain the same 20–80 geometry");
});
