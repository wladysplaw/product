const PORTRAIT_SELECTOR = "[data-site-identity-portrait]";

export function mountSiteIdentity(): () => void {
  const cleanups = [...document.querySelectorAll<HTMLElement>(PORTRAIT_SELECTOR)].map((portrait) => {
    let hoverCount = 0;

    const activatePortrait = () => {
      hoverCount += 1;
      portrait.classList.add("is-portrait-hovered");
      portrait.classList.toggle("is-portrait-rare-hover", hoverCount % 5 === 0);
    };

    const deactivatePortrait = () => {
      portrait.classList.remove("is-portrait-hovered", "is-portrait-rare-hover");
    };

    portrait.addEventListener("mouseenter", activatePortrait);
    portrait.addEventListener("mouseleave", deactivatePortrait);

    return () => {
      portrait.removeEventListener("mouseenter", activatePortrait);
      portrait.removeEventListener("mouseleave", deactivatePortrait);
      deactivatePortrait();
    };
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}
