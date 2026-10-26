import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const layoutPath = path.join(projectRoot, "src/layouts/BaseLayout.astro");
const controllerPath = path.join(projectRoot, "src/scripts/page-motion.ts");
const scriptPath = path.join(projectRoot, "src/scripts/rising-ink.ts");
const stylesPath = path.join(projectRoot, "src/styles/global.css");
const homePath = path.join(projectRoot, "src/pages/index.astro");
const detailPath = path.join(projectRoot, "src/components/ProjectDetail.astro");
const caseFooterPath = path.join(projectRoot, "src/components/CaseFooter.astro");
const siteFooterPath = path.join(projectRoot, "src/components/SiteFooter.astro");

test("applies rising ink only to text links, never project cards", () => {
  const home = readFileSync(homePath, "utf8");
  const detail = readFileSync(detailPath, "utf8");
  const caseFooter = readFileSync(caseFooterPath, "utf8");
  const siteFooter = readFileSync(siteFooterPath, "utf8");

  assert.match(home, /<a data-rising-ink href="https:\/\/t\.me\/saysskyy"/);
  assert.match(detail, /<a data-rising-ink data-page-motion-direction="back" href=\{basePath\}>back<\/a>/);
  assert.match(detail, /<a data-rising-ink href=\{nextHref\}>next<\/a>/);
  assert.match(caseFooter, /<a data-rising-ink data-scroll-callout class="case-footer__next"/);
  assert.match(siteFooter, /<a data-rising-ink data-scroll-callout class="site-footer__talk"/);
});

