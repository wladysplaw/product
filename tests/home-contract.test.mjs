import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const builtHome = path.resolve(testDirectory, "../dist/index.html");
const globalStyles = path.resolve(testDirectory, "../src/styles/global.css");
const homePage = path.resolve(testDirectory, "../src/pages/index.astro");
const siteIdentity = path.resolve(testDirectory, "../src/components/SiteIdentity.astro");
const tokenStyles = path.resolve(testDirectory, "../src/styles/tokens.css");

test("built home exposes the visible Figma project-card hierarchy", () => {
  const html = readFileSync(builtHome, "utf8");
  const projectCardCount = (html.match(/data-testid="project-card"/g) ?? []).length;

  assert.match(html, /<main[^>]+id="main-content"/, "home must retain a semantic main landmark");
  assert.match(html, /data-testid="figma-home"/, "home must expose the Figma home composition hook");
  assert.match(html, /data-testid="figma-home-header"/, "home must expose the Figma header composition hook");
  assert.match(html, /data-testid="services"/, "home must render the services grid landmark");
  assert.match(html, /href="mailto:sprsplv@gmail\.com"[^>]*>email<\/a>/, "the contact email label must open the supplied mailbox");
  assert.match(html, /href="https:\/\/t\.me\/saysskyy"/, "Let’s Talk must use the approved Telegram URL");
  const creativeCodingIndex = html.indexOf("Creative coding");
  const creativeCodingLinkIndex = html.indexOf('href="https://wladysplaw.github.io/">explore</a>');

  assert.ok(creativeCodingIndex >= 0, "home must introduce creative coding and visual experiments alongside Digital Experiences");
  assert.ok(creativeCodingLinkIndex > creativeCodingIndex, "the compact main-site link must follow the Creative Coding block");
  assert.match(html, /<a data-rising-ink class="service-list__link" href="https:\/\/wladysplaw\.github\.io\/">explore<\/a>/, "the creative link must use the same interactive link treatment as email and Telegram");
  assert.match(html, /class="footer-marks"/, "home footer must render the Figma ownership marks");
  assert.match(html, /© th&amp;/, "home footer must retain the supplied ownership text");
  assert.match(html, /2122/, "home footer must retain the supplied year mark");
  assert.match(html, /src="\/product\/assets\/footer\/1\.svg"/, "home footer must load the first supplied mark locally");
  assert.match(html, /src="\/product\/assets\/footer\/2\.svg"/, "home footer must load the second supplied mark locally");
  assert.match(html, /src="\/product\/assets\/footer\/3\.svg"/, "home footer must load the third supplied mark locally");
  assert.equal(projectCardCount, 6, "home must expose all six visible Figma card instances");
  assert.match(html, /content platform experiments/, "home must retain the Pock project label");
  assert.match(html, /football federation platform/, "home must retain the compact football federation label");
  assert.match(html, /art direction, concept, ux\/ui — at brele/, "home must credit the football federation work to brele");
  assert.match(html, /Sheremetyevo International Airport/, "home must label the Sheremetyevo card independently");
  assert.match(html, /research platform/, "home must label the research card independently");
  assert.match(html, /internet computer/, "home must label the Internet Computer card independently");
  assert.match(html, /high st/, "home must label the High St card independently");
  assert.doesNotMatch(html, /data-testid="empty-project-surface"/, "home must not retain neutral skeleton surfaces");
  assert.match(html, /class="site-identity__visual" aria-hidden="true"/, "the visual identity lines must be isolated from the accessible heading");
  assert.match(html, /src="\/product\/assets\/portrait\/me01\.png"/, "the default full portrait must appear in the header");
  assert.match(html, /src="\/product\/assets\/portrait\/me02\.png"/, "the first hover portrait must be available locally");
  assert.match(html, /src="\/product\/assets\/portrait\/me03\.png"/, "the rare hover portrait must be available locally");
  assert.match(html, /class="visually-hidden">Władysław — design digital products, from strategy to deployment and beyond<\/span>/, "the identity heading must expose a complete accessible sentence");
  assert.match(html, /class="site-identity__summary-visual" aria-hidden="true"/, "the visual identity summary must be isolated from its accessible copy");
  assert.match(html, /class="home__contact-copy" aria-hidden="true"/, "the visual contact lines must be isolated from their accessible copy");
  assert.match(html, /class="visually-hidden">have a project in mind\? always open to interesting projects, collaborations and conversations about ideas worth bringing to life — let(?:&#39;|')s talk<\/span>/, "the contact copy must expose a complete accessible sentence");
});

test("built home pairs small links with decorative minimalist icons", () => {
  const html = readFileSync(builtHome, "utf8");
  const links = [
    ["mailto:sprsplv@gmail.com", "email", "email"],
    ["https://t.me/saysskyy", "telegram", "telegram"],
    ["https://wladysplaw.github.io/", "explore", "external"]
  ];

  for (const [href, label, icon] of links) {
    const expression = new RegExp(
      `<span class="micro-link">\\s*<a[^>]*href="${href.replaceAll("/", "\\/")}"[^>]*>${label}<\\/a>\\s*<svg(?=[^>]*class="micro-link__icon")(?=[^>]*data-link-icon="${icon}")(?=[^>]*aria-hidden="true")(?=[^>]*focusable="false")[^>]*>`,
      "u"
    );

    assert.match(
      html,
      expression,
      `${label} must keep its visible text link and receive a decorative ${icon} icon`
    );
  }
});

test("built home sends each card to its dedicated case and local cover", () => {
  const html = readFileSync(builtHome, "utf8");
  const expectedCards = [
    ["/product/projects/content-platform-experiments/", "/product/assets/projects/content-platform-experiments/s_1.png"],
    ["/product/projects/football-federation/", "/product/assets/projects/football-federation/qf_1.png"],
    ["/product/projects/sheremetyevo-international-airport/", "/product/assets/projects/sheremetyevo-international-airport/sh_1.png"],
    ["/product/projects/research-platform/", "/product/assets/projects/research-platform/xx_1.png"],
    ["/product/projects/internet-computer/", "/product/assets/projects/internet-computer/ic_1.png"],
    ["/product/projects/breaking/", "/product/assets/projects/breaking/hg_1.png"]
  ];

  for (const [route, assetPath] of expectedCards) {
    assert.ok(html.includes(`href="${route}"`), `${route} must be rendered as a card destination`);
    assert.ok(html.includes(`src="${assetPath}"`), `${assetPath} must be rendered from the repository`);
  }
});

test("built home credits internet computer as lead design at clay", () => {
  const html = readFileSync(builtHome, "utf8");

  assert.match(
    html,
    /<span class="project-card__title">internet computer<\/span><span class="project-card__services">lead design at clay<\/span>/,
    "the internet computer card must name the owner role and Clay studio"
  );
  assert.doesNotMatch(
    html,
    /<span class="project-card__title">internet computer<\/span><span class="project-card__services">digital experience<\/span>/,
    "the outdated generic internet computer label must not remain"
  );
});

test("keeps the Figma service and contact vertical measures", () => {
  const css = readFileSync(globalStyles, "utf8");

  assert.match(css, /\.service-list\s*\{[^}]*\bgap:\s*16px;/, "the two service blocks must fit Figma's 142 px service region");
  assert.match(css, /\.home__contact-links\s*\{[^}]*\bmargin-top:\s*16px;/, "contact links must begin 16 px after the contact copy");
  assert.match(css, /\.service-list__creative\s*\{[^}]*\bgap:\s*16px;/, "the creative link must begin 16 px after the creative-coding copy");
  const mobileStyles = css.slice(css.indexOf("@media (max-width: 767px)"));
  assert.match(mobileStyles, /\.home__contact-links\s*\{[^}]*\bmargin-top:\s*0;/, "mobile direct links must begin without a removed-copy gap");
  assert.match(mobileStyles, /\.service-list__creative\s*\{[^}]*\bgap:\s*16px;/, "the creative link must keep the 16 px copy gap on mobile");
  assert.match(css, /\.site-identity\s*\{[^}]*\bfont-weight:\s*350;/, "hero copy must use the owner-approved 350 weight");
  assert.match(css, /\.site-identity__portrait\s*\{[^}]*\bwidth:\s*28px;[^}]*\bheight:\s*28px;/, "the full source portrait must have the owner-approved larger square frame");
  assert.match(css, /\.site-identity__portrait\s*\{[^}]*\bvertical-align:\s*-0\.25em;/, "the larger portrait must remain vertically centered against the name");
  assert.doesNotMatch(css, /\.site-identity__portrait\s*\{[^}]*\boverflow:\s*hidden;/, "the portrait must not crop the source image");
  assert.match(css, /\.site-identity__portrait-image\s*\{[^}]*\bobject-fit:\s*contain;/, "the portrait images must be displayed without cropping");
  assert.match(css, /\.site-identity__portrait\.is-portrait-hovered[^\{]*\.site-identity__portrait-image--two/, "hover must reveal the side-facing portrait");
  assert.match(css, /\.site-identity__portrait\.is-portrait-hovered\.is-portrait-rare-hover[^\{]*\.site-identity__portrait-image--three/, "each fifth hover must reveal the rear-facing portrait");
  assert.match(css, /\.project-card__title\s*\{[^}]*\bfont-weight:\s*450;/, "card titles must use the owner-approved 450 weight");
  assert.match(css, /\.project-card__media\s*\{[^}]*\balign-items:\s*center;[^}]*\bjustify-content:\s*center;/, "card media must be centered inside its 588 by 518 Figma surface");
  assert.match(css, /\.project-card__media img\s*\{[^}]*\bwidth:\s*auto;[^}]*\bmax-width:\s*min\(520px,\s*100%\);/, "card media must preserve Figma's 520 px desktop image width without enlarging its layout box to the grey field");
  assert.match(css, /\.footer-marks__copyright\s*\{[^}]*\bfont-family:\s*var\(--font-serif\);/, "copyright must use the inspected serif style");
  assert.match(css, /\.footer-marks__copyright\s*\{[^}]*\bfont-size:\s*1rem;/, "copyright must use its inspected 16 px size");
  assert.match(css, /\.footer-marks__year\s*\{[^}]*\bfont-weight:\s*350;/, "year mark must use its inspected 350 weight");
  assert.match(css, /\.footer-marks__year\s*\{[^}]*\bfont-size:\s*0\.5625rem;/, "year mark must use its inspected 9 px size");
});

test("mobile contact hides the invitation copy without adding a Let’s Talk link", () => {
  const html = readFileSync(builtHome, "utf8");
  const source = readFileSync(homePage, "utf8");
  const css = readFileSync(globalStyles, "utf8");
  const mobileStyles = css.slice(css.indexOf("@media (max-width: 767px)"));

  assert.match(source, /<p class="home__contact-intro">/, "the desktop invitation needs an independently hideable wrapper");
  assert.doesNotMatch(source, /home__contact-talk/, "the contact area must not add an extra Let’s Talk link");
  assert.doesNotMatch(html, /home__contact-talk/, "the built mobile contact must contain only the requested links");
  assert.match(mobileStyles, /\.home__contact-intro\s*\{[^}]*\bdisplay:\s*none;/, "the invitation copy must not occupy the mobile header");
  assert.doesNotMatch(mobileStyles, /\.home__contact-talk/, "mobile styles must not reserve space for an extra Let’s Talk link");
  assert.match(mobileStyles, /\.home__contact-links\s*\{[^}]*\bmargin-top:\s*0;/, "email and Telegram must remain one compact mobile stack");
});

test("keeps the contact column fixed while leaving twenty pixels empty on its right", () => {
  const tokens = readFileSync(tokenStyles, "utf8");
  const css = readFileSync(globalStyles, "utf8");
  const measure = tokens.match(/--contact-measure:\s*([\d.]+)rem;/);
  const columnMeasure = tokens.match(/--contact-column-measure:\s*([\d.]+)rem;/);

  assert.ok(measure, "contact copy must retain a responsive rem measure");
  assert.ok(columnMeasure, "the header grid needs a separate contact column measure");
  assert.equal(Number(measure[1]) * 16, 237, "contact copy must resolve to 237 px at the standard root size");
  assert.equal(Number(columnMeasure[1]) * 16, 257, "the contact column must retain its original 257 px position");
  assert.match(css, /\.home__right-column\s*\{[\s\S]*?grid-template-columns:\s*var\(--service-measure\)\s+minmax\(0,\s*1fr\)\s+var\(--contact-column-measure\);/, "the grid must anchor contact from its original left edge");
  assert.match(css, /\.home__contact\s*\{[\s\S]*?max-width:\s*var\(--contact-measure\);/, "the copy itself must end twenty pixels before the contact-column edge");
});

test("keeps the tablet service and contact stack packed at the top of the header", () => {
  const css = readFileSync(globalStyles, "utf8");

  assert.match(css, /\.home__right-column\s*\{[^}]*\balign-content:\s*start;/, "the tablet one-column grid must not stretch its implicit service and contact rows across the viewport-height header");
});

test("aligns the first desktop lines of the identity, services and contact copy", () => {
  const css = readFileSync(globalStyles, "utf8");
  const desktopStyles = css.slice(0, css.indexOf("@media (min-width: 768px) and (max-width: 1217px)"));

  assert.match(desktopStyles, /\.home__header\s*\{[^}]*\balign-items:\s*baseline;/, "the left identity and right header field must expose one shared first baseline");
  assert.match(desktopStyles, /\.home__right-column\s*\{[^}]*\balign-items:\s*baseline;/, "the services and contact copy must align their first text lines inside the right field");
});

test("lets the tablet intro summary reflow through helping", () => {
  const css = readFileSync(globalStyles, "utf8");
  const identity = readFileSync(siteIdentity, "utf8");
  const tabletStyles = css.slice(css.indexOf("@media (min-width: 768px) and (max-width: 1217px)"), css.indexOf("@media (max-width: 767px)"));

  assert.match(identity, /<br class="site-identity__summary-desktop-break" \/><span class="site-identity__summary-helping">helping/, "the desktop-only summary break must be independently addressable");
  assert.match(tabletStyles, /\.site-identity__summary-desktop-break\s*\{[^}]*\bdisplay:\s*none;/, "tablet summary copy must let helping join the preceding natural line");
  assert.match(tabletStyles, /\.site-identity__summary-helping::before\s*\{[^}]*\bcontent:\s*" ";/, "tablet summary copy must retain the word space after the hidden break");
});

test("aligns the tablet right header column with the right project card", () => {
  const css = readFileSync(globalStyles, "utf8");
  const tabletStyles = css.slice(css.indexOf("@media (min-width: 768px) and (max-width: 1217px)"), css.indexOf("@media (max-width: 767px)"));

  assert.match(tabletStyles, /\.home__header\s*\{[^}]*\bgrid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);[^}]*\bcolumn-gap:\s*var\(--grid-gap\);/, "the tablet right text column must share the right card's left edge");
  assert.match(tabletStyles, /\.home__intro\s*\{[^}]*\bmax-width:\s*calc\(100% - 24px\);/, "the larger visual text gap must come from the left intro measure instead of moving the right column");
  assert.match(tabletStyles, /\.home__right-column\s*\{[^}]*\bgap:\s*16px;/, "tablet contact must begin on the same rhythm as the upper service blocks");
});

test("keeps breathing room between mobile contact links and the first card", () => {
  const css = readFileSync(globalStyles, "utf8");
  const mobileStyles = css.slice(css.indexOf("@media (max-width: 767px)"));

  assert.match(mobileStyles, /\.project-grid\s*\{[^}]*\bmargin-top:\s*32px;/, "mobile contact links need a deliberate 32 px clearance before the first project card");
});

test("keeps card title and subtitle rhythm independent of title wrapping", () => {
  const css = readFileSync(globalStyles, "utf8");

  assert.match(css, /\.project-card__copy\s*\{[^}]*\bdisplay:\s*flex;[^}]*\bflex-direction:\s*column;[^}]*\bjustify-content:\s*flex-start;[^}]*\bgap:\s*0;/, "the card copy stack must not stretch its title/subtitle rows");
  assert.match(css, /\.project-card__services\s*\{[^}]*\bfont-weight:\s*350;/, "card subtitles must use the owner-corrected 350 weight");
});

