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

  for (const match of html.matchAll(/(?:^|[\s<])(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    urls.push(match[1] ?? match[2] ?? match[3]);
  }

  for (const match of html.matchAll(/(?:^|[\s<])srcset\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    const srcset = match[1] ?? match[2] ?? match[3];

    for (const candidate of srcset.split(",")) {
      const url = candidate.trim().split(/\s+/)[0];

      if (url) {
        urls.push(url);
      }
    }
  }

  return urls;
}

function documentUrlForHtml(htmlFile) {
  const relativeFile = path.relative(distDirectory, htmlFile).split(path.sep).join("/");
  const publishedPath = relativeFile === "index.html"
    ? "/product/"
    : relativeFile.endsWith("/index.html")
      ? `/product/${relativeFile.slice(0, -"index.html".length)}`
      : `/product/${relativeFile}`;

  return new URL(publishedPath, siteOrigin);
}

function assertBaseScopedUrl(resourceUrl, documentUrl, htmlFile) {
  const resolvedUrl = new URL(resourceUrl, documentUrl);

  if (resolvedUrl.origin !== siteOrigin) {
    return;
  }

  assert.ok(
    resolvedUrl.pathname.startsWith("/product/"),
    `${htmlFile} contains a same-origin resource outside /product/: ${resourceUrl}`
  );
}

test("HTML URL extraction covers real quoted, unquoted, and srcset attributes", () => {
  const urls = urlsFromHtml(
    `<a data-href='/ignored' href='/product/projects/example/'>case</a>` +
      `<img src=/product/assets/cover.png srcset='/product/assets/cover.png 1x, https://cdn.example/cover@2x.png 2x'>`
  );

  assert.deepEqual(urls, [
    "/product/projects/example/",
    "/product/assets/cover.png",
    "/product/assets/cover.png",
    "https://cdn.example/cover@2x.png"
  ]);
});

test("base-path classification uses URL origins rather than string prefixes", () => {
  const documentUrl = new URL("/product/projects/example/", siteOrigin);

  assert.doesNotThrow(() => assertBaseScopedUrl("//cdn.example/cover.png", documentUrl, "fixture.html"));
  assert.doesNotThrow(() => assertBaseScopedUrl("https://wladysplaw.github.io.evil/cover.png", documentUrl, "fixture.html"));
  assert.doesNotThrow(() => assertBaseScopedUrl("https://WLADYSPLAW.github.io/product/cover.png", documentUrl, "fixture.html"));
  assert.throws(
    () => assertBaseScopedUrl("https://wladysplaw.github.io/outside/cover.png", documentUrl, "fixture.html"),
    /outside \/product\//
  );
});

test("built HTML is safe to publish below /product/", () => {
  assert.equal(existsSync(distDirectory), true, "build must emit a dist directory");

  const htmlFiles = builtHtmlFiles(distDirectory);

  assert.ok(htmlFiles.length > 0, "build must emit at least one HTML page");

  const publishedUrls = [];

  for (const htmlFile of htmlFiles) {
    const html = readFileSync(htmlFile, "utf8");
    const documentUrl = documentUrlForHtml(htmlFile);

    assert.equal(html.includes("localhost"), false, `${htmlFile} must not point to a local server`);
    assert.equal(html.includes("figma.com/api/mcp"), false, `${htmlFile} must not point to Figma temporary assets`);

    for (const resourceUrl of urlsFromHtml(html)) {
      publishedUrls.push(resourceUrl);
      assertBaseScopedUrl(resourceUrl, documentUrl, htmlFile);
    }
  }

  assert.ok(publishedUrls.some((url) => url.startsWith("/product/")), "build must emit base-prefixed resources");
});
