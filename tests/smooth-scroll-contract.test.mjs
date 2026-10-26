import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const baseLayout = readFileSync(path.resolve(testDirectory, "../src/layouts/BaseLayout.astro"), "utf8");
const motionController = readFileSync(path.resolve(testDirectory, "../src/scripts/page-motion.ts"), "utf8");

test("uses inertial wheel scrolling without overriding a reduced-motion preference", () => {
  assert.match(baseLayout, /startPageMotion\(\)/, "the layout needs to start the persistent motion controller");
  assert.match(motionController, /import Lenis from "lenis"/, "the site needs an inertial scroll engine for wheel input");
  assert.match(motionController, /window\.matchMedia\("\(prefers-reduced-motion: reduce\)"\)/, "system reduced-motion preference must gate the enhancement");
  assert.match(motionController, /new Lenis\(\{[\s\S]*smoothWheel: true/, "the engine must smooth wheel input");
  assert.match(motionController, /requestAnimationFrame\(frame\)/, "the engine must advance through animation frames");
});
