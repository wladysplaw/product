import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const builtCase = path.resolve(testDirectory, "../dist/projects/content-platform-experiments/index.html");
const builtFootballCase = path.resolve(testDirectory, "../dist/projects/football-federation/index.html");
const builtSheremetyevoCase = path.resolve(testDirectory, "../dist/projects/sheremetyevo-international-airport/index.html");
const builtResearchPlatformCase = path.resolve(testDirectory, "../dist/projects/research-platform/index.html");
const builtInternetComputerCase = path.resolve(testDirectory, "../dist/projects/internet-computer/index.html");
const builtBreakingCase = path.resolve(testDirectory, "../dist/projects/breaking/index.html");
const globalStyles = path.resolve(testDirectory, "../src/styles/global.css");

test("built content-platform case puts authored copy before every supplied image", () => {
  const html = readFileSync(builtCase, "utf8");

  assert.match(html, /data-testid="figma-case"/, "case must expose its Figma composition hook");
  assert.match(html, />back<\/a>/, "top navigation must retain Figma's lowercase back label");
  assert.match(html, />next<\/a>/, "top navigation must retain Figma's lowercase next label");
  assert.equal((html.match(/data-testid="case-story"/g) ?? []).length, 7, "Pock must expose all seven supplied story blocks");
  assert.equal((html.match(/data-testid="case-media"/g) ?? []).length, 7, "each authored copy block must precede one media surface");
  assert.equal((html.match(/>text placeholder</g) ?? []).length, 0, "the content platform must no longer expose generic copy placeholders");
  assert.match(html, /alternative content platform built around creative authors/, "the third screen must describe the creative-author platform");
  assert.match(html, /private network for founders and business people/, "the fourth screen must describe the founder information network");
  assert.match(html, /tiered membership model for audiences/, "the fifth screen must describe audience subscriptions");
  assert.match(html, /creator-facing tool for shaping access and pricing/, "the sixth screen must describe creator monetization controls");
  assert.match(html, /wallet and settlement layer for the platform economy/, "the final screen must describe payment settlement");
  assert.match(html, /class="footer-marks"/, "internal pages must share the supplied Figma footer marks");
  for (const index of [1, 2, 3, 4, 5, 6, 7]) {
    assert.match(html, new RegExp(`/product/assets/projects/content-platform-experiments/s_${index}\\.png`), `Pock image ${index} must be local`);
  }
  assert.doesNotMatch(html, />let(?:&#39;|')s talk</, "the home CTA must not replace case continuation navigation");
});

test("built content-platform case gives only the grey-backed s_4 screen a subtle outline", () => {
  const html = readFileSync(builtCase, "utf8");
  const css = readFileSync(globalStyles, "utf8");

  assert.match(
    html,
    /<div class="[^"]*case-page__media--outlined[^"]*"[^>]*data-testid="case-media"[^>]*>\s*<img src="\/product\/assets\/projects\/content-platform-experiments\/s_4\.png"/,
    "the grey-backed Pock s_4 screen must receive its dedicated outline treatment"
  );
  assert.doesNotMatch(
    html,
    /<div class="[^"]*case-page__media--outlined[^"]*"[^>]*data-testid="case-media"[^>]*>\s*<img src="\/product\/assets\/projects\/content-platform-experiments\/s_3\.png"/,
    "the outline treatment must not spread to neighbouring Pock screens"
  );
  assert.match(
    css,
    /\.case-page__media--outlined img\s*\{[^}]*\bborder:\s*1px solid var\(--color-border-subtle\);/,
    "outlined case media must use a restrained one-pixel border"
  );
});

test("built football-federation case puts specific federation workflows before every supplied image", () => {
  const html = readFileSync(builtFootballCase, "utf8");

  assert.equal((html.match(/data-testid="case-story"/g) ?? []).length, 4, "the football-federation case must expose all four story blocks");
  assert.equal((html.match(/>text placeholder</g) ?? []).length, 0, "the football-federation case must not expose generic copy placeholders");
  assert.match(html, /federation management portal/, "the case must explain the federation-level operating model");
  assert.match(html, /structured view of every club/, "the first screen must describe the club data view");
  assert.match(html, /tournament application view/, "the second screen must describe the tournament application data view");
  assert.match(html, /club creation flow/, "the third screen must describe club creation");
  assert.match(html, /team creation flow/, "the final screen must describe the deeper team creation flow");
});

test("built sheremetyevo case puts the airport ecosystem and map stories before every supplied image", () => {
  const html = readFileSync(builtSheremetyevoCase, "utf8");

  assert.equal((html.match(/data-testid="case-story"/g) ?? []).length, 8, "the sheremetyevo case must expose all eight story blocks");
  assert.equal((html.match(/>text placeholder</g) ?? []).length, 0, "the sheremetyevo case must not expose generic copy placeholders");
  assert.match(html, /connected airport product ecosystem/, "the case must explain the wider product ecosystem");
  assert.match(html, /three languages and a high-contrast version/, "the first screen must explain multilingual accessibility");
  assert.match(html, /changing background video/, "the homepage must explain its responsive video treatment");
  assert.match(html, /flight board tabs behave like large headlines/, "the flight-board screen must explain its tab navigation");
  assert.match(html, /detailed flight pages/, "the fourth screen must describe the shared flight-detail system");
  assert.match(html, /expanded split menu that stays open/, "the registration page must describe the content navigation");
  assert.match(html, /flexible service directory/, "the service screen must describe airport services");
  assert.match(html, /interactive airport map/, "the first map screen must describe the site map");
  assert.match(
    html,
    /detailed terminal map extends the same navigation into on-site kiosks/,
    "the final screen must describe terminal navigation"
  );
});

test("built research-platform case orders research synthesis before final product design", () => {
  const html = readFileSync(builtResearchPlatformCase, "utf8");

  assert.equal((html.match(/data-testid="case-story"/g) ?? []).length, 11, "the research platform case must expose all eleven story blocks");
  assert.equal((html.match(/>text placeholder</g) ?? []).length, 0, "the research platform case must not expose generic copy placeholders");
  assert.match(html, /nearly two hundred scientific studies/, "the overview must explain the research corpus");
  assert.match(html, /around fifteen focused workstreams/, "the material index must explain the thematic workstreams");
  assert.match(html, /app store and google play data/, "the market screen must explain its source data");
  assert.match(html, /feature heatmap/, "the heatmap must explain the feature comparison");
  assert.match(html, /clustered into product types/, "the cluster view must explain recurring product patterns");
  assert.match(html, /core entities before individual screens/, "the information architecture must precede the final screens");
  assert.match(html, /single goal journey/, "the journey must connect evidence to product decisions");
  assert.match(html, /supported thesis/, "the evidence screen must explain how research is assessed");
  assert.match(html, /solutions atlas/, "the atlas must explain the catalogued market patterns");

  const structuralModel = html.indexOf("/product/assets/projects/research-platform/xx_6.png");
  const goalJourney = html.indexOf("/product/assets/projects/research-platform/xx_Screenshot 2026-10-08 at 8.12.39 PM 1.png");
  const researchTheses = html.indexOf("/product/assets/projects/research-platform/xx_Screenshot 2026-10-08 at 8.13.43 PM 1.png");
  const solutionsAtlas = html.indexOf("/product/assets/projects/research-platform/xx_Screenshot 2026-10-08 at 8.15.19 PM 1.png");
  const coreScreens = html.indexOf("/product/assets/projects/research-platform/xx_7.png");
  const goalCreation = html.indexOf("/product/assets/projects/research-platform/xx_8.png");

  assert.ok(
    goalJourney < researchTheses && researchTheses < solutionsAtlas && solutionsAtlas < structuralModel && structuralModel < coreScreens && coreScreens < goalCreation,
    "the structural model must follow the synthesis and lead directly into the two final white design screens"
  );
});

test("built internet-computer case explains the network through five distinct visual panels", () => {
  const html = readFileSync(builtInternetComputerCase, "utf8");

  assert.equal((html.match(/data-testid="case-story"/g) ?? []).length, 5, "the internet computer case must expose all five supplied story blocks");
  assert.equal((html.match(/>text placeholder</g) ?? []).length, 0, "the internet computer case must not expose generic copy placeholders");
  assert.match(html, /decentralized network for running applications, websites and services as canisters/, "the case must identify what internet computer is");
  assert.match(html, /3d scene created by a collaborating artist/, "the opening must credit the supplied 3d scene correctly");
  assert.match(html, /detailed animated field of blocks/, "the second panel must explain its animated network model");
  assert.match(html, /horizontally scrolling panels/, "the third panel must explain the long-page interaction model");
  assert.match(html, /self-contained units that hold application logic and data/, "the fourth panel must explain canisters");
  assert.match(html, /icp-to-cycles flow and voting neurons/, "the final panel must distinguish network economics and governance");
});

test("built breaking case puts brand communication ahead of the staking offer", () => {
  const html = readFileSync(builtBreakingCase, "utf8");

  assert.equal((html.match(/data-testid="case-story"/g) ?? []).length, 3, "the breaking case must expose all three supplied story blocks");
  assert.equal((html.match(/>text placeholder</g) ?? []).length, 0, "the breaking case must not expose generic copy placeholders");
  assert.match(html, /brand communication for a multi-asset staking service/, "the case must lead with its branding purpose");
  assert.match(html, /animated smoke, dark 3d flowers and typographic layers/, "the opening must describe the animated visual identity");
  assert.match(html, /assets, insurance, node operations, rpc access and api integrations/, "the service view must distinguish the offer from the brand introduction");
  assert.match(html, /final conversion screen carries the same world into a direct invitation/, "the final screen must explain the branded conversion path");
});

test("keeps the supplied case media geometry in source", () => {
  const css = readFileSync(globalStyles, "utf8");
  const navigation = css.match(/\.case-page__navigation\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
  const mobileStyles = css.slice(css.indexOf("@media (max-width: 767px)"));

  assert.match(css, /\.case-page__story\s*\{[^}]*\bgap:\s*20px;/, "story copy and media must be separated by 20 px");
  assert.match(css, /\.case-page__media\s*\{[^}]*\baspect-ratio:\s*1180\s*\/\s*690;/, "case media must preserve the inspected 1180 by 690 desktop proportion");
  assert.match(css, /\.case-page__media\s*\{[^}]*\bmin-height:\s*360px;/, "case media must retain a useful desktop and tablet surface");
  assert.match(css, /\.case-page__media\s*\{[^}]*\bheight:\s*auto;/, "case media height must scale continuously with its body width");
  assert.match(css, /\.case-page__media\s*\{[^}]*\bmin-width:\s*0;[^}]*\bmax-width:\s*100%;/, "the mobile height floor must never transfer the desktop aspect ratio into horizontal overflow");
  assert.match(css, /\.case-page__media\s*\{[^}]*\bpadding-inline:\s*clamp\(16px,\s*16\.1017%,\s*190px\);/, "media inset must preserve the centered screen proportion at every usable width");
  assert.match(css, /\.case-page__media\s*\{[^}]*\balign-items:\s*flex-end;/, "media screen must sit on the surface bottom edge");
  assert.match(css, /\.case-page__media\s*\{[^}]*\bjustify-content:\s*center;/, "media screen must remain horizontally centred");
  assert.match(css, /\.case-page__media\s*\{[^}]*\bpadding-inline:\s*clamp\(16px,\s*16\.1017%,\s*190px\);/, "tablet media needs the same proportional side field as the 1180 px reference");
  assert.match(mobileStyles, /\.case-page__media\s*\{[^}]*\bmin-height:\s*0;/, "mobile media must return to the 1180 by 690 proportion instead of keeping the desktop height floor");
  assert.match(css, /\.case-page__media img\s*\{[^}]*\bwidth:\s*auto;[^}]*\bmax-width:\s*min\(800px,\s*100%\);[^}]*\bheight:\s*auto;[^}]*\bmax-height:\s*100%;[^}]*\bobject-fit:\s*contain;[^}]*\bobject-position:\s*center bottom;/, "case images must retain their source layout ratio so an outlined image stays aligned to its actual raster");
  assert.match(css, /\.case-page__body\s*\{[^}]*\bmargin-inline:\s*auto;/, "owner-approved internal pages must centre their 1180 px content surface");
  assert.match(css, /\.case-page__opening\s*\{[^}]*\bdisplay:\s*grid;[^}]*\bgrid-template-columns:\s*minmax\(0, 1fr\);[^}]*\bgrid-template-rows:\s*minmax\(0, 1fr\) auto;[^}]*\bmin-height:\s*calc\(var\(--first-surface-top\) - var\(--case-body-origin\)\);/, "the opening must preserve the first surface and keep its centred intro inside narrow page gutters");
  assert.match(css, /\.case-page__intro\s*\{[^}]*\balign-self:\s*center;/, "the complete title and project-description block must sit in the vertical centre of that opening space");
  assert.match(
    css,
    /\.case-page__intro\s*\{[^}]*\bposition:\s*relative;[^}]*\btop:\s*calc\(\(56px - var\(--case-body-origin\)\) \/ 2\);/,
    "the intro must compensate for the gap between the fixed navigation and the opening grid so its visual fields above and below are equal"
  );
  assert.match(css, /\.case-page__story--first\s*\{[^}]*\bmargin-top:\s*0;[^}]*\bpadding-bottom:\s*20px;/, "the first story must remain anchored to the bottom of the opening rather than pushing the centred intro upward");
  assert.match(css, /\.case-page\s*\{[^}]*\bpadding-bottom:\s*0;/, "the final case media must meet its CTA region without a separate gap");
  assert.match(css, /\.scroll-callout-stage\s*\{[\s\S]*?\bheight:\s*var\(--scroll-callout-stage-height\);[\s\S]*?\bplace-items:\s*center;[\s\S]*?\bpadding-block:\s*0;/, "case footer CTA must remain centred in the exact white field below its final card");
  assert.match(css, /\.scroll-callout-region\s*\{[^}]*\bmin-height:\s*80svh;/, "case CTA must end when its final card occupies the top fifth rather than leave an extra scroll range");
  assert.match(css, /\.scroll-callout-region > \.site-footer,[\s\S]*?\.scroll-callout-region > \.case-footer\s*\{[^}]*\bposition:\s*sticky;[^}]*\btop:\s*20svh;[^}]*\bheight:\s*80svh;[^}]*\bmin-height:\s*80svh;/, "the case footer must stay attached to the lower viewport edge while only its inner CTA field expands");
  assert.match(css, /\.case-page__navigation\s*\{[^}]*\bfont-size:\s*1\.375rem;[^}]*\bfont-weight:\s*350;[^}]*\bline-height:\s*2rem;/, "case back and next labels must use the owner-approved 22/32/350 type style");
  assert.match(css, /\.case-page\s*\{[^}]*\bpadding-top:\s*56px;/, "the fixed case navigation must reserve its original 56 px layout space");
  assert.match(css, /\.case-page__navigation\s*\{[^}]*\bposition:\s*fixed;[^}]*\binset:\s*0 0 auto;[^}]*\bz-index:\s*10;[^}]*\bheight:\s*56px;[^}]*\bpadding:\s*24px 24px 0;/, "case back and next navigation must stay fixed at the established 24 px top offset while scrolling");
  assert.doesNotMatch(navigation, /\bbackground\s*:/, "the fixed back and next labels must remain directly over the case content without a white navigation strip");
  assert.match(css, /\.case-page__navigation a,\s*\.case-page__navigation a:hover,\s*\.case-page__navigation a:focus,\s*\.case-page__navigation a:focus-visible,\s*\.case-page__navigation a:active\s*\{[^}]*\btext-decoration:\s*none;/, "back and next must never acquire a browser underline while pressed or focused");
  assert.match(css, /\.case-footer__next\s*\{[^}]*\bfont-size:\s*1\.375rem;[^}]*\bfont-weight:\s*350;[^}]*\bletter-spacing:\s*0;[^}]*\bline-height:\s*2rem;/, "footer next must match the case navigation type style");
});

