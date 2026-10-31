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
