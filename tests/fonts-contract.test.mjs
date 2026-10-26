import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const globalStyles = readFileSync(path.join(projectRoot, "src/styles/global.css"), "utf8");
const requiredFontAssets = [
  "src/assets/fonts/twk-lausanne-350.otf",
  "src/assets/fonts/twk-lausanne-400.otf",
  "src/assets/fonts/twk-lausanne-450.otf",
  "src/assets/fonts/twk-lausanne-600.otf",
  "src/assets/fonts/serrif-compressed-regular.otf",
  "src/assets/fonts/serrif-compressed-semibold.otf"
];

test("bundles the Figma typefaces instead of relying on installed system fonts", () => {
  for (const relativePath of requiredFontAssets) {
    assert.equal(existsSync(path.join(projectRoot, relativePath)), true, `${relativePath} must ship with the site`);
  }

  assert.match(globalStyles, /@font-face\s*\{[^}]*font-family:\s*"TWK Lausanne";[^}]*font-weight:\s*350;/, "TWK Lausanne 350 must have a shipped font face");
  assert.match(globalStyles, /@font-face\s*\{[^}]*font-family:\s*"TWK Lausanne";[^}]*font-weight:\s*450;/, "TWK Lausanne 450 must have a shipped font face");
  assert.match(globalStyles, /@font-face\s*\{[^}]*font-family:\s*"Serrif Compressed-TRIAL";[^}]*font-weight:\s*400;/, "Serrif regular must have a shipped font face");
  assert.match(globalStyles, /@font-face\s*\{[^}]*font-family:\s*"Serrif Compressed-TRIAL";[^}]*font-weight:\s*600;/, "Serrif semibold must have a shipped font face");
});

test("uses the owner-corrected 350 weight wherever the site previously used 300", () => {
  assert.doesNotMatch(globalStyles, /font-weight:\s*300;/, "no site typography rule may retain the superseded 300 weight");
});
