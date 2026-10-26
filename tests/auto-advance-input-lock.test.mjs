import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const lockPath = path.join(testDirectory, "..", "src/lib/auto-advance-input-lock.ts");

test("holds automatic case advancement until residual input has gone quiet", async () => {
  const { createAutoAdvanceInputLock } = await import(pathToFileURL(lockPath).href);
  const lock = createAutoAdvanceInputLock(180);

  lock.lock(1_000);

  assert.equal(lock.isHeld(), true);
  assert.equal(lock.canRelease(1_179), false, "the initial quiet window must hold the next page at its top");

  lock.noteInput(1_130);

  assert.equal(lock.canRelease(1_309), false, "each remaining wheel event must restart the quiet window");
  assert.equal(lock.canRelease(1_310), true, "the lock may release only after the latest input has settled");

  lock.release();

  assert.equal(lock.isHeld(), false);
});
