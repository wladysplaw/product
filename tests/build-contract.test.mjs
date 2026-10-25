import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.resolve(testDirectory, "../dist");
const siteOrigin = "https://wladysplaw.github.io";

function builtHtmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return builtHtmlFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith(".html") ? [entryPath] : [];
  });
}

function urlsFromHtml(html) {
  const urls = [];

  for (const match of html.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi)) {
    urls.push(match[2]);
  }

  for (const match of html.matchAll(/\bsrcset\s*=\s*(["'])(.*?)\1/gi)) {
    for (const candidate of match[2].split(",")) {
      const url = candidate.trim().split(/\s+/)[0];

      if (url) {
        urls.push(url);
      }
    }
  }

  return urls;
}

test("HTML URL extraction covers quoted href, src, and srcset values", () => {
  const urls = urlsFromHtml(
    `<a href='/product/projects/example/'>case</a>` +
      `<img src="/product/assets/cover.png" srcset='/product/assets/cover.png 1x, https://cdn.example/cover@2x.png 2x'>`
  );

  assert.deepEqual(urls, [
    "/product/projects/example/",
    "/product/assets/cover.png",
    "/product/assets/cover.png",
    "https://cdn.example/cover@2x.png"
  ]);
});

test("built HTML is safe to publish below /product/", () => {
  assert.equal(existsSync(distDirectory), true, "build must emit a dist directory");

  const htmlFiles = builtHtmlFiles(distDirectory);

  assert.ok(htmlFiles.length > 0, "build must emit at least one HTML page");

  const publishedUrls = [];

  for (const htmlFile of htmlFiles) {
    const html = readFileSync(htmlFile, "utf8");

    assert.equal(html.includes("localhost"), false, `${htmlFile} must not point to a local server`);
    assert.equal(html.includes("figma.com/api/mcp"), false, `${htmlFile} must not point to Figma temporary assets`);

    for (const resourceUrl of urlsFromHtml(html)) {
      publishedUrls.push(resourceUrl);

      if (resourceUrl.startsWith("/")) {
        assert.ok(
          resourceUrl.startsWith("/product/"),
          `${htmlFile} contains a root-relative resource outside /product/: ${resourceUrl}`
        );
      }

      if (resourceUrl.startsWith(siteOrigin)) {
        assert.ok(
          resourceUrl.startsWith(`${siteOrigin}/product/`),
          `${htmlFile} contains a same-origin resource outside /product/: ${resourceUrl}`
        );
      }
    }
  }

  assert.ok(publishedUrls.some((url) => url.startsWith("/product/")), "build must emit base-prefixed resources");
});
