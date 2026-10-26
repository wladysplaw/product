import Lenis from "lenis";
import {
  AUTO_ADVANCE_ABORT_EVENT,
  AUTO_ADVANCE_START_EVENT,
  createAutoAdvanceInputLock
} from "../lib/auto-advance-input-lock";
import { shouldResetRouteScroll } from "../lib/route-scroll-reset";
import { resolveRouteTransitionPresentation, type RouteTransitionPresentation } from "../lib/route-transition-presentation";
import { mountCaseScrollAdvance } from "./case-scroll-advance";
import { mountDomSnapshotDisplacement } from "./dom-snapshot-displacement";
import { resolvePageMotionDirection } from "./page-motion-direction";
import { mountRisingInk } from "./rising-ink";
import { mountScrollCallouts } from "./scroll-callout";
import { mountSiteIdentity } from "./site-identity";

type PageCleanup = () => void;

type RouteMotionEvent = Event & {
  direction?: string;
  navigationType?: string;
  sourceElement?: Element;
  newDocument?: Document;
  signal?: AbortSignal;
  viewTransition?: {
    finished: Promise<unknown>;
  };
};

const noop: PageCleanup = () => {};
const AUTO_ADVANCE_INPUT_QUIET_WINDOW = 180;

function combineCleanups(cleanups: PageCleanup[]): PageCleanup {
  return () => cleanups.slice().reverse().forEach((cleanup) => cleanup());
}

function getPageKind(documentToInspect: Document): string | undefined {
  return documentToInspect.querySelector<HTMLElement>("[data-page-kind]")?.dataset.pageKind;
}

