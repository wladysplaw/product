import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const distDirectory = path.join(projectRoot, "dist");
const cloudflareAnalyticsToken = "02fee581531d4823bc152e79f0cbbb73";

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return htmlFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith(".html") ? [entryPath] : [];
  });
}

test("production pages send visits to the shared Cloudflare Web Analytics site", () => {
  assert.equal(existsSync(distDirectory), true, "build must emit a dist directory");

  const pages = htmlFiles(distDirectory);

  assert.ok(pages.length > 0, "the build must emit pages to measure");

  for (const htmlFile of pages) {
    const html = readFileSync(htmlFile, "utf8");

    assert.match(html, /https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js/, `${htmlFile} must load the Cloudflare beacon`);
    assert.match(html, new RegExp(`data-cf-beacon=["'][^"']*${cloudflareAnalyticsToken}[^"']*["']`), `${htmlFile} must send data to the shared analytics site`);
  }
});
