import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const coordinatesPath = path.join(projectRoot, "src/lib/displacement-coordinates.ts");

test("maps an upper DOM pointer into the upper texture row", async () => {
  assert.ok(existsSync(coordinatesPath), "displacement needs an explicit DOM-to-texture Y mapping");

  const { toTextureGridY } = await import(pathToFileURL(coordinatesPath).href);

  assert.equal(toTextureGridY(0.25, 8), 2, "a pointer one quarter from the DOM top must drive the matching upper texture row");
});

test("maps upward DOM motion into upward texture velocity", async () => {
  assert.ok(existsSync(coordinatesPath), "displacement needs an explicit DOM-to-texture Y mapping");

  const { toTextureVelocityY } = await import(pathToFileURL(coordinatesPath).href);

  assert.equal(toTextureVelocityY(-0.12), 0.12, "moving the pointer up must push texture content up");
  assert.equal(toTextureVelocityY(0.12), -0.12, "moving the pointer down must push texture content down");
});
