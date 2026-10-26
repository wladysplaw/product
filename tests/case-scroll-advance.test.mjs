import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const decisionPath = path.join(projectRoot, "src/lib/case-scroll-advance.ts");

test("advances a case only after deliberate downward overscroll at the document end", async () => {
  assert.ok(existsSync(decisionPath), "case scroll advance needs a dedicated decision boundary");

  const { shouldAdvanceCase } = await import(pathToFileURL(decisionPath).href);

  assert.equal(shouldAdvanceCase({ atEnd: false, deltaY: 160, accumulatedDelta: 0, navigating: false }), false, "reaching the bottom must not itself navigate");
  assert.equal(shouldAdvanceCase({ atEnd: true, deltaY: -160, accumulatedDelta: 120, navigating: false }), false, "upward input at the end must never advance");
  assert.equal(shouldAdvanceCase({ atEnd: true, deltaY: 32, accumulatedDelta: 63, navigating: false }), false, "a short inertial tail must not navigate");
  assert.equal(shouldAdvanceCase({ atEnd: true, deltaY: 33, accumulatedDelta: 63, navigating: false }), true, "continued downward input after the end must advance");
  assert.equal(shouldAdvanceCase({ atEnd: true, deltaY: 160, accumulatedDelta: 0, navigating: true }), false, "a transition already in progress must remain single-shot");
});
