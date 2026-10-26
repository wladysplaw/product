export type PageMotionDirection = "forward" | "back";

export function resolvePageMotionDirection(
  navigationType: string,
  routerDirection: string,
  sourceDirection?: string
): PageMotionDirection {
  if (sourceDirection === "back" || sourceDirection === "forward") {
    return sourceDirection;
  }

  if (navigationType === "traverse" && routerDirection === "back") {
    return "back";
  }

  return "forward";
}
