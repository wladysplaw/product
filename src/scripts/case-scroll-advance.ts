import { navigate } from "astro:transitions/client";
import { AUTO_ADVANCE_ABORT_EVENT, AUTO_ADVANCE_START_EVENT } from "../lib/auto-advance-input-lock";
import { shouldAdvanceCase } from "../lib/case-scroll-advance";

const NEXT_LINK_SELECTOR = ".case-footer__next";
const END_TOLERANCE = 2;
const LINE_SCROLL_DISTANCE = 16;

const noop = () => {};

function isAtDocumentEnd() {
  const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);

  return window.scrollY + window.innerHeight >= documentHeight - END_TOLERANCE;
}

function pixelDelta(event: WheelEvent) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * LINE_SCROLL_DISTANCE;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight;

  return event.deltaY;
}

export function mountCaseScrollAdvance(): () => void {
  const nextLink = document.querySelector<HTMLAnchorElement>(NEXT_LINK_SELECTOR);
  if (!nextLink) return noop;

  let accumulatedDelta = 0;
  let navigating = false;
  let touchStartY: number | null = null;
  let touchStartedAtEnd = false;

  const advanceIfIntended = (deltaY: number) => {
    const atEnd = isAtDocumentEnd();

    if (!atEnd || deltaY <= 0) {
      accumulatedDelta = 0;
      return;
    }

    if (shouldAdvanceCase({ atEnd, deltaY, accumulatedDelta, navigating })) {
      navigating = true;
      window.dispatchEvent(new Event(AUTO_ADVANCE_START_EVENT));
      void navigate(nextLink.href).catch(() => {
        window.dispatchEvent(new Event(AUTO_ADVANCE_ABORT_EVENT));
        navigating = false;
      });
      return;
    }

    accumulatedDelta += deltaY;
  };

  const handleWheel = (event: WheelEvent) => {
    advanceIfIntended(pixelDelta(event));
  };

  const handleScroll = () => {
    if (!isAtDocumentEnd()) accumulatedDelta = 0;
  };

  const handleTouchStart = (event: TouchEvent) => {
    touchStartY = event.touches.item(0)?.clientY ?? null;
    touchStartedAtEnd = isAtDocumentEnd();
  };

  const handleTouchEnd = (event: TouchEvent) => {
    const endY = event.changedTouches.item(0)?.clientY;

    if (touchStartY === null || endY === undefined || !touchStartedAtEnd) {
      accumulatedDelta = 0;
    } else {
      advanceIfIntended(touchStartY - endY);
    }

    touchStartY = null;
    touchStartedAtEnd = false;
  };

  const resetTouch = () => {
    touchStartY = null;
    touchStartedAtEnd = false;
  };

  window.addEventListener("wheel", handleWheel, { passive: true });
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchend", handleTouchEnd, { passive: true });
  window.addEventListener("touchcancel", resetTouch, { passive: true });

  return () => {
    window.removeEventListener("wheel", handleWheel);
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchend", handleTouchEnd);
    window.removeEventListener("touchcancel", resetTouch);
  };
}