test("gives narrow cards room for wrapped copy while preserving each cover image ratio", () => {
  const css = readFileSync(globalStyles, "utf8");
  const compactCardStyles = css.slice(css.indexOf("@media (max-width: 1217px)"));

  assert.match(compactCardStyles, /\.project-card__copy\s*\{[^}]*\bflex:\s*0\s+0\s+auto;[^}]*\bmin-height:\s*72px;/, "tablet and mobile copy must grow past two lines instead of entering the image field");
  assert.match(css, /\.project-card__media img\s*\{[^}]*\bwidth:\s*auto;[^}]*\bmax-width:\s*min\(520px,\s*100%\);[^}]*\bheight:\s*auto;[^}]*\bmax-height:\s*100%;[^}]*\bobject-fit:\s*contain;/, "a constrained media field must retain the source layout ratio so the hover canvas cannot stretch it vertically");
});

test("allows the home grid to grow within fixed page gutters", () => {
  const css = readFileSync(globalStyles, "utf8");

  assert.match(css, /\.home\.site-shell\s*\{[^}]*\bwidth:\s*calc\(100% - \(var\(--page-margin\) \* 2\)\);[^}]*\bmax-width:\s*none;/, "only the home shell must expand to the viewport minus its fixed page gutters");
});

test("anchors the first home surfaces to the inspected viewport proportion", () => {
  const css = readFileSync(globalStyles, "utf8");

  assert.match(css, /--first-surface-top:\s*calc\(100svh - 32\.222222svh\);/, "the first surface must begin at the 610 of 900 viewport proportion");
  assert.match(css, /\.home\s*\{[^}]*\bgrid-template-rows:\s*minmax\(max-content,\s*var\(--first-surface-top\)\)\s*auto;/, "the home header row must absorb the viewport-proportional pre-card space");
  assert.match(css, /\.project-grid\s*\{[^}]*\bmargin-top:\s*0;/, "home cards must no longer rely on a fixed desktop offset");
});

