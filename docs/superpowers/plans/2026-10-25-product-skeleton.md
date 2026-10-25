# Product Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver an independent English Astro skeleton for `https://wladysplaw.github.io/product/` with the Figma-derived home grid, an empty real-project catalogue, a reusable first-project detail template, and GitHub Pages deployment.

**Architecture:** The static site owns all of its styles, components, routes, and project data in this repository. A typed `projects` module supplies home cards and static detail paths; it starts empty so a detail page is emitted only when the owner provides the first real project. CSS custom properties express the 1440 px desktop grid and collapse it at smaller viewports without hard-coding canvas coordinates.

**Tech Stack:** Astro 7.4.1 or newer compatible patch release, TypeScript, CSS custom properties, Node 22 built-in test runner, Playwright Chromium, GitHub Actions / GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-25-product-site-design.md`

## Global Constraints

- Build with `base: "/product/"`; every generated internal URL and static asset must work below that path.
- English only; no route, copy source, component, or navigation imported from the existing portfolio.
- The only contact action is `Let’s Talk → https://t.me/saysskyy`.
- Do not invent a project, project image, project claim, email address, or preview detail route before owner-supplied material exists.
- At 1440 px, content width is 1376 px with 32 px margins and an 8 px two-card gutter; services and the second card use one X-axis grid boundary.
- Grey project surfaces share their row geometry independently of text length; editorial text measures remain capped.
- Native anchor scrolling must respect `prefers-reduced-motion`; shader, WebGL, and bespoke card interactions are out of this implementation.
- Publish through a custom GitHub Actions Pages workflow; do not commit generated `dist/` content as a publishing branch.

## Review Focus

- **Base-path deployment:** Verify built HTML uses `/product/` for assets and internal links, because a root-relative URL would work locally but fail on Pages.
- **Empty catalogue:** Verify no static project route or invented card is emitted before real project data exists, because a placeholder could be mistaken for portfolio content.
- **Desktop grid invariant:** Verify in a 1440 px browser that the services block's left edge equals the second grey surface's left edge and paired surfaces have equal height.
- **Narrow viewport:** Verify a 390 px viewport has no horizontal overflow and retains readable source order, because desktop measures must not become clipped flex items.
- **Motion and keyboard behavior:** Verify `Let’s Talk` is keyboard reachable and reduced-motion disables smooth scrolling, because visual polish cannot remove basic navigation behavior.

### Task 1: Establish the independent Astro foundation

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `.gitignore`
- Create: `src/env.d.ts`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/pages/index.astro`
- Create: `public/favicon.svg`
- Test: `tests/build-contract.test.mjs`

**Interfaces:**
- Produces the `npm run build`, `npm test`, and `npm run verify` commands used by all later tasks; `verify` builds first and checks generated HTML rather than source CSS.
- Produces `BaseLayout` with `title`, `description`, and a slotted document body; route components consume it.

- [ ] **Step 1: Write the failing build-output contract test**

Create `tests/build-contract.test.mjs` using `node:test`. It must expect a built `dist/index.html`, reject `localhost` and Figma temporary URLs, and require an asset or internal URL rooted at `/product/`.

- [ ] **Step 2: Run the test to prove the empty repository fails**

Run: `npm test`

Expected: FAIL because `package.json` and the build output do not exist.

- [ ] **Step 3: Add the minimum Astro configuration and global layout**

Set `astro.config.mjs` to static output with `site: "https://wladysplaw.github.io"` and `base: "/product/"`. Define the site-local font stack, spacing, colours, focus treatment, and reduced-motion rule in the two CSS files. `BaseLayout` must emit a semantic document shell, a canonical title/description input, and its slot without pulling from the existing portfolio. Add a minimal `src/pages/index.astro` that consumes this layout so the generated root document exists; Task 3 replaces its body with the home composition.

- [ ] **Step 4: Add build/test scripts and run them**

Use Astro's build command, Node's built-in test runner, and a `verify` script that runs build before `tests/build-contract.test.mjs`. Run: `npm install && npm run verify`.

Expected: PASS with a base-path-safe root document.

- [ ] **Step 5: Commit the approved spec, plan, and foundation**

```bash
git add docs/superpowers/specs/2026-10-25-product-site-design.md docs/superpowers/plans/2026-10-25-product-skeleton.md package.json package-lock.json astro.config.mjs .gitignore src public tests
git commit -m "chore: initialize product site foundation"
```

### Task 2: Model real projects without seeding fictitious content

**Files:**
- Create: `src/data/projects.ts`
- Create: `src/lib/projects.ts`
- Test: `tests/projects.test.mjs`

**Interfaces:**
- Produces `Project` with `slug`, `title`, `services`, `summary`, `cover`, and ordered `blocks` fields for later owner-approved entries.
- Produces `getProjectPaths(projects)`, `getProjectBySlug(slug, projects)`, and `getProjectNeighbors(slug, projects)` for page routes and navigation.

- [ ] **Step 1: Write data-fixture tests**

Create `tests/projects.test.mjs` with an independent two-project fixture. Assert ordered static path generation, a missing slug returning `undefined`, and correct previous/next neighbors; also assert the production export begins empty.

- [ ] **Step 2: Run the test to prove the module is missing**

Run: `node --test tests/projects.test.mjs`

Expected: FAIL with the module-not-found error.

- [ ] **Step 3: Implement the typed project boundary**

Create `src/data/projects.ts` with `export const projects: Project[] = []`. Keep media fields local paths only, and put lookup/path/neighbor logic in `src/lib/projects.ts` so later page components never own data-order rules.

- [ ] **Step 4: Run the data suite and full verification**

Run: `npm test && npm run verify`.

Expected: PASS, including an empty production catalogue with no generated project path.

- [ ] **Step 5: Commit the project model**

```bash
git add src/data/projects.ts src/lib/projects.ts tests/projects.test.mjs
git commit -m "feat: add project content model"
```

### Task 3: Implement the home page and reusable detail template

**Files:**
- Create: `src/components/SiteIdentity.astro`
- Create: `src/components/ServiceList.astro`
- Create: `src/components/ProjectGrid.astro`
- Create: `src/components/ProjectCard.astro`
- Create: `src/components/ProjectDetail.astro`
- Create: `src/components/SiteFooter.astro`
- Modify: `src/pages/index.astro`
- Create: `src/pages/projects/[slug].astro`
- Modify: `src/styles/global.css`
- Create: `playwright.config.ts`
- Modify: `package.json`
- Test: `tests/layout.spec.ts`

**Interfaces:**
- Consumes `projects`, the lookup helpers, and `BaseLayout`.
- Produces a home page with an intentional empty catalogue state and a detail template that emits static pages only for `getProjectPaths(projects)`.
- `ProjectCard` consumes a single `Project`; `ProjectDetail` consumes a `Project` plus optional neighbors.

- [ ] **Step 1: Write browser-layout contract tests**

Create `playwright.config.ts` with an Astro preview web server at `http://127.0.0.1:4321/product/`, then create `tests/layout.spec.ts`. With stable `data-testid` hooks, assert at desktop that `services` and the second grey surface have equal left coordinates and the two empty surfaces have equal heights; at 390 px assert `document.documentElement.scrollWidth <= window.innerWidth`. Assert the Telegram CTA href exactly equals `https://t.me/saysskyy`.

