# Product site design

## Intent

Build an independent English portfolio site at `/product/` on the existing `wladysplaw.github.io` domain. It presents product-design and digital-experience work as a self-contained site: it must not link to, import components from, or visually depend on the existing portfolio.

The first delivery is a real, deployable skeleton. It establishes the complete page system and responsive visual rules so later project images and approved descriptions can be added one at a time without restructuring the site.

## Scope of the first delivery

- A standalone Astro static site in this repository, built with `base: "/product/"` and deployed by GitHub Actions to GitHub Pages.
- An English home route and an English project-detail route/template, plus ordinary 404 handling where Astro provides it.
- A minimal data boundary for projects: each future project can supply a slug, title, service line, intro, media, and ordered case-study blocks without changing page templates.
- An initially empty project catalogue rather than invented project descriptions, imagery, contacts, or claims. The first published project card and detail route are created from the first real project supplied by the owner.
- Semantic navigation, keyboard-visible controls, responsive layout, and native smooth anchor scrolling that respects `prefers-reduced-motion`.
- A `Let’s Talk` CTA that links to `https://t.me/saysskyy`; no email address or substitute contact will be invented.
- Basic metadata, favicon placeholder, and an explicit deploy workflow so the result is a usable site foundation rather than a local mockup.

## Visual and layout contract

The Figma reference is the source for the visual language and page types, not a source of current project content.

- The desktop composition uses a 1440 px canvas with 32 px outer margins, giving a 1376 px content width; responsive breakpoints may change the number of columns but must preserve relationships rather than apply desktop coordinates literally.
- The home is a shared grid, not separate flex rows. The left edge of the `Product design / Digital experiences` services block must be exactly the same grid boundary as the left edge of the second grey project card. This is an X-axis alignment requirement.
- Home project surfaces share row geometry: at the reference desktop width, first-row cards are 684 x 638 px separated by an 8 px gutter. Card heights must come from the grid row, not from the amount of card text.
- Text columns are explicit editorial measures and must not grow to fill spare horizontal space. The reference measures are approximately 542–594 px for introduction text, 316 px for services, and 257 px for contact copy.
- A project card places its title and service line at the top of the grey surface and media in its lower region. Later supplied imagery replaces only its data/media slot; it does not change the grid rule.
- A case-study page has `back` and `next` controls, a fixed editorial copy measure, wide grey media frames, and a footer. Its first public instance is the first real project, not a neutral preview page.

## Deferred decisions, not exclusions

- Real project content and imagery will be provided by the owner and added iteratively.
- The owner is preparing the first two real project screenshots. Before its card and route are published, the owner supplies their final files plus an approved title, service line, and short project description.
- Card hover behavior, press behavior, shader/WebGL experiments, and any non-native smooth-scroll treatment remain a later visual-interaction pass. The skeleton must keep a clear component boundary for them but must not fake an unapproved effect.
- No Russian locale, external CMS, analytics, or transition to the existing portfolio is included in this delivery.

## Approaches considered

1. **Independent Astro project — chosen.** It keeps deployment, visual tokens, routes, and future project data separate while providing static project routes and a repeatable GitHub Pages build.
2. **Plain static HTML/CSS/JavaScript.** It would start slightly smaller but would duplicate project-page structure as content arrives.
3. **A new variant in the existing portfolio repository.** It would couple the two sites and contradict the required independent product.

## Acceptance for the skeleton

1. `npm run build` creates a static site that works under `/product/`, including asset and route URLs.
2. GitHub Actions can build and publish the site without committing generated output to the source branch.
3. At the desktop reference width, the services block and second card share the required grid boundary, text measures remain capped, and paired grey surfaces retain equal row height.
4. The home renders an intentional empty catalogue until the first real project arrives; the first project-detail page is generated only from owner-supplied material, with no neutral preview route.
5. Keyboard navigation and reduced-motion behavior work in the rendered site.

## Implementation calls left to the builder

- Use project-local CSS custom properties and components; do not copy source files from the existing portfolio.
- Use Astro's local content/data conventions rather than add a CMS or client framework before content requires one.
- Use a custom GitHub Actions Pages workflow rather than branch-based publishing.
