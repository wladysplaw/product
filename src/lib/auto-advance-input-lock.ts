export const AUTO_ADVANCE_START_EVENT = "product:auto-advance-start";
export const AUTO_ADVANCE_ABORT_EVENT = "product:auto-advance-abort";

type AutoAdvanceInputLock = {
  lock: (now: number) => void;
  noteInput: (now: number) => void;
  canRelease: (now: number) => boolean;
  isHeld: () => boolean;
  release: () => void;
};

export function createAutoAdvanceInputLock(quietWindow: number): AutoAdvanceInputLock {
  let held = false;
  let lastInputAt = 0;

  return {
    lock(now) {
      held = true;
      lastInputAt = now;
    },
    noteInput(now) {
      if (!held) return;
      lastInputAt = now;
    },
    canRelease(now) {
      return held && now - lastInputAt >= quietWindow;
    },
    isHeld() {
      return held;
    },
    release() {
      held = false;
      lastInputAt = 0;
    }
  };
}
