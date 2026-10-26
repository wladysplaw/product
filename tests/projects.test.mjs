import assert from "node:assert/strict";
import test from "node:test";
import { homeCards, projects } from "../src/data/projects.ts";
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

test("wraps the final project next link to the first project", () => {
  assert.deepEqual(getProjectNeighbors("atlas", fixture), { previous: undefined, next: fixture[1] });
  assert.deepEqual(getProjectNeighbors("beacon", fixture), { previous: fixture[0], next: fixture[0] });
});

test("publishes each visible home card as its own project route", () => {
  assert.deepEqual(
    projects.map(({ slug }) => slug),
    [
      "content-platform-experiments",
      "football-federation",
      "sheremetyevo-international-airport",
      "research-platform",
      "internet-computer",
      "breaking"
    ]
  );
  assert.deepEqual(getProjectPaths(projects), [
    { params: { slug: "content-platform-experiments" } },
    { params: { slug: "football-federation" } },
    { params: { slug: "sheremetyevo-international-airport" } },
    { params: { slug: "research-platform" } },
    { params: { slug: "internet-computer" } },
    { params: { slug: "breaking" } }
  ]);
  assert.deepEqual(
    homeCards.map(({ projectSlug }) => projectSlug),
    [
      "content-platform-experiments",
      "football-federation",
      "sheremetyevo-international-airport",
      "research-platform",
      "internet-computer",
      "breaking"
    ]
  );
  assert.equal(new Set(homeCards.map(({ projectSlug }) => projectSlug)).size, homeCards.length);
  assert.ok(projects.every(({ blocks }) => blocks.length > 0), "each routed project must expose at least one image surface");

  const authoredCases = [
    "content-platform-experiments",
    "football-federation",
    "sheremetyevo-international-airport",
    "research-platform",
    "internet-computer",
    "breaking"
  ];
  const contentPlatform = projects.find(({ slug }) => slug === "content-platform-experiments");
  const footballFederation = projects.find(({ slug }) => slug === "football-federation");
  const sheremetyevo = projects.find(({ slug }) => slug === "sheremetyevo-international-airport");
  const researchPlatform = projects.find(({ slug }) => slug === "research-platform");
  const internetComputer = projects.find(({ slug }) => slug === "internet-computer");
  const breaking = projects.find(({ slug }) => slug === "breaking");

  assert.ok(contentPlatform, "the content platform case must remain available");
  assert.ok(footballFederation, "the football federation case must remain available");
  assert.ok(sheremetyevo, "the sheremetyevo case must remain available");
  assert.ok(researchPlatform, "the research platform case must remain available");
  assert.ok(internetComputer, "the internet computer case must remain available");
  assert.ok(breaking, "the breaking case must remain available");
  assert.ok(
    contentPlatform.blocks.every(({ body, mediaStatus }) => body !== "text placeholder" && mediaStatus === "ready"),
    "every supplied content-platform screen must have its authored copy before the image"
  );
  assert.ok(
    footballFederation.blocks.every(({ body, mediaStatus }) => body !== "text placeholder" && mediaStatus === "ready"),
    "every supplied football-federation screen must have its authored copy before the image"
  );
  assert.ok(
    sheremetyevo.blocks.every(({ body, mediaStatus }) => body !== "text placeholder" && mediaStatus === "ready"),
    "every supplied sheremetyevo screen must have its authored copy before the image"
  );
  assert.ok(
    researchPlatform.blocks.every(({ body, mediaStatus }) => body !== "text placeholder" && mediaStatus === "ready"),
    "every supplied research-platform screen must have its authored copy before the image"
  );
  assert.ok(
    internetComputer.blocks.every(({ body, mediaStatus }) => body !== "text placeholder" && mediaStatus === "ready"),
    "every supplied internet-computer screen must have its authored copy before the image"
  );
  assert.ok(
    breaking.blocks.every(({ body, mediaStatus }) => body !== "text placeholder" && mediaStatus === "ready"),
    "every supplied breaking screen must have its authored copy before the image"
  );
  assert.ok(
    [contentPlatform.summary, ...contentPlatform.blocks.map(({ body }) => body)].every(
      (copy) => copy === copy.toLowerCase() && !copy.includes(".")
    ),
    "content-platform copy must use lowercase sentences separated without full stops"
  );
  assert.ok(
    [footballFederation.summary, ...footballFederation.blocks.map(({ body }) => body)].every(
      (copy) => copy === copy.toLowerCase() && !copy.includes(".")
    ),
    "football-federation copy must use lowercase sentences separated without full stops"
  );
  assert.ok(
    [sheremetyevo.title, sheremetyevo.services, sheremetyevo.summary, ...sheremetyevo.blocks.map(({ body }) => body)].every(
      (copy) => copy === copy.toLowerCase() && !copy.includes(".")
    ),
    "sheremetyevo copy must use lowercase sentences separated without full stops"
  );
  assert.ok(
    [researchPlatform.title, researchPlatform.services, researchPlatform.summary, ...researchPlatform.blocks.map(({ body }) => body)].every(
      (copy) => copy === copy.toLowerCase() && !copy.includes(".")
    ),
    "research-platform copy must use lowercase sentences separated without full stops"
  );
  assert.ok(
    [internetComputer.title, internetComputer.services, internetComputer.summary, ...internetComputer.blocks.map(({ body }) => body)].every(
      (copy) => copy === copy.toLowerCase() && !copy.includes(".")
    ),
    "internet-computer copy must use lowercase sentences separated without full stops"
  );
  assert.ok(
    [breaking.title, breaking.services, breaking.summary, ...breaking.blocks.map(({ body }) => body)].every(
      (copy) => copy === copy.toLowerCase() && !copy.includes(".")
    ),
    "breaking copy must use lowercase sentences separated without full stops"
  );
  assert.ok(
    projects
      .filter(({ slug }) => !authoredCases.includes(slug))
      .every(({ blocks }) => blocks.every(({ body, mediaStatus }) => body === "text placeholder" && mediaStatus === "ready")),
    "unfinished project cases must retain their requested placeholder copy"
  );
});