test("rising ink uses pointer-driven letter lifts and keeps a native accessibility fallback", () => {
  const layout = readFileSync(layoutPath, "utf8");
  const controller = readFileSync(controllerPath, "utf8");
  const styles = readFileSync(stylesPath, "utf8");

  assert.ok(existsSync(scriptPath), "rising ink runtime must exist");

  const runtime = readFileSync(scriptPath, "utf8");

  assert.match(layout, /import \{ startPageMotion \} from "\.\.\/scripts\/page-motion"/);
  assert.match(controller, /import \{ mountRisingInk \} from "\.\/rising-ink"/);
  assert.match(controller, /mountRisingInk\(\)/);
  assert.match(runtime, /prefers-reduced-motion: reduce/);
  assert.match(runtime, /\(hover: hover\) and \(pointer: fine\)/);
  assert.match(runtime, /aria-label/);
  assert.match(runtime, /rising-ink__glyph/);
  assert.match(runtime, /pointermove/);
  assert.match(runtime, /requestAnimationFrame/);
  assert.match(styles, /\.rising-ink\s*\{[\s\S]*?perspective:/);
  assert.match(styles, /\.rising-ink__glyph\s*\{[\s\S]*?transform-style:\s*preserve-3d/);
  assert.match(styles, /\.rising-ink__plate\s*\{[\s\S]*?color:\s*var\(--rising-ink-far\)/);
  assert.match(styles, /--interaction-channel-red:\s*#ff1744;/, "links must use a saturated electric red interference channel");
  assert.match(styles, /--interaction-channel-cyan:\s*#00e5ff;/, "links must use a saturated electric cyan interference channel");
  assert.match(styles, /--interaction-channel-blue:\s*#2962ff;/, "links must use a saturated electric blue interference channel");
  assert.doesNotMatch(styles, /interaction-channel-magenta|interaction-channel-yellow|interaction-channel-green/, "the old decorative palette does not match the card's red-cyan-blue separation");
  assert.match(styles, /\.rising-ink__plate:nth-child\(1\)\s*\{[\s\S]*?color:\s*var\(--interaction-channel-red\)/);
  assert.match(styles, /\.rising-ink__plate:nth-child\(2\)\s*\{[\s\S]*?color:\s*var\(--interaction-channel-cyan\)/);
  assert.match(styles, /\.rising-ink__plate:nth-child\(3\)\s*\{[\s\S]*?color:\s*var\(--interaction-channel-blue\)/);
  assert.doesNotMatch(styles, /\.rising-ink__plate:nth-child\(4\)/, "the text effect must use three RGB channels rather than a fourth decorative copy");
  assert.match(styles, /\.rising-ink__plate\s*\{[\s\S]*?opacity:\s*0/, "colour plates must be invisible until the pointer interaction starts");
  assert.match(styles, /\.home__contact-links a\[data-rising-ink\],\s*\.service-list__link\[data-rising-ink\]\s*\{[\s\S]*?--rising-ink-lift-scale:\s*1\.65;[\s\S]*?--rising-ink-chroma-scale:\s*1\.9;[\s\S]*?--rising-ink-opacity-scale:\s*1\.75;/, "small text links need a clearly stronger interaction field than editorial navigation links");
  assert.match(runtime, /const PLATE_COUNT = 3;/, "the text effect must use only the three RGB interference channels");
  assert.match(runtime, /private readonly liftScale: number;/, "each link effect must retain its own lift scale");
  assert.match(runtime, /private readonly chromaScale: number;/, "each link effect must retain its own colour scale");
  assert.match(runtime, /private readonly opacityScale: number;/, "each link effect must retain its own brightness scale");
  assert.match(runtime, /this\.liftScale = Number\.parseFloat\(computedStyle\.getPropertyValue\("--rising-ink-lift-scale"\)\) \|\| 1;/, "the text effect must read a per-link lift scale");
  assert.match(runtime, /this\.chromaScale = Number\.parseFloat\(computedStyle\.getPropertyValue\("--rising-ink-chroma-scale"\)\) \|\| 1;/, "the text effect must read a per-link colour scale");
  assert.match(runtime, /this\.opacityScale = Number\.parseFloat\(computedStyle\.getPropertyValue\("--rising-ink-opacity-scale"\)\) \|\| 1;/, "the text effect must read a per-link brightness scale");
  assert.match(runtime, /const lift = fontSize \* 0\.48 \* this\.liftScale \* influence;/, "small links must lift farther while retaining the existing distance field");
  assert.match(runtime, /const channel = index - \(glyph\.plates\.length - 1\) \/ 2;/, "the RGB layers need opposite channel positions rather than one stacked direction");
  assert.match(runtime, /const chromaSpread = Math\.max\(0\.5, glyph\.lift\.current \* 0\.09\) \* this\.chromaScale;/, "the RGB fringe must remain compact around the main glyph while small links can amplify it");
  assert.match(runtime, /const depthMagnitude = Math\.hypot\(glyph\.depthX\.current, glyph\.depthY\.current\);/, "the colour channels must use the live motion direction");
  assert.match(runtime, /const lateralX = depthMagnitude > 0\.01 \? \(glyph\.depthY\.current \/ depthMagnitude\) \* channel \* chromaSpread : 0;/, "the colour channels must separate perpendicular to motion");
  assert.match(runtime, /const lateralY = depthMagnitude > 0\.01 \? \(-glyph\.depthX\.current \/ depthMagnitude\) \* channel \* chromaSpread : 0;/, "the colour channels must stay balanced around the glyph");
  assert.match(runtime, /const opacity = clamp\(\(glyph\.lift\.current \/ 12\) \* \(0\.3 \+ \(1 - Math\.abs\(channel\)\) \* 0\.04\) \* this\.opacityScale, 0, 0\.46\);/, "the compact colour fringe must remain clearly bright across all RGB channels");
  assert.match(runtime, /const extrusionY = glyph\.lift\.current \* fraction \* 0\.12;/, "the coloured text must stay close to the glyph rather than breaking into a long stack");
  assert.match(runtime, /const zOffset = -fraction \* Math\.max\(0\.5, glyph\.lift\.current \* 0\.12\);/, "the colour layers must keep shallow depth while they brighten");
});
