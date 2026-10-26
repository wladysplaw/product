const LINK_SELECTOR = "a[data-rising-ink]";
const PLATE_COUNT = 3;
const REST_EPSILON = 0.015;

type SpringValue = {
  current: number;
  velocity: number;
  target: number;
};

type GlyphState = {
  element: HTMLSpanElement;
  plates: HTMLSpanElement[];
  lift: SpringValue;
  offsetX: SpringValue;
  offsetY: SpringValue;
  pitch: SpringValue;
  yaw: SpringValue;
  depthX: SpringValue;
  depthY: SpringValue;
};

const clamp = (value: number, minimum: number, maximum: number) => Math.min(Math.max(value, minimum), maximum);

function createSpringValue(): SpringValue {
  return { current: 0, velocity: 0, target: 0 };
}

function advanceSpring(value: SpringValue, delta: number) {
  const acceleration = (value.target - value.current) * 210 - value.velocity * 26;

  value.velocity += acceleration * delta;
  value.current += value.velocity * delta;

  if (Math.abs(value.target - value.current) < REST_EPSILON && Math.abs(value.velocity) < REST_EPSILON) {
    value.current = value.target;
    value.velocity = 0;
  }

  return Math.abs(value.target - value.current) >= REST_EPSILON || Math.abs(value.velocity) >= REST_EPSILON;
}

function setTarget(value: SpringValue, target: number) {
  value.target = target;
}

class RisingInk {
  private readonly anchor: HTMLAnchorElement;
  private readonly sourceText: string;
  private readonly glyphs: GlyphState[] = [];
  private readonly addedAriaLabel: boolean;
  private readonly liftScale: number;
  private readonly chromaScale: number;
  private readonly opacityScale: number;
  private animationFrame = 0;
  private previousFrameTime = 0;

  constructor(anchor: HTMLAnchorElement) {
    this.anchor = anchor;
    this.sourceText = anchor.textContent ?? "";
    this.addedAriaLabel = !anchor.hasAttribute("aria-label");
    const computedStyle = window.getComputedStyle(anchor);

    this.liftScale = Number.parseFloat(computedStyle.getPropertyValue("--rising-ink-lift-scale")) || 1;
    this.chromaScale = Number.parseFloat(computedStyle.getPropertyValue("--rising-ink-chroma-scale")) || 1;
    this.opacityScale = Number.parseFloat(computedStyle.getPropertyValue("--rising-ink-opacity-scale")) || 1;

    if (this.addedAriaLabel) {
      anchor.setAttribute("aria-label", this.sourceText);
    }

    this.build();
    anchor.classList.add("is-rising-ink-ready");
    anchor.dataset.risingInkReady = "true";
    anchor.addEventListener("pointermove", this.handlePointerMove);
    anchor.addEventListener("pointerleave", this.resetTargets);
  }

  private build() {
    const root = document.createElement("span");

    root.className = "rising-ink";
    root.setAttribute("aria-hidden", "true");

    for (const character of this.sourceText) {
      if (/\s/.test(character)) {
        root.append(document.createTextNode(character));
        continue;
      }

      const glyph = document.createElement("span");
      const face = document.createElement("span");
      const plates: HTMLSpanElement[] = [];

      glyph.className = "rising-ink__glyph";
      face.className = "rising-ink__face";
      face.textContent = character;

      for (let index = 0; index < PLATE_COUNT; index += 1) {
        const plate = document.createElement("span");

        plate.className = "rising-ink__plate";
        plate.textContent = character;
        glyph.append(plate);
        plates.push(plate);
      }

      glyph.append(face);
      root.append(glyph);
      this.glyphs.push({
        element: glyph,
        plates,
        lift: createSpringValue(),
        offsetX: createSpringValue(),
        offsetY: createSpringValue(),
        pitch: createSpringValue(),
        yaw: createSpringValue(),
        depthX: createSpringValue(),
        depthY: createSpringValue()
      });
    }

    this.anchor.replaceChildren(root);
  }

  private handlePointerMove = (event: PointerEvent) => {
    const computedStyle = window.getComputedStyle(this.anchor);
    const fontSize = Number.parseFloat(computedStyle.fontSize) || 16;
    const radius = Math.max(fontSize * 2.6, 46);

    for (const glyph of this.glyphs) {
      const bounds = glyph.element.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const deltaX = centerX - event.clientX;
      const deltaY = centerY - event.clientY;
      const distance = Math.hypot(deltaX, deltaY);
      const proximity = 1 - clamp(distance / radius, 0, 1);
      const influence = proximity * proximity * (3 - 2 * proximity);
      const normalizedDistance = Math.max(distance, 1);
      const directionX = deltaX / normalizedDistance;
      const directionY = deltaY / normalizedDistance;
      const lift = fontSize * 0.48 * this.liftScale * influence;

      setTarget(glyph.lift, lift);
      setTarget(glyph.offsetX, directionX * lift * 0.22);
      setTarget(glyph.offsetY, directionY * lift * 0.12);
      setTarget(glyph.pitch, -directionY * influence * 9);
      setTarget(glyph.yaw, directionX * influence * 9);
      setTarget(glyph.depthX, -directionX * lift * 0.28);
      setTarget(glyph.depthY, -directionY * lift * 0.18);
    }

    this.requestRender();
  };

