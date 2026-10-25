import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const builtHome = path.resolve(testDirectory, "../dist/index.html");

test("built home exposes the agreed skeleton landmarks without a fictitious project", () => {
  const html = readFileSync(builtHome, "utf8");
  const emptySurfaceCount = (html.match(/data-testid="empty-project-surface"/g) ?? []).length;

  assert.match(html, /<main[^>]+id="main-content"/, "home must retain a semantic main landmark");
  assert.match(html, /data-testid="services"/, "home must render the services grid landmark");
  assert.match(html, /href="https:\/\/t\.me\/saysskyy"/, "Let’s Talk must use the approved Telegram URL");
  assert.equal(emptySurfaceCount, 2, "empty catalogue must retain exactly two neutral grey surfaces");
});
