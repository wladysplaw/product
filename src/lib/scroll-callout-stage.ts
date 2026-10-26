export type ScrollCalloutStageInput = {
  regionTop: number;
  viewportHeight: number;
};

export type ScrollCalloutStage = {
  stageHeight: number;
  expanded: boolean;
};

const TOP_CARD_RATIO = 0.2;
const BOTTOM_CARD_RATIO = 0.8;
const FINAL_BOUNDARY_EPSILON = 0.5;
const EXPANSION_TRIGGER_LEAD = 16;

const clamp = (value: number, minimum: number, maximum: number) => Math.min(Math.max(value, minimum), maximum);

export function resolveScrollCalloutStage({ regionTop, viewportHeight }: ScrollCalloutStageInput): ScrollCalloutStage {
  const height = Math.max(viewportHeight, 1);
  const topCardBoundary = height * TOP_CARD_RATIO;
  const lowerCardBoundary = height * BOTTOM_CARD_RATIO;
  const visibleCardBoundary = clamp(regionTop, topCardBoundary, lowerCardBoundary);
  const settledAtBoundary = regionTop <= topCardBoundary + FINAL_BOUNDARY_EPSILON;
  const expanded = regionTop <= topCardBoundary + EXPANSION_TRIGGER_LEAD;
  const settledCardBoundary = settledAtBoundary ? topCardBoundary : visibleCardBoundary;

  return {
    stageHeight: height - settledCardBoundary,
    expanded
  };
}
