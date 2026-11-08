import assert from "node:assert/strict";
import test from "node:test";
import { allProjects, directProjects, homeCards, projects } from "../src/data/projects.ts";
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
      "internet-computer",
      "sheremetyevo-international-airport",
      "research-platform",
      "breaking"
    ]
  );
  assert.deepEqual(getProjectPaths(projects), [
    { params: { slug: "content-platform-experiments" } },
    { params: { slug: "football-federation" } },
    { params: { slug: "internet-computer" } },
    { params: { slug: "sheremetyevo-international-airport" } },
    { params: { slug: "research-platform" } },
    { params: { slug: "breaking" } }
  ]);
  assert.deepEqual(
    homeCards.map(({ projectSlug }) => projectSlug),
    [
      "content-platform-experiments",
      "football-federation",
      "internet-computer",
      "sheremetyevo-international-airport",
      "research-platform",
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
  assert.deepEqual(
    projects.slice(0, 5).map(({ slug, services, summary }) => ({ slug, services, summary })),
    [
      {
        slug: "content-platform-experiments",
        services: "product strategy & ux/ui",
        summary:
          "a series of product experiments around social content and creator monetisation — i developed hypotheses, user flows and interface concepts around discovery, paid posts, subscriptions, paywalls and settlement"
      },
      {
        slug: "football-federation",
        services: "product direction & ux/ui",
        summary:
          "a management platform for a football federation, bringing clubs, tournaments, matches, players, coaches and staff into one working environment — i led product and design direction, shaped key decisions and guided the team through the ux/ui design of core management workflows"
      },
      {
        slug: "internet-computer",
        services: "web design & motion",
        summary:
          "digital launch work for a blockchain protocol with a developer audience — at clay, i contributed to several launches and two website directions, using interface design, motion and narrative to make technical concepts easier to understand"
      },
      {
        slug: "sheremetyevo-international-airport",
        services: "service design & ux/ui",
        summary:
          "a multi-device passenger-service ecosystem spanning the website, mobile app, wearable app and airport terminals — i designed the service experience and visual system across these touchpoints"
      },
      {
        slug: "research-platform",
        services: "research & product design",
        summary:
          "a goal-setting product explored from research to a working interface model — i studied academic sources alongside market and product patterns, then translated the findings into workstreams, feature priorities, a design system and core screens"
      }
    ]
  );
  assert.equal(breaking.services, "branding, communication");
  assert.equal(
    breaking.summary,
    "brand communication for a multi-asset staking service — animated smoke, black 3d flowers and editorial type give the technical offer its own memorable voice"
  );
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

test("keeps direct-only cases routeable without adding them to the home grid", () => {
  const directSlugs = ["polee", "greeno", "motif-network", "cdms", "knowfid", "fetch-fab"];

  assert.deepEqual(
    directProjects.map(({ slug }) => slug),
    directSlugs
  );
  assert.equal(directProjects.find(({ slug }) => slug === "cdms")?.title, "cdmsm");
  assert.deepEqual(
    getProjectPaths(allProjects),
    [
      ...getProjectPaths(projects),
      ...directSlugs.map((slug) => ({ params: { slug } }))
    ]
  );
  assert.ok(
    directProjects.every(({ blocks }) => blocks.length > 0 && blocks.every(({ body, mediaStatus }) => body !== "text placeholder" && mediaStatus === "ready")),
    "every direct-only case must keep authored copy directly before each supplied image"
  );
  assert.ok(
    directProjects.flatMap(({ services, summary, blocks }) => [services, summary, ...blocks.map(({ body }) => body)]).every(
      (copy) => copy === copy.toLowerCase() && !copy.includes(".")
    ),
    "direct-only case copy must use lowercase sentences separated without full stops"
  );
  assert.deepEqual(
    homeCards.map(({ projectSlug }) => projectSlug),
    projects.map(({ slug }) => slug),
    "the homepage must retain only the current main-case sequence"
  );
  assert.deepEqual(getProjectNeighbors("fetch-fab", directProjects), {
    previous: directProjects[4],
    next: directProjects[0]
  });
});