- [ ] **Step 2: Run the layout test to prove the routes/components are absent**

Run: `npm run test:layout`

Expected: FAIL because the built home and its required hooks do not exist.

- [ ] **Step 3: Build the Figma-derived grid in semantic components**

Add `@playwright/test` and the `test:layout` script. Use a shared two-column CSS grid with an 8 px gutter at the desktop reference. Put the intro in column one; put `ServiceList` at the start of column two, and place the contact CTA at the end of that same grid cell. `ProjectGrid` must use two `aria-hidden` empty grey surfaces, `aspect-ratio: 684 / 638` at the desktop layout, and no invented project facts. Cap the three editorial measures rather than using flex growth.

Implement the route template now, but `getStaticPaths` must return no paths while `projects` is empty. `back` is an actual link; `next` becomes a link only when `getProjectNeighbors` returns one.

- [ ] **Step 4: Add responsive, accessible behavior and verify it**

Collapse header and cards into a single column at the documented narrow breakpoint; preserve source order, visible focus, native smooth anchors, and reduced-motion fallback. Run: `npm install && npx playwright install chromium && npm run verify && npm run test:layout`.

Expected: PASS for both viewport fixtures and the exact Telegram href.

- [ ] **Step 5: Perform visual comparison without treating it as a test proof**

Open the local home alongside the Figma screenshot at 1440 px. Check the 32 px outer margins, services/card shared boundary, grey-card pair geometry, editorial widths, and narrow layout. Record any visual mismatch separately from test status and correct in-scope CSS before proceeding.

- [ ] **Step 6: Commit the page system**

```bash
git add src/components src/pages src/styles/global.css tests/layout.spec.ts playwright.config.ts package.json package-lock.json
git commit -m "feat: add product site page skeleton"
```

### Task 4: Add GitHub Pages deployment and validate the publishable artifact

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `package.json`
- Test: `tests/workflow-contract.test.mjs`

**Interfaces:**
- Consumes `npm run build` and uploads `dist/` through the GitHub Pages artifact/deployment actions.
- Produces a deployment on pushes to `main` and manual dispatches, without changing the source branch into a generated-site branch.

- [ ] **Step 1: Write a workflow contract test**

Create `tests/workflow-contract.test.mjs` that reads `.github/workflows/deploy.yml` as data and asserts the workflow has `contents: read`, `pages: write`, `id-token: write`, `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`.

- [ ] **Step 2: Run the workflow test to prove it fails**

Run: `node --test tests/workflow-contract.test.mjs`

Expected: FAIL because no workflow exists.

- [ ] **Step 3: Implement the Pages workflow**

Create a two-job workflow with a build job on `push` to `main` and `workflow_dispatch`, then a `github-pages` deployment job. Use the npm lockfile for deterministic installation and upload only `dist/` after `npm run build`.

- [ ] **Step 4: Run source and artifact checks**

Run: `npm test && npm run verify && git diff --check`.

Expected: PASS. Inspect generated `dist/` locally; do not claim that GitHub Pages has propagated until a successful remote workflow and fetched live page prove it.

- [ ] **Step 5: Commit the deployment pipeline**

```bash
git add .github/workflows/deploy.yml package.json package-lock.json tests/workflow-contract.test.mjs
git commit -m "ci: deploy product site to pages"
```

## Self-review

- **Spec coverage:** Tasks 1–4 cover independent static deployment, exact base path, English-only local components, empty initial catalogue, Figma grid constraints, detail template, CTA, accessibility, and Pages. Project-specific image/content intake is deliberately deferred until owner material arrives.
- **Step scan:** Each task begins with a failing test, adds one named responsibility, verifies a concrete command, and commits a bounded change.
- **Type consistency:** `Project`, `projects`, and the three exported helper functions are defined in Task 2 and are the only project-data interfaces later tasks consume.
- **Review Focus:** Base path is tested in Task 1; empty routes in Task 2; geometry and narrow overflow plus CTA in Task 3; workflow permissions in Task 4; visual fidelity remains an explicit visual comparison rather than a false assertion from source-level tests.
- **Proportion:** The plan locks exact file boundaries, data interfaces, and verification without reproducing component implementations.
