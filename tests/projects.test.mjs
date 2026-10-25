import assert from "node:assert/strict";
import test from "node:test";
import { projects } from "../src/data/projects.ts";
import { getProjectBySlug, getProjectNeighbors, getProjectPaths } from "../src/lib/projects.ts";

const fixture = [
  {
    slug: "atlas",
    title: "Atlas",
    services: "product design",
    summary: "A fixture project for route order.",
    cover: { src: "/projects/atlas/cover.png", alt: "Atlas cover" },
    blocks: []
  },
  {
    slug: "beacon",
    title: "Beacon",
    services: "digital experience",
    summary: "A fixture project for adjacent navigation.",
    cover: { src: "/projects/beacon/cover.png", alt: "Beacon cover" },
    blocks: []
  }
];

test("creates static paths in the supplied project order", () => {
  assert.deepEqual(getProjectPaths(fixture), [{ params: { slug: "atlas" } }, { params: { slug: "beacon" } }]);
});

test("returns undefined for a project slug that is absent", () => {
  assert.equal(getProjectBySlug("missing", fixture), undefined);
});

test("finds neighboring projects without wrapping around the collection", () => {
  assert.deepEqual(getProjectNeighbors("atlas", fixture), { previous: undefined, next: fixture[1] });
  assert.deepEqual(getProjectNeighbors("beacon", fixture), { previous: fixture[0], next: undefined });
});

test("keeps the published catalogue empty until owner material is added", () => {
  assert.deepEqual(projects, []);
  assert.deepEqual(getProjectPaths(projects), []);
});
