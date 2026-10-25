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

  const resourceUrls = [...html.matchAll(/\b(?:href|src)="([^\"]+)"/g)].map((match) => match[1]);
  const siteOrigin = "https://wladysplaw.github.io";

  for (const resourceUrl of resourceUrls) {
    if (resourceUrl.startsWith("/")) {
      assert.ok(
        resourceUrl.startsWith("/product/"),
        `root-relative resource must stay below /product/: ${resourceUrl}`
      );
    }

    if (resourceUrl.startsWith(siteOrigin)) {
      assert.ok(
        resourceUrl.startsWith(`${siteOrigin}/product/`),
        `same-origin resource must stay below /product/: ${resourceUrl}`
      );
    }
  }

  assert.ok(resourceUrls.some((url) => url.startsWith("/product/")), "build must emit base-prefixed resources");
});