  private resetTargets = () => {
    for (const glyph of this.glyphs) {
      setTarget(glyph.lift, 0);
      setTarget(glyph.offsetX, 0);
      setTarget(glyph.offsetY, 0);
      setTarget(glyph.pitch, 0);
      setTarget(glyph.yaw, 0);
      setTarget(glyph.depthX, 0);
      setTarget(glyph.depthY, 0);
    }

    this.requestRender();
  };

  private requestRender() {
    if (!this.animationFrame) {
      this.animationFrame = window.requestAnimationFrame(this.render);
    }
  }

  private render = (time: number) => {
    this.animationFrame = 0;
    const delta = this.previousFrameTime ? clamp((time - this.previousFrameTime) / 1000, 0.001, 0.04) : 1 / 60;

    this.previousFrameTime = time;

    let isMoving = false;

    for (const glyph of this.glyphs) {
      isMoving = advanceSpring(glyph.lift, delta) || isMoving;
      isMoving = advanceSpring(glyph.offsetX, delta) || isMoving;
      isMoving = advanceSpring(glyph.offsetY, delta) || isMoving;
      isMoving = advanceSpring(glyph.pitch, delta) || isMoving;
      isMoving = advanceSpring(glyph.yaw, delta) || isMoving;
      isMoving = advanceSpring(glyph.depthX, delta) || isMoving;
      isMoving = advanceSpring(glyph.depthY, delta) || isMoving;

      glyph.element.style.transform = [
        `translate3d(${glyph.offsetX.current.toFixed(2)}px, ${(glyph.offsetY.current - glyph.lift.current * 0.24).toFixed(2)}px, ${glyph.lift.current.toFixed(2)}px)`,
        `rotateX(${glyph.pitch.current.toFixed(2)}deg)`,
        `rotateY(${glyph.yaw.current.toFixed(2)}deg)`
      ].join(" ");

      glyph.plates.forEach((plate, index) => {
        const fraction = (index + 1) / (glyph.plates.length + 1);
        const channel = index - (glyph.plates.length - 1) / 2;
        const chromaSpread = Math.max(0.5, glyph.lift.current * 0.09) * this.chromaScale;
        const depthMagnitude = Math.hypot(glyph.depthX.current, glyph.depthY.current);
        const lateralX = depthMagnitude > 0.01 ? (glyph.depthY.current / depthMagnitude) * channel * chromaSpread : 0;
        const lateralY = depthMagnitude > 0.01 ? (-glyph.depthX.current / depthMagnitude) * channel * chromaSpread : 0;
        const opacity = clamp((glyph.lift.current / 12) * (0.3 + (1 - Math.abs(channel)) * 0.04) * this.opacityScale, 0, 0.46);
        const extrusionY = glyph.lift.current * fraction * 0.12;
        const zOffset = -fraction * Math.max(0.5, glyph.lift.current * 0.12);

        plate.style.opacity = opacity.toFixed(3);
        plate.style.transform = `translate3d(${(glyph.depthX.current * 0.14 + lateralX).toFixed(2)}px, ${(glyph.depthY.current * 0.1 + extrusionY + lateralY).toFixed(2)}px, ${zOffset.toFixed(2)}px)`;
      });
    }

    if (isMoving) {
      this.requestRender();
    } else {
      this.previousFrameTime = 0;
    }
  };

  destroy() {
    this.anchor.removeEventListener("pointermove", this.handlePointerMove);
    this.anchor.removeEventListener("pointerleave", this.resetTargets);

    if (this.animationFrame) {
      window.cancelAnimationFrame(this.animationFrame);
    }

    this.anchor.classList.remove("is-rising-ink-ready");
    delete this.anchor.dataset.risingInkReady;
    this.anchor.replaceChildren(this.sourceText);

    if (this.addedAriaLabel) {
      this.anchor.removeAttribute("aria-label");
    }
  }
}

export function mountRisingInk(): () => void {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  if (reducedMotion.matches || !finePointer.matches) return () => {};

  const effects = Array.from(document.querySelectorAll<HTMLAnchorElement>(LINK_SELECTOR))
    .filter((anchor) => anchor.dataset.risingInkReady !== "true" && Boolean(anchor.textContent?.trim()))
    .map((anchor) => new RisingInk(anchor));

  return () => effects.forEach((effect) => effect.destroy());
}
