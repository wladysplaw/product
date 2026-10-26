import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { projects } from "../src/data/projects.ts";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));

test("content-platform home and case use the supplied replacement first screen", () => {
  const project = projects.find(({ slug }) => slug === "content-platform-experiments");
  const replacementPath = "/assets/projects/content-platform-experiments/s_1.png";
  const replacementAsset = path.resolve(testDirectory, `../public${replacementPath}`);
  const replacementHash = createHash("sha256").update(readFileSync(replacementAsset)).digest("hex");

  assert.ok(project, "the content-platform project must remain available");
  assert.equal(project.cover.src, replacementPath, "the home card must use the replacement first screen");
  assert.equal(project.blocks[0]?.media.src, replacementPath, "the first internal story must use the same replacement screen");
  assert.equal(
    replacementHash,
    "cc528b68e3a302b393faa8b400d45daaa86f8e014067e6adbf0d77a5db46a717",
    "s_1 must contain the supplied replacement image rather than the previous screen"
  );
});

test("every home project builds a case with copy and local media for every story", () => {
  for (const project of projects) {
    const builtCase = path.resolve(testDirectory, `../dist/projects/${project.slug}/index.html`);
    const html = readFileSync(builtCase, "utf8");

    assert.equal(
      (html.match(/data-testid="case-story"/g) ?? []).length,
      project.blocks.length,
      `${project.slug} must expose one story block per supplied image`
    );
    assert.equal(
      (html.match(/data-testid="case-media"/g) ?? []).length,
      project.blocks.length,
      `${project.slug} must expose one media surface per supplied image`
    );
    assert.equal(
      (html.match(/class="case-page__copy"/g) ?? []).length,
      project.blocks.length,
      `${project.slug} must keep its text placeholder directly before every media surface`
    );

    for (const block of project.blocks) {
      assert.ok(
        html.includes(`src="/product${block.media.src}"`),
        `${project.slug} must serve ${block.media.src} locally`
      );
    }
  }
});

test("the final case loops its top and footer next links back to the first project", () => {
  const firstProject = projects[0];
  const finalProject = projects.at(-1);

  assert.ok(firstProject, "the project sequence must have a first destination");
  assert.ok(finalProject, "the project sequence must have a final destination");

  const builtFinalCase = path.resolve(testDirectory, `../dist/projects/${finalProject.slug}/index.html`);
  const html = readFileSync(builtFinalCase, "utf8");
  const firstHref = `/product/projects/${firstProject.slug}/`;

  assert.equal(
    (html.match(new RegExp(`href="${firstHref}"`, "g")) ?? []).length,
    2,
    "the final case must expose the first project through both its fixed and footer next links"
  );
});
