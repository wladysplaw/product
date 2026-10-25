import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const builtHome = path.resolve(testDirectory, "../dist/index.html");

test("built home is safe to publish below /product/", () => {
  assert.equal(existsSync(builtHome), true, "build must emit dist/index.html");

  const html = readFileSync(builtHome, "utf8");

  assert.equal(html.includes("localhost"), false, "built HTML must not point to a local server");
  assert.equal(html.includes("figma.com/api/mcp"), false, "built HTML must not point to Figma temporary assets");
  assert.match(html, /(?:href|src)="\/product\/(?:_astro\/|[^\"]+)/, "assets or links must include /product/");
});
