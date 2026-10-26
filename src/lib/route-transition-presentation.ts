export type RouteTransitionPresentation = {
  incomingMotion: "entered" | "entering";
  playLocalEntry: boolean;
  useSequentialShutter: boolean;
};

type RouteTransitionPresentationInput = {
  autoAdvance: boolean;
  reducedMotion: boolean;
};

export function resolveRouteTransitionPresentation({
  autoAdvance,
  reducedMotion
}: RouteTransitionPresentationInput): RouteTransitionPresentation {
  if (autoAdvance) {
    return {
      incomingMotion: "entered",
      playLocalEntry: false,
      useSequentialShutter: !reducedMotion
    };
  }

  return {
    incomingMotion: reducedMotion ? "entered" : "entering",
    playLocalEntry: true,
    useSequentialShutter: false
  };
}
