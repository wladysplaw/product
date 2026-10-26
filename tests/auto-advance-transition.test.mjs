import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const presentationPath = path.join(projectRoot, "src/lib/route-transition-presentation.ts");

test("prepares a complete incoming snapshot for an automatic case handoff", async () => {
  assert.equal(
    existsSync(presentationPath),
    true,
    "automatic case handoff needs a presentation decision that differs from an ordinary route transition"
  );

  const { resolveRouteTransitionPresentation } = await import(pathToFileURL(presentationPath).href);

  assert.deepEqual(
    resolveRouteTransitionPresentation({ autoAdvance: true, reducedMotion: false }),
    { incomingMotion: "entered", playLocalEntry: false, useSequentialShutter: true },
    "the new page must already be rendered in the incoming snapshot so it can fade in without a second reset"
  );
  assert.deepEqual(
    resolveRouteTransitionPresentation({ autoAdvance: false, reducedMotion: false }),
    { incomingMotion: "entering", playLocalEntry: true, useSequentialShutter: false },
    "ordinary navigation must retain the existing staged local entry"
  );
  assert.deepEqual(
    resolveRouteTransitionPresentation({ autoAdvance: true, reducedMotion: true }),
    { incomingMotion: "entered", playLocalEntry: false, useSequentialShutter: false },
    "reduced motion must retain the instant route change without visual shutter animation"
  );
});
