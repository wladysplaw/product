import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const gridPath = path.join(projectRoot, "src/components/ProjectGrid.astro");
const jumperPath = path.join(projectRoot, "src/components/PortfolioJumper.astro");
const spritePath = path.join(projectRoot, "public/assets/jumper.svg");
const stylesPath = path.join(projectRoot, "src/styles/global.css");

test("mounts the main-site jumper above the complete home project grid", () => {
  const grid = readFileSync(gridPath, "utf8");
  const jumper = readFileSync(jumperPath, "utf8");

  assert.match(grid, /data-portfolio-jumper-host/, "the sprite must use the complete project grid as its host");
  assert.match(grid, /<PortfolioJumper\s*\/>/, "the home grid must mount the jumper runtime");
  assert.equal(existsSync(spritePath), true, "the six-frame sprite must be published with the product site");
  assert.match(readFileSync(spritePath, "utf8"), /<svg width="54" height="12"/, "the copied sprite must preserve its 6 × 9 px frame geometry");
  assert.match(jumper, /const frameWidth = 9 \* spriteScale;/, "the runtime must keep the original 9 px sprite frames");
  assert.match(jumper, /const frameHeight = 12 \* spriteScale;/, "the runtime must keep the original 12 px sprite frames");
  assert.match(jumper, /const frameCount = 6;/, "the runtime must keep the original six-frame animation");
  assert.match(jumper, /assets\/jumper\.svg/, "the runtime must load the copied local sprite");
  assert.match(jumper, /random\(4000, 10000\)/, "the original delayed appearance rhythm must remain intact");
  assert.match(jumper, /document\.addEventListener\("astro:before-swap", unmountPortfolioJumper\)/, "the sprite must leave with the home grid during an Astro route transition");
  assert.match(jumper, /document\.addEventListener\("astro:page-load", mountPortfolioJumperForRoute\)/, "the sprite must return when the home grid re-enters after navigation");
});

test("launches from behind the top-right card, then returns behind it", () => {
  const jumper = readFileSync(jumperPath, "utf8");
  const styles = readFileSync(stylesPath, "utf8");
  const attach = jumper.match(/const attachToPortfolio = \(\) => \{[\s\S]*?\n  \};/);

  assert.ok(attach, "the card-bound spawn setup must be inspectable");
  assert.match(jumper, /const targetCard = cards\[1\] \?\? cards\[0\];/, "desktop appearances must be anchored to the first right-hand card");
  assert.match(jumper, /random\(0\.06, 0\.60\)/, "most appearances must begin across the left and middle of that card");
  assert.match(jumper, /random\(0\.60, 0\.97\)/, "a smaller share of appearances may reach the right side of that card");
  assert.match(attach[0], /const y = cardBox\.top - gridBox\.top - frameHeight - peakOffset;/, "the copied source axis must place the hidden frame inside the card and its peak directly above the card edge");
  assert.match(attach[0], /jumper\.style\.opacity = "1";/, "the source lifecycle must prepare the sprite in the same synchronous task as its position");
  assert.match(jumper, /const peakY = 0;/, "the original main-site peak must stay on its source axis");
  assert.match(jumper, /await animateY\(hiddenY, peakY, 420, "cubic-bezier\(0\.16, 1, 0\.3, 1\)"\);\s*await playFrames\(\[5, 4, 3, 2, 1, 0\], 48\);\s*await wait\(random\(200, 900\)\);/s, "the initial rise must keep the original frame order and timing");
  assert.match(jumper, /await playFrames\(\[0, 1, 2, 3, 4, 5\], 38\);\s*await animateY\(peakY, hiddenY, 260, "cubic-bezier\(0\.55, 0, 1, 0\.45\)"\);/s, "the original hide sequence must return the sprite behind the card");
  assert.doesNotMatch(jumper, /launchApexY/, "the product copy must not introduce a second launch axis");
  assert.match(styles, /\.project-grid\s*\{[^}]*isolation:\s*isolate;/s, "the grid must establish one local stack for the sprite and cards");
  assert.match(styles, /\.portfolio-jumper\s*\{[^}]*z-index:\s*0;/s, "the sprite must sit behind card surfaces");
  assert.match(styles, /\.project-card\s*\{[^}]*z-index:\s*1;/s, "card surfaces must paint over the descending sprite");
});
