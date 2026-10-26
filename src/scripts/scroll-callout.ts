import { resolveScrollCalloutStage } from "../lib/scroll-callout-stage";

const CALLOUT_SELECTOR = "[data-scroll-callout]";
const SCRAMBLE_SYMBOLS = ["+", "×", "·", "=", "°", "÷", "~"] as const;
const EXPANDED_SCALE = 2.75;
const SCRAMBLE_DURATION = 760;

type CalloutGlyph = {
  element: HTMLElement;
  face: HTMLElement;
  plates: HTMLElement[];
  character: string;
};

type Callout = {
  element: HTMLElement;
  stage: HTMLElement;
  footer: HTMLElement;
  region: HTMLElement;
  glyphs: CalloutGlyph[];
  fontSize: number;
  lineHeight: number;
  expanded: boolean | undefined;
  scrambleFrame: number;
};

const clamp = (value: number, minimum: number, maximum: number) => Math.min(Math.max(value, minimum), maximum);

function easeOutQuint(value: number) {
  return 1 - (1 - value) ** 5;
}

function seededDirection(index: number, salt: number) {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;

  return (value - Math.floor(value)) * 2 - 1;
}

function setGlyphCharacter(glyph: CalloutGlyph, character: string) {
  if (glyph.face.textContent === character) return;

  glyph.face.textContent = character;
  glyph.plates.forEach((plate) => {
    plate.textContent = character;
  });
}

function resetGlyphs(glyphs: CalloutGlyph[]) {
  glyphs.forEach((glyph) => {
    setGlyphCharacter(glyph, glyph.character);
    glyph.face.style.removeProperty("--scroll-callout-glyph-x");
    glyph.face.style.removeProperty("--scroll-callout-glyph-y");
    glyph.face.style.removeProperty("--scroll-callout-glyph-turn");
  });
}

function updateGlyphAssembly(glyphs: CalloutGlyph[], progress: number) {
  const glyphCount = Math.max(glyphs.length, 1);

  glyphs.forEach((glyph, index) => {
    const glyphProgress = clamp((progress - index * 0.035) / 0.76, 0, 1);
    const assemblyStrength = Math.sin(glyphProgress * Math.PI);
    const horizontal = seededDirection(index, 1) * assemblyStrength * 0.16;
    const vertical = seededDirection(index, 2) * assemblyStrength * 0.13;
    const rotation = seededDirection(index, 3) * assemblyStrength * 7;

    glyph.face.style.setProperty("--scroll-callout-glyph-x", `${horizontal.toFixed(3)}em`);
    glyph.face.style.setProperty("--scroll-callout-glyph-y", `${vertical.toFixed(3)}em`);
    glyph.face.style.setProperty("--scroll-callout-glyph-turn", `${rotation.toFixed(2)}deg`);
  });
}

function updateGlyphSymbols(glyphs: CalloutGlyph[], progress: number) {
  const glyphCount = Math.max(glyphs.length, 1);
  const wavePosition = progress * (glyphCount + 2.5) - 1.25;

  glyphs.forEach((glyph, index) => {
    const symbolStrength = clamp(1 - Math.abs(index - wavePosition) / 1.6, 0, 1);
    const sequenceStep = Math.floor(progress * 14 + index * 2.3);
    const replacement = SCRAMBLE_SYMBOLS[sequenceStep % SCRAMBLE_SYMBOLS.length];
    const nextSymbol = symbolStrength > 0.24 ? replacement : glyph.character;

    setGlyphCharacter(glyph, nextSymbol);
  });
}

function collectGlyphs(callout: HTMLElement, fontSize: number): CalloutGlyph[] {
  return [...callout.querySelectorAll<HTMLElement>(".rising-ink__glyph")].flatMap((element) => {
    const face = element.querySelector<HTMLElement>(".rising-ink__face");
    const character = face?.textContent ?? "";

    if (!face || !character) return [];

    const width = element.getBoundingClientRect().width;

    if (width > 0) {
      element.style.setProperty("--scroll-callout-glyph-width", `${(width / Math.max(fontSize, 1)).toFixed(4)}em`);
    }

    return [{
      element,
      face,
      plates: [...element.querySelectorAll<HTMLElement>(".rising-ink__plate")],
      character
    }];
  });
}

