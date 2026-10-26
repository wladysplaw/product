import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const cardPath = path.join(projectRoot, "src/components/ProjectCard.astro");
const gridPath = path.join(projectRoot, "src/components/ProjectGrid.astro");
const layoutPath = path.join(projectRoot, "src/layouts/BaseLayout.astro");
const controllerPath = path.join(projectRoot, "src/scripts/page-motion.ts");
const runtimePath = path.join(projectRoot, "src/scripts/dom-snapshot-displacement.ts");
const stylesPath = path.join(projectRoot, "src/styles/global.css");

test("enables the DOM-snapshot displacement on every ready project card", () => {
  const card = readFileSync(cardPath, "utf8");
  const grid = readFileSync(gridPath, "utf8");

  assert.match(grid, /cardsWithProjects\.map\(\(\{ card, project \}\) =>\s*\([\s\S]*?<ProjectCard[\s\S]*?domSnapshotDisplacement=\{card\.mediaStatus === "ready"\}/);
  assert.match(card, /data-dom-snapshot-displacement=\{domSnapshotDisplacement \? "true" : undefined\}/);
});

test("renders the project cover through one opaque WebGL image path while active", () => {
  const layout = readFileSync(layoutPath, "utf8");
  const controller = readFileSync(controllerPath, "utf8");
  const styles = readFileSync(stylesPath, "utf8");

  assert.ok(existsSync(runtimePath), "card displacement runtime must exist");

  const runtime = readFileSync(runtimePath, "utf8");

  assert.match(layout, /startPageMotion\(\)/);
  assert.match(controller, /mountDomSnapshotDisplacement\(\)/);
  assert.match(runtime, /card\.querySelector<HTMLImageElement>\("\.project-card__media img"\)/, "the physical grid must capture the raster cover rather than the card layout");
  assert.match(runtime, /this\.surfaceHost\.append\(this\.canvas\);/, "the effect canvas must stay inside the media host");
  assert.doesNotMatch(runtime, /html-to-image|toCanvas\(/, "the browser must not take a second DOM snapshot or fetch a duplicate cover for the effect");
  assert.match(runtime, /getContext\("webgl2"/);
  assert.match(runtime, /const GRID_COLUMNS = 8;/);
  assert.match(runtime, /const fieldTexture = gl\.createTexture\(\)/, "the effect needs a grid field texture, not geometrically displaced duplicate tiles");
  assert.match(runtime, /gl\.RG32F/, "each grid cell needs an independent two-axis displacement value");
  assert.match(runtime, /gl\.NEAREST/, "the field texture must preserve visible cell boundaries");
  assert.match(runtime, /private readonly sourceCanvas = document\.createElement\("canvas"\);/, "the effect needs an offscreen source with the same transparent media area as the reference");
  assert.match(runtime, /sourceContext\.drawImage\(this\.surface, imageLeft, imageTop, imageWidth, imageHeight\);/, "the existing raster must be painted once into that source without fetching or cloning a visible image");
  assert.match(runtime, /this\.canvas\.style\.left = "0px";/, "the output must cover the media field so moved cells can reveal its quiet card background");
  assert.match(runtime, /gl\.texImage2D\(gl\.TEXTURE_2D, 0, gl\.RGBA, gl\.RGBA, gl\.UNSIGNED_BYTE, this\.sourceCanvas\)/, "the WebGL canvas must sample one transparent media-host source texture");
  assert.match(runtime, /uniform sampler2D uField;/);
  assert.match(runtime, /vec4 sampleContent\(vec2 uv\)/, "cells that leave the source bounds need a transparent sample rather than a repeated raster edge");
  assert.match(runtime, /if \(any\(lessThan\(uv, vec2\(0\.0\)\)\) \|\| any\(greaterThan\(uv, vec2\(1\.0\)\)\)\) return vec4\(0\.0\);/, "the source's transparent media area must remain transparent beyond its UV boundary");
  assert.doesNotMatch(runtime, /clamp\(contentUv - push/, "clamping shifted cells would stretch the source raster along its border instead of exposing the card background");
  assert.match(runtime, /vec2 contentUv = vUv;/, "the uploaded HTML image needs one Y flip, not a second shader-side inversion");
  assert.match(runtime, /vec2 fieldUv = vUv;/, "a pointer in the upper right must read the upper-right field cell rather than a vertically mirrored lower-right cell");
  assert.match(runtime, /texture\(uField, fieldUv\)\.rg/);
  assert.match(runtime, /gl\.drawArrays\(gl\.TRIANGLE_STRIP, 0, 4\)/, "the canvas must render one full image output, not alpha fragments above the DOM image");
  assert.match(runtime, /gl\.disable\(gl\.BLEND\)/, "the WebGL output must not blend a translucent duplicate over the source image");
  assert.doesNotMatch(runtime, /vFragmentAlpha|blendFunc\(|from "html-to-image"/, "the old translucent snapshot path must be gone");
  assert.match(runtime, /pointermove/);
  assert.match(runtime, /const gridX = this\.pointerX \* this\.columns;/, "pointer position must inject velocity into the corresponding field cells");
  assert.match(runtime, /this\.pointerVelocityX \*= Math\.pow\(0\.9, delta \* 60\)/, "the field must settle after pointer movement");
  assert.match(runtime, /float gate = smoothstep\(1\.5, 18\.0, pushPx\)/, "interference must remain conditional on actual cell displacement");
  assert.match(runtime, /prefers-reduced-motion/);
  assert.match(runtime, /canvas\.style\.pointerEvents\s*=\s*"none"/);
  assert.match(runtime, /data-dom-snapshot-displacement/);
  assert.match(runtime, /pointerenter/);
  assert.match(runtime, /focus/);
  assert.match(runtime, /ResizeObserver/);
  assert.match(runtime, /this\.resizeObserver = new ResizeObserver\(this\.handleResize\);/);
  assert.match(styles, /\.project-card__dom-snapshot-displacement-canvas\s*\{[\s\S]*?pointer-events:\s*none/);
  assert.match(styles, /\.project-card__media\s*\{[\s\S]*?overflow:\s*hidden/, "cover fragments must stay inside the media area");
  assert.match(styles, /prefers-reduced-motion:\s*reduce[\s\S]*?dom-snapshot-displacement-canvas/);
  assert.match(styles, /project-card\[data-dom-snapshot-displacement="true"\]\.is-dom-snapshot-displacement-active\s+\.project-card__media img\s*\{[\s\S]*?opacity:\s*0/, "once the canvas is ready, the DOM image must be visually replaced instead of remaining under it");
  assert.match(styles, /project-card\[data-dom-snapshot-displacement="true"\]\.is-dom-snapshot-displacement-active\s+\.project-card__dom-snapshot-displacement-canvas\s*\{[\s\S]*?opacity:\s*1/, "the opaque canvas must be the only visible card image while active");
});

test("keeps the native image as the fallback until its texture is ready", () => {
  const runtime = readFileSync(runtimePath, "utf8");

  assert.match(
    runtime,
    /await this\.surface\.decode\(\)\.catch\(\(\) => undefined\);/,
    "the card must wait for the already-loaded image before replacing it with the canvas",
  );
  assert.match(
    runtime,
    /this\.uploadImage\(\);\s+this\.textureReady = true;[\s\S]{0,240}this\.card\.classList\.add\(ACTIVE_CLASS\);/,
    "the DOM image may only be hidden after the canvas has a complete image texture",
  );
});

test("drives a bounded wider field from the grey card surround without strengthening the image center", () => {
  const runtime = readFileSync(runtimePath, "utf8");

  assert.match(runtime, /const PERIPHERAL_GRID_RADIUS = 0\.48;/, "the card surround needs a wider influence radius than the image center");
  assert.match(runtime, /const PERIPHERAL_FIELD_STRENGTH = 24;/, "the card surround needs a stronger field than the image center");
  assert.match(runtime, /const MAX_FIELD_DISPLACEMENT = 5\.5;/, "fast pointer input must remain capped before it can tear the center");
  assert.match(runtime, /const motionBounds = this\.card\.getBoundingClientRect\(\);/, "pointer velocity must continue across the full card, including its grey surround");
  assert.match(runtime, /const projectedClientX = clamp\(event\.clientX, imageBounds\.left, imageBounds\.right\);/, "surround input must land on the nearest image edge");
  assert.match(runtime, /const projectedClientY = clamp\(event\.clientY, imageBounds\.top, imageBounds\.bottom\);/, "surround input must land on the nearest image edge");
  assert.match(runtime, /const radius = GRID_RADIUS \+ \(PERIPHERAL_GRID_RADIUS - GRID_RADIUS\) \* this\.peripheralInfluence;/, "the center must retain the original radius when peripheral influence is zero");
  assert.match(runtime, /const fieldStrength = FIELD_STRENGTH \+ \(PERIPHERAL_FIELD_STRENGTH - FIELD_STRENGTH\) \* this\.peripheralInfluence;/, "the center must retain the original strength when peripheral influence is zero");
  assert.match(runtime, /clamp\(this\.field\[index\] \+ fieldStrength \* this\.pointerVelocityX \* power, -MAX_FIELD_DISPLACEMENT, MAX_FIELD_DISPLACEMENT\)/, "field injection needs a bounded horizontal component");
  assert.match(runtime, /clamp\(this\.field\[index \+ 1\] \+ fieldStrength \* this\.pointerVelocityY \* power, -MAX_FIELD_DISPLACEMENT, MAX_FIELD_DISPLACEMENT\)/, "field injection needs a bounded vertical component");
});

test("uses texture-space Y coordinates for vertical card displacement", () => {
  const runtime = readFileSync(runtimePath, "utf8");

  assert.match(runtime, /toTextureVelocityY\(deltaY \* speedGate\)/, "DOM pointer velocity must be converted before it drives the WebGL field");
  assert.match(runtime, /toTextureGridY\(this\.pointerY, this\.rows\)/, "the DOM top-to-bottom pointer location must be converted before it selects a WebGL texture row");
});

test("keeps a revealed card native under a stationary pointer until the reveal has finished", () => {
  const runtime = readFileSync(runtimePath, "utf8");
  const controller = readFileSync(controllerPath, "utf8");
  const pointerEnter = runtime.match(/private readonly handlePointerEnter = \(event: PointerEvent\) => \{[\s\S]*?\n  \};/)?.[0] ?? "";
  const pointerMove = runtime.match(/private readonly handlePointerMove = \(event: PointerEvent\) => \{[\s\S]*?\n  \};/)?.[0] ?? "";

  assert.match(controller, /scrollReveal\.dataset\.motionHoverReady = "true";/, "home-card hover must unlock only after its media reveal completes");
  assert.match(controller, /event\.animationName !== "editorial-card-media-reveal"/, "the unlock must wait for the longer media reveal instead of the outer-card animation");
  assert.match(pointerEnter, /this\.updatePointer\(event, true\);/, "entering a card may record the pointer position");
  assert.doesNotMatch(pointerEnter, /this\.activate\(\)/, "a card moving beneath a stationary pointer must not create its hover canvas");
  assert.match(pointerMove, /this\.updatePointer\(event, false\);\s+if \(!this\.isHoverReady\(\)\) return;\s+this\.activate\(\);/, "a real pointer move must still start hover after the card is ready");
});
