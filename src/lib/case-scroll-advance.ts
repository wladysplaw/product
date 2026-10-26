export const CASE_SCROLL_ADVANCE_DISTANCE = 96;

type CaseScrollAdvanceInput = {
  atEnd: boolean;
  deltaY: number;
  accumulatedDelta: number;
  navigating: boolean;
};

export function shouldAdvanceCase({ atEnd, deltaY, accumulatedDelta, navigating }: CaseScrollAdvanceInput) {
  return atEnd && deltaY > 0 && !navigating && accumulatedDelta + deltaY >= CASE_SCROLL_ADVANCE_DISTANCE;
}