test("keeps the compact title-service pair and 32 px introductory rhythm", () => {
  const css = readFileSync(globalStyles, "utf8");

  assert.match(
    css,
    /\.case-page__intro\s*\{[^}]*\bdisplay:\s*flex;[^}]*\bflex-direction:\s*column;[^}]*\bgap:\s*0;/,
    "the title, service line, and summary need independently controlled vertical distances"
  );
  assert.match(css, /\.case-page__intro \.case-page__services\s*\{[^}]*\bmargin-top:\s*4px;/, "the service line must sit 4 px below the title");
  assert.match(css, /\.case-page__intro \.case-page__summary\s*\{[^}]*\bmargin-top:\s*32px;/, "the first introductory copy must begin 32 px after the service line");
});

test("uses full-bleed mobile rasters without grey media surfaces", () => {
  const css = readFileSync(globalStyles, "utf8");
  const mobileStyles = css.slice(css.indexOf("@media (max-width: 767px)"));

  assert.match(
    mobileStyles,
    /\.case-page__media\s*\{[^}]*\bwidth:\s*calc\(100%\s*\+\s*48px\);[^}]*\bmax-width:\s*none;[^}]*\bmargin-inline:\s*-24px;[^}]*\baspect-ratio:\s*auto;[^}]*\bmin-height:\s*0;[^}]*\bpadding-inline:\s*0;[^}]*\bbackground:\s*transparent;/,
    "mobile case media must leave the text gutters, remove its grey surface and extend its raster to the viewport edges"
  );
  assert.match(
    mobileStyles,
    /\.case-page__media img\s*\{[^}]*\bwidth:\s*100%;[^}]*\bmax-width:\s*none;[^}]*\bheight:\s*auto;[^}]*\bmax-height:\s*none;/,
    "mobile case rasters must fill the full-bleed media frame without an internal inset"
  );
});

test("keeps narrow case stories inside the page gutters", () => {
  const css = readFileSync(globalStyles, "utf8");

  assert.match(css, /\.case-page__blocks\s*\{[^}]*\bmin-width:\s*0;/, "the continuation grid must be allowed to shrink below its copy measure");
  assert.match(css, /\.case-page__opening\s*\{[^}]*\bgrid-template-columns:\s*minmax\(0, 1fr\);/, "the opening grid must not widen to the intro's desktop measure on a narrow screen");
  assert.match(css, /\.case-page__story\s*\{[^}]*\bgrid-template-columns:\s*minmax\(0,\s*1fr\);[^}]*\bmin-width:\s*0;/, "story tracks must not use a 460 px intrinsic minimum on narrow screens");
  assert.match(css, /\.case-page__summary,\s*\.case-page__copy\s*\{[^}]*\bwidth:\s*min\(460px,\s*100%\);/, "copy must cap to its measure without widening a narrow story track");
});