export function startPageMotion(): PageCleanup {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let lenis: Lenis | undefined;
  let lenisFrame = 0;
  let entryFrame = 0;
  let pageCleanup: PageCleanup = noop;
  let routePending = false;
  let resetScrollAfterSwap = false;
  let resetScrollAfterPageLoad = false;
  let pendingNavigationType = "push";
  let pendingSourcePageKind: string | undefined;
  let resetInitialScroll = true;
  let currentRouteId = 0;
  let pageLoadRouteId = 0;
  let routeScrollLockId = 0;
  let routeTransitionFinished: Promise<unknown> | undefined;
  let disposed = false;
  let autoAdvanceResumeTimer = 0;
  let autoAdvanceRouteReady = false;
  let pendingAutoAdvance = false;
  let routePresentation: RouteTransitionPresentation = resolveRouteTransitionPresentation({
    autoAdvance: false,
    reducedMotion: reducedMotion.matches
  });
  const autoAdvanceInputLock = createAutoAdvanceInputLock(AUTO_ADVANCE_INPUT_QUIET_WINDOW);

  const stopEntry = () => {
    if (entryFrame) window.cancelAnimationFrame(entryFrame);
    entryFrame = 0;
  };

  const stopLenis = () => {
    if (lenisFrame) window.cancelAnimationFrame(lenisFrame);
    lenisFrame = 0;
    lenis?.destroy();
    lenis = undefined;
  };

  const startLenis = () => {
    if (reducedMotion.matches || lenis) return;

    lenis = new Lenis({
      anchors: true,
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9
    });

    const frame = (time: number) => {
      lenis?.raf(time);
      lenisFrame = window.requestAnimationFrame(frame);
    };

    lenisFrame = window.requestAnimationFrame(frame);
  };

  const clearAutoAdvanceResumeTimer = () => {
    if (!autoAdvanceResumeTimer) return;
    window.clearTimeout(autoAdvanceResumeTimer);
    autoAdvanceResumeTimer = 0;
  };

  const releaseAutoAdvanceInput = () => {
    clearAutoAdvanceResumeTimer();
    autoAdvanceInputLock.release();
    autoAdvanceRouteReady = false;
    if (!routeScrollLockId) lenis?.start();
  };

  const holdRouteScroll = (routeId: number) => {
    routeScrollLockId = routeId;
    lenis?.stop();
  };

  const releaseRouteScroll = (routeId: number) => {
    if (routeScrollLockId !== routeId) return;

    routeScrollLockId = 0;
    if (!autoAdvanceInputLock.isHeld()) lenis?.start();
  };

  const scheduleAutoAdvanceRelease = () => {
    clearAutoAdvanceResumeTimer();

    if (!autoAdvanceInputLock.isHeld() || !autoAdvanceRouteReady) return;

    if (autoAdvanceInputLock.canRelease(performance.now())) {
      releaseAutoAdvanceInput();
      return;
    }

    autoAdvanceResumeTimer = window.setTimeout(scheduleAutoAdvanceRelease, AUTO_ADVANCE_INPUT_QUIET_WINDOW);
  };

  const holdAutoAdvanceInput = () => {
    clearAutoAdvanceResumeTimer();
    autoAdvanceRouteReady = false;
    autoAdvanceInputLock.lock(performance.now());
    lenis?.stop();
  };

  const noteAutoAdvanceInput = () => {
    if (!autoAdvanceInputLock.isHeld()) return;

    autoAdvanceInputLock.noteInput(performance.now());
    scheduleAutoAdvanceRelease();
  };

  const markAutoAdvanceRouteReady = () => {
    if (!autoAdvanceInputLock.isHeld()) return;

    const autoAdvanceRouteId = currentRouteId;
    const releaseAfterRouteTransition = () => {
      if (autoAdvanceRouteId !== currentRouteId || !autoAdvanceInputLock.isHeld()) return;

      autoAdvanceRouteReady = true;
      scheduleAutoAdvanceRelease();
    };

    if (routeTransitionFinished) {
      void routeTransitionFinished.then(releaseAfterRouteTransition, releaseAfterRouteTransition);
      return;
    }

    releaseAfterRouteTransition();
  };

  const handleAutoAdvanceStart = () => {
    pendingAutoAdvance = true;
    root.dataset.pageMotionAutoAdvance = "true";
    root.dataset.pageMotionHideOutgoingFooter = "true";
    holdAutoAdvanceInput();
  };

  const handleAutoAdvanceAbort = () => {
    pendingAutoAdvance = false;
    root.removeAttribute("data-page-motion-auto-advance");
    root.removeAttribute("data-page-motion-hide-outgoing-footer");
    releaseAutoAdvanceInput();
  };

  const handleAutoAdvanceWheel = (event: WheelEvent) => {
    if (!autoAdvanceInputLock.isHeld()) return;

    event.preventDefault();
    noteAutoAdvanceInput();
  };

  const handleAutoAdvanceTouchMove = (event: TouchEvent) => {
    if (!autoAdvanceInputLock.isHeld()) return;

    event.preventDefault();
    noteAutoAdvanceInput();
  };

  const handleAutoAdvanceTouchEnd = () => {
    noteAutoAdvanceInput();
  };

  const unmountPage = () => {
    pageCleanup();
    pageCleanup = noop;
  };

  const mountPage = () => {
    unmountPage();
    pageCleanup = combineCleanups([
      mountDomSnapshotDisplacement(),
      mountRisingInk(),
      mountScrollCallouts(),
      mountCaseScrollAdvance(),
      mountDeferredScrollReveals(),
      mountSiteIdentity()
    ]);
  };

  const mountDeferredScrollReveals = (): PageCleanup => {
    const scrollRevealSelector = '[data-motion-reveal="case-continuation"], [data-motion-reveal="home-card"]';
    const scrollReveals = Array.from(document.querySelectorAll<HTMLElement>(scrollRevealSelector));
    if (!scrollReveals.length) return noop;

    const homeCards = scrollReveals.filter((scrollReveal) => scrollReveal.dataset.motionReveal === "home-card");
    const reset = () => scrollReveals.forEach((scrollReveal) => {
      scrollReveal.removeAttribute("data-motion-revealed");
      scrollReveal.removeAttribute("data-motion-hover-ready");
    });
    const reveal = (scrollReveal: HTMLElement, allowHoverImmediately = false) => {
      scrollReveal.dataset.motionRevealed = "true";

      if (allowHoverImmediately && scrollReveal.dataset.motionReveal === "home-card") {
        scrollReveal.dataset.motionHoverReady = "true";
      }
    };
    const unlockHomeCardHover = (event: AnimationEvent) => {
      if (event.animationName !== "editorial-card-media-reveal") return;
      if (!(event.currentTarget instanceof HTMLElement)) return;

      event.currentTarget.dataset.motionHoverReady = "true";
    };

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      scrollReveals.forEach((scrollReveal) => reveal(scrollReveal, true));
      return reset;
    }

    try {
      homeCards.forEach((homeCard) => homeCard.addEventListener("animationend", unlockHomeCardHover));

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const scrollReveal = entry.target as HTMLElement;
            reveal(scrollReveal);
            observer.unobserve(scrollReveal);
          });
        },
        { rootMargin: "0px 0px -5% 0px", threshold: 0.14 }
      );

      scrollReveals.forEach((scrollReveal) => {
        scrollReveal.removeAttribute("data-motion-revealed");
        scrollReveal.removeAttribute("data-motion-hover-ready");
        observer.observe(scrollReveal);
      });
      root.dataset.pageMotionScrollReveals = "enhanced";

      return () => {
        observer.disconnect();
        homeCards.forEach((homeCard) => homeCard.removeEventListener("animationend", unlockHomeCardHover));
        reset();
        root.removeAttribute("data-page-motion-scroll-reveals");
      };
    } catch {
      homeCards.forEach((homeCard) => homeCard.removeEventListener("animationend", unlockHomeCardHover));
      scrollReveals.forEach((scrollReveal) => reveal(scrollReveal, true));
      return reset;
    }
  };

  const enterPage = () => {
    stopEntry();

    if (reducedMotion.matches) {
      root.dataset.pageMotion = "entered";
      return;
    }

    root.dataset.pageMotion = "entering";
    entryFrame = window.requestAnimationFrame(() => {
      entryFrame = window.requestAnimationFrame(() => {
        root.dataset.pageMotion = "entered";
        entryFrame = 0;
      });
    });
  };

  const enterAfterRouteTransition = (routeId: number) => {
    const beginEntry = () => {
      if (disposed || routeId !== currentRouteId) return;
      enterPage();
    };

    if (reducedMotion.matches || !routeTransitionFinished) {
      beginEntry();
      return;
    }

    void routeTransitionFinished.then(beginEntry, beginEntry);
  };

  const handleBeforePreparation = (event: Event) => {
    const routeEvent = event as RouteMotionEvent;
    const navigationType = routeEvent.navigationType ?? "push";
    const source = routeEvent.sourceElement;
    const sourceDirection = source instanceof HTMLElement ? source.dataset.pageMotionDirection : undefined;
    const direction = resolvePageMotionDirection(
      navigationType,
      routeEvent.direction ?? "forward",
      sourceDirection
    );
    routePresentation = resolveRouteTransitionPresentation({
      autoAdvance: pendingAutoAdvance,
      reducedMotion: reducedMotion.matches
    });
    pendingAutoAdvance = false;

    if (routePresentation.playLocalEntry) {
      root.removeAttribute("data-page-motion-auto-advance");
    } else {
      root.dataset.pageMotionAutoAdvance = "true";
    }

    stopEntry();
    unmountPage();
    if (routeScrollLockId) releaseRouteScroll(routeScrollLockId);
    routePending = true;
    pendingNavigationType = navigationType;
    pendingSourcePageKind = getPageKind(document);
    const resetRouteScroll = shouldResetRouteScroll({
      navigationType: pendingNavigationType,
      from: pendingSourcePageKind
    });
    resetScrollAfterSwap = resetRouteScroll;
    resetScrollAfterPageLoad = resetRouteScroll;
    currentRouteId += 1;
    pageLoadRouteId = currentRouteId;
    if (resetRouteScroll) {
      const routeId = pageLoadRouteId;
      holdRouteScroll(routeId);
      routeEvent.signal?.addEventListener("abort", () => releaseRouteScroll(routeId), { once: true });
    }
    routeTransitionFinished = undefined;
    root.dataset.pageMotionDirection = direction;
    root.dataset.pageMotion = reducedMotion.matches ? "entered" : "leaving";
  };

  const handleBeforeSwap = (event: Event) => {
    const routeEvent = event as RouteMotionEvent;
    const targetPageKind = routeEvent.newDocument ? getPageKind(routeEvent.newDocument) : undefined;
    const resetRouteScroll = shouldResetRouteScroll({
      navigationType: pendingNavigationType,
      from: pendingSourcePageKind,
      to: targetPageKind
    });

    resetScrollAfterSwap = resetRouteScroll;
    resetScrollAfterPageLoad = resetRouteScroll;
    if (resetRouteScroll) {
      holdRouteScroll(pageLoadRouteId);
    } else {
      releaseRouteScroll(pageLoadRouteId);
    }
    routeTransitionFinished = routeEvent.viewTransition?.finished;

    if (routeEvent.newDocument) {
      routeEvent.newDocument.documentElement.dataset.pageMotionDirection = root.dataset.pageMotionDirection ?? "forward";
      routeEvent.newDocument.documentElement.dataset.pageMotion = routePresentation.incomingMotion;
      routeEvent.newDocument.documentElement.removeAttribute("data-page-motion-hide-outgoing-footer");

      if (routePresentation.playLocalEntry) {
        routeEvent.newDocument.documentElement.removeAttribute("data-page-motion-auto-advance");
      } else {
        routeEvent.newDocument.documentElement.dataset.pageMotionAutoAdvance = "true";
      }
    }
  };

  const resetDocumentScroll = () => {
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previousScrollBehavior;
    lenis?.scrollTo(0, { immediate: true, force: true });
  };

  const settleRouteScroll = (routeId: number) => {
    const settle = () => {
      if (disposed || routeId !== currentRouteId || routeScrollLockId !== routeId) return;

      window.requestAnimationFrame(() => {
        if (disposed || routeId !== currentRouteId || routeScrollLockId !== routeId) return;

        resetDocumentScroll();
        releaseRouteScroll(routeId);
      });
    };

    if (routeTransitionFinished) {
      void routeTransitionFinished.then(settle, settle);
      return;
    }

    settle();
  };

  const handleAfterSwap = () => {
    document.documentElement.removeAttribute("data-page-motion-hide-outgoing-footer");
    lenis?.resize();

    if (resetScrollAfterSwap) {
      resetDocumentScroll();
      resetScrollAfterSwap = false;
    }
  };

  const handlePageLoad = () => {
    if (!routePending) {
      if (resetInitialScroll && !window.location.hash) {
        resetDocumentScroll();
      }

      resetInitialScroll = false;
      return;
    }

    routePending = false;
    resetInitialScroll = false;
    const routeId = pageLoadRouteId;
    mountPage();

    if (resetScrollAfterPageLoad) {
      resetDocumentScroll();
      resetScrollAfterPageLoad = false;
    }

    if (routeScrollLockId === routeId) {
      settleRouteScroll(routeId);
    }

    if (autoAdvanceInputLock.isHeld()) {
      resetDocumentScroll();
      window.requestAnimationFrame(() => {
        if (autoAdvanceInputLock.isHeld()) resetDocumentScroll();
      });
      markAutoAdvanceRouteReady();
    }

    if (routePresentation.playLocalEntry) {
      enterAfterRouteTransition(routeId);
    }
  };

  const handleReducedMotionChange = () => {
    stopEntry();
    unmountPage();
    stopLenis();

    if (reducedMotion.matches) {
      root.dataset.pageMotion = "entered";
      return;
    }

    startLenis();
    mountPage();
    enterPage();
  };

  const handlePageHide = (event: PageTransitionEvent) => {
    if (event.persisted) return;
    dispose();
  };

  const handlePageShow = (event: PageTransitionEvent) => {
    if (!event.persisted || disposed) return;
    lenis?.resize();
  };

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    stopEntry();
    unmountPage();
    stopLenis();
    clearAutoAdvanceResumeTimer();
    autoAdvanceInputLock.release();
    document.removeEventListener("astro:before-preparation", handleBeforePreparation);
    document.removeEventListener("astro:before-swap", handleBeforeSwap);
    document.removeEventListener("astro:after-swap", handleAfterSwap);
    document.removeEventListener("astro:page-load", handlePageLoad);
    reducedMotion.removeEventListener("change", handleReducedMotionChange);
    window.removeEventListener("pagehide", handlePageHide);
    window.removeEventListener("pageshow", handlePageShow);
    window.removeEventListener(AUTO_ADVANCE_START_EVENT, handleAutoAdvanceStart);
    window.removeEventListener(AUTO_ADVANCE_ABORT_EVENT, handleAutoAdvanceAbort);
    window.removeEventListener("wheel", handleAutoAdvanceWheel);
    window.removeEventListener("touchmove", handleAutoAdvanceTouchMove);
    window.removeEventListener("touchend", handleAutoAdvanceTouchEnd);
  };

  document.addEventListener("astro:before-preparation", handleBeforePreparation);
  document.addEventListener("astro:before-swap", handleBeforeSwap);
  document.addEventListener("astro:after-swap", handleAfterSwap);
  document.addEventListener("astro:page-load", handlePageLoad);
  reducedMotion.addEventListener("change", handleReducedMotionChange);
  window.addEventListener("pagehide", handlePageHide);
  window.addEventListener("pageshow", handlePageShow);
  window.addEventListener(AUTO_ADVANCE_START_EVENT, handleAutoAdvanceStart);
  window.addEventListener(AUTO_ADVANCE_ABORT_EVENT, handleAutoAdvanceAbort);
  window.addEventListener("wheel", handleAutoAdvanceWheel, { passive: false });
  window.addEventListener("touchmove", handleAutoAdvanceTouchMove, { passive: false });
  window.addEventListener("touchend", handleAutoAdvanceTouchEnd, { passive: true });

  startLenis();
  mountPage();
  enterPage();

  return dispose;
}
