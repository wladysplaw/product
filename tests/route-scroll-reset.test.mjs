import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const resolverPath = path.join(projectRoot, "src/lib/route-scroll-reset.ts");

test("resets history traversal between Home and a case while preserving case reading positions", async () => {
  assert.equal(existsSync(resolverPath), true, "route scroll restoration needs a pure route-aware resolver");

  const { shouldResetRouteScroll } = await import("../src/lib/route-scroll-reset.ts");

  assert.equal(shouldResetRouteScroll({ navigationType: "push", from: "home", to: "case" }), true);
  assert.equal(shouldResetRouteScroll({ navigationType: "replace", from: "case", to: "home" }), true);
  assert.equal(shouldResetRouteScroll({ navigationType: "traverse", from: "case", to: "home" }), true, "browser Back from a case must return to the top of Home");
  assert.equal(shouldResetRouteScroll({ navigationType: "traverse", from: "case", to: "case" }), false, "case history may preserve its reading position");
  assert.equal(shouldResetRouteScroll({ navigationType: "traverse", from: "home", to: "case" }), true, "browser Forward from Home into a case must land at the top");
});