function cancelGlyphScramble(callout: Callout, restoreGlyphs = true) {
  if (callout.scrambleFrame) window.cancelAnimationFrame(callout.scrambleFrame);
  callout.scrambleFrame = 0;

  if (restoreGlyphs) resetGlyphs(callout.glyphs);
}

function runGlyphScramble(callout: Callout) {
  cancelGlyphScramble(callout, false);

  const startedAt = performance.now();
  const frame = (now: number) => {
    const progress = clamp((now - startedAt) / SCRAMBLE_DURATION, 0, 1);
    const easedProgress = easeOutQuint(progress);

    updateGlyphSymbols(callout.glyphs, progress);
    updateGlyphAssembly(callout.glyphs, easedProgress);

    if (progress < 1) {
      callout.scrambleFrame = window.requestAnimationFrame(frame);
      return;
    }

    callout.scrambleFrame = 0;
    resetGlyphs(callout.glyphs);
  };

  callout.scrambleFrame = window.requestAnimationFrame(frame);
}

function setCalloutExpansion(callout: Callout, expanded: boolean, animateGlyphs: boolean) {
  const scale = expanded ? EXPANDED_SCALE : 1;

  callout.expanded = expanded;
  callout.element.classList.toggle("is-scroll-callout-expanded", expanded);
  callout.footer.dataset.scrollCalloutState = expanded ? "expanded" : "compact";
  callout.element.style.setProperty("--scroll-callout-font-size", `${(callout.fontSize * scale).toFixed(2)}px`);
  callout.element.style.setProperty("--scroll-callout-line-height", `${(callout.lineHeight * scale).toFixed(2)}px`);

  if (expanded && animateGlyphs) {
    runGlyphScramble(callout);
    return;
  }

  cancelGlyphScramble(callout);
}

export function mountScrollCallouts(): () => void {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const callouts: Callout[] = [...document.querySelectorAll<HTMLElement>(CALLOUT_SELECTOR)].flatMap((callout) => {
    const stage = callout.closest("[data-scroll-callout-stage]");
    if (!(stage instanceof HTMLElement)) return [];

    const footer = stage.closest("footer");
    if (!(footer instanceof HTMLElement)) return [];

    const region = footer.closest("[data-scroll-callout-region]");
    if (!(region instanceof HTMLElement)) return [];

    const style = window.getComputedStyle(callout);
    const fontSize = Number.parseFloat(style.fontSize) || 16;
    const lineHeight = Number.parseFloat(style.lineHeight) || fontSize * 1.2;
    const glyphs = collectGlyphs(callout, fontSize);

    return [{
      element: callout,
      stage,
      footer,
      region,
      glyphs,
      fontSize,
      lineHeight,
      expanded: undefined,
      scrambleFrame: 0
    }];
  });

  if (!callouts.length) return () => {};

  let animationFrame = 0;

  const render = () => {
    animationFrame = 0;

    const viewportHeight = Math.max(window.innerHeight, 1);

    callouts.forEach((callout) => {
      const regionBounds = callout.region.getBoundingClientRect();
      const { stageHeight, expanded } = resolveScrollCalloutStage({
        regionTop: regionBounds.top,
        viewportHeight
      });

      callout.element.classList.add("scroll-callout", "is-scroll-callout-ready");
      callout.footer.style.setProperty("--scroll-callout-stage-height", `${stageHeight.toFixed(1)}px`);
      callout.stage.style.setProperty("--scroll-callout-stage-height", `${stageHeight.toFixed(1)}px`);

      if (expanded !== callout.expanded) {
        setCalloutExpansion(callout, expanded, !reducedMotion.matches);
      }
    });
  };

  const schedule = () => {
    if (!animationFrame) animationFrame = window.requestAnimationFrame(render);
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  schedule();

  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    window.cancelAnimationFrame(animationFrame);
    callouts.forEach((callout) => {
      cancelGlyphScramble(callout);
      callout.element.classList.remove("scroll-callout", "is-scroll-callout-ready", "is-scroll-callout-expanded");
      callout.element.style.removeProperty("--scroll-callout-font-size");
      callout.element.style.removeProperty("--scroll-callout-line-height");
      callout.footer.removeAttribute("data-scroll-callout-state");
      callout.footer.style.removeProperty("--scroll-callout-stage-height");
      callout.stage.style.removeProperty("--scroll-callout-stage-height");
      callout.glyphs.forEach((glyph) => {
        glyph.element.style.removeProperty("--scroll-callout-glyph-width");
      });
    });
  };
}
