export type RouteScrollResetInput = {
  navigationType: string;
  from?: string;
  to?: string;
};

export function shouldResetRouteScroll({ navigationType, from, to }: RouteScrollResetInput): boolean {
  if (navigationType !== "traverse") return true;

  return (from === "case" && to === "home") || (from === "home" && to === "case");
}