test("scales card height and its content frame with the expanding grid columns", () => {
  const css = readFileSync(globalStyles, "utf8");

  assert.match(css, /\.project-grid\s*\{[^}]*\bgrid-auto-rows:\s*auto;/, "implicit grid rows must resolve from the card aspect ratio instead of a fixed height");
  assert.match(css, /\.project-card\s*\{[^}]*\baspect-ratio:\s*684\s*\/\s*638;/, "a 684 px card must retain the inspected 638 px reference height while wider cards grow vertically");
  assert.match(css, /\.project-card\s*\{[^}]*--project-card-padding:\s*clamp\(24px,\s*calc\(3\.5088vw - 2\.5263px\),\s*80px\);/, "card insets must scale with the columns while retaining a safe minimum and maximum");
  assert.match(css, /\.project-card\s*\{[^}]*\bpadding:\s*var\(--project-card-padding\);/, "top, side, and bottom card insets must use the same responsive value");
  assert.doesNotMatch(css, /\.project-card\s*\{[^}]*\bmin-height:\s*638px;/, "card height must not remain fixed at the desktop reference value");
  assert.doesNotMatch(css, /\.project-card\s*\{[^}]*\baspect-ratio:\s*1\s*\/\s*1;/, "mobile cards must retain the same content-frame proportion instead of reverting to a square");
});
