export type LocalAssetPath = `/${string}`;

export type ProjectCover = {
  src: LocalAssetPath;
  alt: string;
  frame?: "subtle";
};

export type ProjectStoryBlock = {
  body: string;
  media: ProjectCover;
  mediaStatus: "pending" | "ready";
};

export type ProjectBlock = ProjectStoryBlock;

export type Project = {
  slug: string;
  title: string;
  services: string;
  summary: string;
  cover: ProjectCover;
  blocks: ProjectBlock[];
};

export type HomeProjectCard = {
  id: string;
  projectSlug: string;
  cover: ProjectCover;
  mediaStatus: "pending" | "ready";
};

const textPlaceholder = "text placeholder";

function placeholderBlocks(media: readonly ProjectCover[]): ProjectBlock[] {
  return media.map((item) => ({
    body: textPlaceholder,
    media: item,
    mediaStatus: "ready" as const
  }));
}

const projectDefinitions: Project[] = [
  {
    slug: "content-platform-experiments",
    title: "content platform experiments",
    services: "product strategy & ux/ui",
    summary:
      "a series of product experiments around social content and creator monetisation — i developed hypotheses, user flows and interface concepts around discovery, paid posts, subscriptions, paywalls and settlement",
    cover: {
      src: "/assets/projects/content-platform-experiments/s_1.png",
      alt: "Pock content platform interface"
    },
    blocks: [
      {
        body:
          "a unified space for discovering and exploring content across formats and topics — posts, images, videos, longreads and links come together in a single feed with flexible filters and personalized recommendations",
        media: { src: "/assets/projects/content-platform-experiments/s_1.png", alt: "Pock content platform screen 1" },
        mediaStatus: "ready"
      },
      {
        body:
          "exploring nft sales as a content monetization model — digital collectibles create new revenue streams for creators and new ways for audiences to engage with content",
        media: { src: "/assets/projects/content-platform-experiments/s_2.png", alt: "Pock content platform screen 2" },
        mediaStatus: "ready"
      },
      {
        body:
          "an alternative content platform built around creative authors — visual formats, curated discoveries and shared collections help their work find an audience",
        media: { src: "/assets/projects/content-platform-experiments/s_3.png", alt: "Pock content platform screen 3" },
        mediaStatus: "ready"
      },
      {
        body:
          "a private network for founders and business people to exchange insight, context and ideas — turning scattered experience into a shared information space",
        media: {
          src: "/assets/projects/content-platform-experiments/s_4.png",
          alt: "Pock content platform screen 4",
          frame: "subtle"
        },
        mediaStatus: "ready"
      },
      {
        body:
          "a tiered membership model for audiences — free, member and super plans turn access into a recurring relationship while giving people a clear reason to move deeper into the platform",
        media: { src: "/assets/projects/content-platform-experiments/s_5.png", alt: "Pock content platform screen 5" },
        mediaStatus: "ready"
      },
      {
        body:
          "a creator-facing tool for shaping access and pricing — authors can define membership tiers, set prices and decide what stays behind each paywall",
        media: { src: "/assets/projects/content-platform-experiments/s_6.png", alt: "Pock content platform screen 6" },
        mediaStatus: "ready"
      },
      {
        body:
          "a wallet and settlement layer for the platform economy — balances, held funds and withdrawals connect creator income with card and crypto payments",
        media: { src: "/assets/projects/content-platform-experiments/s_7.png", alt: "Pock content platform screen 7" },
        mediaStatus: "ready"
      }
    ]
  },
  {
    slug: "football-federation",
    title: "football federation platform",
    services: "product direction & ux/ui",
    summary:
      "a management platform for a football federation, bringing clubs, tournaments, matches, players, coaches and staff into one working environment — i led product and design direction, shaped key decisions and guided the team through the ux/ui design of core management workflows",
    cover: {
      src: "/assets/projects/football-federation/qf_1.png",
      alt: "Digital platform for the football federation interface"
    },
    blocks: [
      {
        body:
          "a structured view of every club in a federation — searchable tables bring together club details, teams, locations, administrators and the people responsible for daily operations",
        media: { src: "/assets/projects/football-federation/qf_1.png", alt: "Football federation screen 1" },
        mediaStatus: "ready"
      },
      {
        body:
          "a tournament application view built around a specific competition — teams, coaches, approval states and tournament requirements stay visible alongside the wider match and player data",
        media: { src: "/assets/projects/football-federation/qf_2.png", alt: "Football federation screen 2" },
        mediaStatus: "ready"
      },
      {
        body:
          "a club creation flow for setting up the organization behind a team — names, descriptions, branding, administrators, locations and related references are collected through connected inputs and selects",
        media: { src: "/assets/projects/football-federation/qf_3.png", alt: "Football federation screen 3" },
        mediaStatus: "ready"
      },
      {
        body:
          "a team creation flow with a deeper set of operational details — club links, staff, stadiums, status, kits, player forms and external channels are configured through layered inputs and selects",
        media: { src: "/assets/projects/football-federation/qf_4.png", alt: "Football federation screen 4" },
        mediaStatus: "ready"
      }
    ]
  },
  {
    slug: "sheremetyevo-international-airport",
    title: "sheremetyevo international airport",
    services: "service design & ux/ui",
    summary:
      "a multi-device passenger-service ecosystem spanning the website, mobile app, wearable app and airport terminals — i designed the service experience and visual system across these touchpoints",
    cover: {
      src: "/assets/projects/sheremetyevo-international-airport/sh_1.png",
      alt: "sheremetyevo international airport screen"
    },
    blocks: [
      {
        body:
          "a large-scale airport website available in three languages and a high-contrast version — the same information and journeys remain clear for passengers with different needs",
        media: { src: "/assets/projects/sheremetyevo-international-airport/sh_1.png", alt: "sheremetyevo screen 1" },
        mediaStatus: "ready"
      },
      {
        body:
          "a contemporary homepage built around changing background video — hover states switch between takeoff and landing while oversized typography turns the airport into a live visual scene",
        media: { src: "/assets/projects/sheremetyevo-international-airport/sh_2.png", alt: "sheremetyevo screen 2" },
        mediaStatus: "ready"
      },
      {
        body:
          "flight board tabs behave like large headlines and clear switches — high-contrast controls keep the board easy to read for low-vision passengers while a focused light cue guides the eye to the next piece of information",
        media: { src: "/assets/projects/sheremetyevo-international-airport/sh_3.png", alt: "sheremetyevo screen 3" },
        mediaStatus: "ready"
      },
      {
        body:
          "the same visual system carries into detailed flight pages — each passenger gets a clear sequence of statuses, timings and actions for a single journey",
        media: { src: "/assets/projects/sheremetyevo-international-airport/sh_4.png", alt: "sheremetyevo screen 4" },
        mediaStatus: "ready"
      },
      {
        body:
          "a content-heavy flight check-in page uses an expanded split menu that stays open — a dedicated editor keeps the broad multilingual information structure consistent across every section",
        media: { src: "/assets/projects/sheremetyevo-international-airport/sh_5.png", alt: "sheremetyevo screen 5" },
        mediaStatus: "ready"
      },
      {
        body:
          "a flexible service directory brings together duty free, food, lounges, baggage, finance and more — passengers can find airport-specific options without leaving the core journey",
        media: { src: "/assets/projects/sheremetyevo-international-airport/sh_6.png", alt: "sheremetyevo screen 6" },
        mediaStatus: "ready"
      },
      {
        body:
          "an interactive airport map connects every terminal, service and route across the site — the full airport environment is drawn as one navigable system",
        media: { src: "/assets/projects/sheremetyevo-international-airport/sh_7.png", alt: "sheremetyevo screen 7" },
        mediaStatus: "ready"
      },
      {
        body:
          "a detailed terminal map extends the same navigation into on-site kiosks — floors, gates, services and accessibility routes remain useful once passengers are inside the airport",
        media: { src: "/assets/projects/sheremetyevo-international-airport/sh_8.png", alt: "sheremetyevo screen 8" },
        mediaStatus: "ready"
      }
    ]
  },
  {
    slug: "research-platform",
    title: "research platform",
    services: "research & product design",
    summary:
      "a goal-setting product explored from research to a working interface model — i studied academic sources alongside market and product patterns, then translated the findings into workstreams, feature priorities, a design system and core screens",
    cover: {
      src: "/assets/projects/research-platform/xx_1.png",
      alt: "research platform overview"
    },
    blocks: [
      {
        body:
          "to understand how a goal-setting product should work, nearly two hundred scientific studies, adjacent products, challenge mechanics and payment models were analysed — the findings defined what could work, what could not and how the product scenario should fit together",
        media: { src: "/assets/projects/research-platform/xx_1.png", alt: "research platform screen 1" },
        mediaStatus: "ready"
      },
      {
        body:
          "the research was developed into around fifteen focused workstreams — each theme received its own materials, comparisons, observations and design implications",
        media: { src: "/assets/projects/research-platform/xx_2.png", alt: "research platform screen 2" },
        mediaStatus: "ready"
      },
      {
        body:
          "market sizing compared app store and google play data across goal-related domains — differences in popularity and audience size showed which directions and domains deserved attention",
        media: { src: "/assets/projects/research-platform/xx_3.png", alt: "research platform screen 3" },
        mediaStatus: "ready"
      },
      {
        body:
          "a feature heatmap made the product landscape comparable — it shows which functions each project offers, which patterns repeat and where important mechanics are absent",
        media: { src: "/assets/projects/research-platform/xx_4.png", alt: "research platform screen 4" },
        mediaStatus: "ready"
      },
      {
        body:
          "the same feature data was clustered into product types — recurring combinations show which projects behave alike and which functions are most common within each group",
        media: { src: "/assets/projects/research-platform/xx_5.png", alt: "research platform screen 5" },
        mediaStatus: "ready"
      },
      {
        body:
          "research observations and product functions were placed along a single goal journey — each stage connects a user need to evidence, a product decision and the next action",
        media: {
          src: "/assets/projects/research-platform/xx_Screenshot 2026-10-08 at 8.12.39 PM 1.png",
          alt: "research platform screen 7"
        },
        mediaStatus: "ready"
      },
      {
        body:
          "research self-assessment turns each finding into a supported thesis — every thesis shows its strength, the studies behind it and the limits of that evidence",
        media: {
          src: "/assets/projects/research-platform/xx_Screenshot 2026-10-08 at 8.13.43 PM 1.png",
          alt: "research platform screen 8"
        },
        mediaStatus: "ready"
      },
      {
        body:
          "the solutions atlas brings every relevant pattern into one map — themes, stages and frequency make it possible to compare what the market already offers",
        media: {
          src: "/assets/projects/research-platform/xx_Screenshot 2026-10-08 at 8.15.19 PM 1.png",
          alt: "research platform screen 9"
        },
        mediaStatus: "ready"
      },
      {
        body:
          "a structural model defined the core entities before individual screens — goals, actions, participation, progress, rules and states were linked into one system",
        media: { src: "/assets/projects/research-platform/xx_6.png", alt: "research platform screen 6" },
        mediaStatus: "ready"
      },
      {
        body:
          "the design system translates the research into detailed core screens — plan acceptance, dashboard, goal chat, suggested actions and goals share one coherent product language",
        media: { src: "/assets/projects/research-platform/xx_7.png", alt: "research platform screen 10" },
        mediaStatus: "ready"
      },
      {
        body:
          "goal creation turns a vague wish into an achievable route — each case is worked through from clarification and a proposed goal to a plan, actions and follow-up",
        media: { src: "/assets/projects/research-platform/xx_8.png", alt: "research platform screen 11" },
        mediaStatus: "ready"
      }
    ]
  },
  {
    slug: "internet-computer",
    title: "internet computer",
    services: "web design & motion",
    summary:
      "digital launch work for a blockchain protocol with a developer audience — at clay, i contributed to several launches and two website directions, using interface design, motion and narrative to make technical concepts easier to understand",
    cover: {
      src: "/assets/projects/internet-computer/ic_1.png",
      alt: "internet computer website"
    },
    blocks: [
      {
        body:
          "the opening visualises an endless internet computer space through a 3d scene created by a collaborating artist — it gives the network a physical sense before the site begins explaining its technology",
        media: { src: "/assets/projects/internet-computer/ic_1.png", alt: "internet computer screen 1" },
        mediaStatus: "ready"
      },
      {
        body:
          "a detailed animated field of blocks makes the network structure tangible — the composition turns subnets and canisters into a readable spatial model",
        media: { src: "/assets/projects/internet-computer/ic_2.png", alt: "internet computer screen 2" },
        mediaStatus: "ready"
      },
      {
        body:
          "the site is composed as a sequence of horizontally scrolling panels — one long page holds a large amount of information while each panel gives a different part of the protocol its own motion, type and data treatment",
        media: { src: "/assets/projects/internet-computer/ic_3.png", alt: "internet computer screen 3" },
        mediaStatus: "ready"
      },
      {
        body:
          "one panel focuses on canisters, the self-contained units that hold application logic and data — a single visual scene and precise copy explain how information persists inside the network",
        media: { src: "/assets/projects/internet-computer/ic_4.png", alt: "internet computer screen 4" },
        mediaStatus: "ready"
      },
      {
        body:
          "the final panorama gives the network several visual languages at once — interface fragments, the icp-to-cycles flow and voting neurons make its usage, economics and governance legible from different angles",
        media: { src: "/assets/projects/internet-computer/ic_5.png", alt: "internet computer screen 5" },
        mediaStatus: "ready"
      }
    ]
  },
  {
    slug: "breaking",
    title: "high st",
    services: "branding, communication",
    summary:
      "brand communication for a multi-asset staking service — animated smoke, black 3d flowers and editorial type give the technical offer its own memorable voice",
    cover: {
      src: "/assets/projects/breaking/hg_3.png",
      alt: "high st staking website"
    },
    blocks: [
      {
        body:
          "the opening turns high-uptime staking into a brand statement — animated smoke, dark 3d flowers and typographic layers create a recognisable scene before the product offer appears",
        media: { src: "/assets/projects/breaking/hg_1.png", alt: "high st staking screen 1" },
        mediaStatus: "ready"
      },
      {
        body:
          "the service page translates a broad staking offer into an editorial system — assets, insurance, node operations, rpc access and api integrations share one visual language without losing their individual emphasis",
        media: { src: "/assets/projects/breaking/hg_2.png", alt: "high st staking screen 2" },
        mediaStatus: "ready"
      },
      {
        body:
          "the final conversion screen carries the same world into a direct invitation — a single promise and call to action let the brand act as a distinctive signal in a crowded crypto market",
        media: { src: "/assets/projects/breaking/hg_3.png", alt: "high st staking screen 3" },
        mediaStatus: "ready"
      }
    ]
  }
];

const directProjectDefinitions: Project[] = [
  {
    slug: "greeno",
    title: "greeno",
    services: "brand identity, packaging, digital experience",
    summary:
      "a multicultural brand for smart healthy-food terminals in dubai — the system connects meal choice, terminal interaction and transparent packaging in one recognisable everyday service",
    cover: {
      src: "/assets/projects/greeno/gr_01.png",
      alt: "greeno identity"
    },
    blocks: [
      {
        body:
          "the greeno mark is designed to travel across languages and food cultures — its flexible forms and language variants give people a familiar point of entry before they choose a meal",
        media: { src: "/assets/projects/greeno/gr_01.png", alt: "greeno identity" },
        mediaStatus: "ready"
      },
      {
        body:
          "the terminal introduces the service as a changing collection of healthy dishes — an editorial interface makes cultural variety, ingredients and daily choice feel simple to navigate",
        media: { src: "/assets/projects/greeno/gr_02.png", alt: "greeno terminal experience" },
        mediaStatus: "ready"
      },
      {
        body:
          "transparent food packs keep the meal itself visible — a sticker-based graphic layer carries the brand while each dish remains specific and easy to recognise",
        media: { src: "/assets/projects/greeno/gr_03.png", alt: "greeno transparent food packaging" },
        mediaStatus: "ready"
      },
      {
        body:
          "the label system adapts to different cuisines, formats and languages — each package can change without losing its place in the larger greeno world",
        media: { src: "/assets/projects/greeno/gr_04.png", alt: "greeno packaging label system" },
        mediaStatus: "ready"
      },
      {
        body:
          "across screen, terminal and packaging, the system turns a practical vending service into a consistent food experience — every touchpoint speaks the same visual language",
        media: { src: "/assets/projects/greeno/gr_05.png", alt: "greeno brand applications" },
        mediaStatus: "ready"
      }
    ]
  },
  {
    slug: "motif-network",
    title: "motif.network",
    services: "brand identity, product design, visual programming",
    summary:
      "a risk-scoring product for crypto wallets and counterparties — transaction history, connected addresses and custom rules turn an opaque chain into a clearer decision",
    cover: {
      src: "/assets/projects/motif-network/mn_01.png",
      alt: "motif.network identity"
    },
    blocks: [
      {
        body:
          "the identity turns a blockchain into a readable signal — linked forms and a central spark express the moment when an opaque trail becomes easier to understand",
        media: { src: "/assets/projects/motif-network/mn_01.png", alt: "motif.network identity" },
        mediaStatus: "ready"
      },
      {
        body:
          "a wallet score begins with the relationships behind an address — transactions, counterparties and behavioural signals form a chain that can be inspected instead of taken on faith",
        media: { src: "/assets/projects/motif-network/mn_02.png", alt: "motif.network wallet scoring overview" },
        mediaStatus: "ready"
      },
      {
        body:
          "the scoring logic can be assembled visually — connected nodes let teams define signals, thresholds and rules without losing the structure of the underlying model",
        media: { src: "/assets/projects/motif-network/mn_03.png", alt: "motif.network visual score builder" },
        mediaStatus: "ready"
      },
      {
        body:
          "the same scoring system is available in code — technical teams can inspect and implement the logic in the form that fits their workflow",
        media: { src: "/assets/projects/motif-network/mn_04.png", alt: "motif.network scoring code" },
        mediaStatus: "ready"
      }
    ]
  },
  {
    slug: "polee",
    title: "polee",
    services: "brand identity, communication, product design",
    summary:
      "a brand and product system for a creator-led content platform — a pass-shaped identity opens a broader world of authors, formats and paid access",
    cover: {
      src: "/assets/projects/polee/po_01.png",
      alt: "polee identity"
    },
    blocks: [
      {
        body:
          "the polee mark begins as a pass into a changing content space — the opening in the letterform makes access and discovery part of the identity itself",
        media: { src: "/assets/projects/polee/po_01.png", alt: "polee identity" },
        mediaStatus: "ready"
      },
      {
        body:
          "the first brand application turns that idea into a layered visual scene — the sign stays familiar while the content behind it can keep changing",
        media: { src: "/assets/projects/polee/po_02.png", alt: "polee layered brand scene" },
        mediaStatus: "ready"
      },
      {
        body:
          "the identity expands into a system for different content worlds — its frame becomes a way to introduce authors, formats and new points of view",
        media: { src: "/assets/projects/polee/po_03.png", alt: "polee content identity system" },
        mediaStatus: "ready"
      },
      {
        body:
          "key visuals place creative authors at the centre — bold crops, objects and gestures give each creator a distinct presence without fragmenting the wider brand",
        media: { src: "/assets/projects/polee/po_04.png", alt: "polee creative author key visual" },
        mediaStatus: "ready"
      },
      {
        body:
          "a second visual direction tests how the system can move between image-led and editorial communication — the platform feels broad enough for many kinds of creative work",
        media: { src: "/assets/projects/polee/po_05.png", alt: "polee editorial visual direction" },
        mediaStatus: "ready"
      },
      {
        body:
          "typographic communication turns the platform promise into short, direct statements — the identity works even when content is reduced to a line of text",
        media: { src: "/assets/projects/polee/po_06.png", alt: "polee typographic communication" },
        mediaStatus: "ready"
      },
      {
        body:
          "large-format messages add another register to the brand — simple language and strong composition make creative ambition feel public and approachable",
        media: { src: "/assets/projects/polee/po_07.png", alt: "polee large-format communication" },
        mediaStatus: "ready"
      },
      {
        body:
          "short-form social content gives the system a faster rhythm — reels, posts and recurring formats keep authors visible between larger releases",
        media: { src: "/assets/projects/polee/po_08.png", alt: "polee social content" },
        mediaStatus: "ready"
      },
      {
        body:
          "a playful campaign image shows how the platform can hold unexpected scenes — the idea of content remains open rather than tied to one category",
        media: { src: "/assets/projects/polee/po_09.png", alt: "polee campaign image" },
        mediaStatus: "ready"
      },
      {
        body:
          "the product feed brings different formats into one browsing space — cards, posts and visual signals help people move from discovery towards the work itself",
        media: { src: "/assets/projects/polee/po_10.png", alt: "polee product feed" },
        mediaStatus: "ready"
      },
      {
        body:
          "an author page gives each creator a recognisable home — profile, work and paid access are arranged as one continuous personal space",
        media: { src: "/assets/projects/polee/po_11.png", alt: "polee author page" },
        mediaStatus: "ready"
      },
      {
        body:
          "an expanded cover turns the author page into a stronger editorial moment — visual identity, profile context and the content world meet before the feed begins",
        media: { src: "/assets/projects/polee/po_12.png", alt: "polee expanded author cover" },
        mediaStatus: "ready"
      }
    ]
  },
  {
    slug: "cdms",
    title: "cdmsm",
    services: "brand identity, web design",
    summary:
      "an identity and content system for a polish school of thought, taste and speech — the design creates a shared editorial language for learning, culture and personal expression",
    cover: {
      src: "/assets/projects/cdms/um_01.png",
      alt: "cdms identity"
    },
    blocks: [
      {
        body:
          "the cdms identity gives the school’s long name a compact visual anchor — the mark and the statement about thought, taste and speech work as one cultural signature",
        media: { src: "/assets/projects/cdms/um_01.png", alt: "cdms identity" },
        mediaStatus: "ready"
      },
      {
        body:
          "the website treats learning material as an editorial catalogue — subjects and formats stay easy to browse without losing their individual tone",
        media: { src: "/assets/projects/cdms/um_02.png", alt: "cdms content catalogue" },
        mediaStatus: "ready"
      },
      {
        body:
          "a cover system lets every piece of content join the same visual language — typography, colour and the logo shift together to make the collection feel related",
        media: { src: "/assets/projects/cdms/um_03.png", alt: "cdms content covers" },
        mediaStatus: "ready"
      }
    ]
  },
  {
    slug: "knowfid",
    title: "knowfid",
    services: "visual identity, product concept",
    summary:
      "a visual concept for facial kyc — identity verification is treated as a clear exchange of recognition, confidence and next action",
    cover: {
      src: "/assets/projects/knowfid/kn_01.png",
      alt: "knowfid identity"
    },
    blocks: [
      {
        body:
          "the mark frames a face as a signal being recognised — a detector-like form makes the core verification action visible at a glance",
        media: { src: "/assets/projects/knowfid/kn_01.png", alt: "knowfid identity" },
        mediaStatus: "ready"
      },
      {
        body:
          "colour, contrast and rounded fields turn identity checks into a calmer product language — the interface feels direct without making the underlying process look opaque",
        media: { src: "/assets/projects/knowfid/kn_02.png", alt: "knowfid visual system" },
        mediaStatus: "ready"
      },
      {
        body:
          "large blocks and short messages keep the important states immediately legible — recognition, confidence and next actions become the main visual content",
        media: { src: "/assets/projects/knowfid/kn_03.png", alt: "knowfid interface message system" },
        mediaStatus: "ready"
      },
      {
        body:
          "the concept explores a flexible system rather than one fixed screen — key messages, fields and colour states can shift while the identity stays recognisable",
        media: { src: "/assets/projects/knowfid/kn_04.png", alt: "knowfid concept applications" },
        mediaStatus: "ready"
      }
    ]
  },
  {
    slug: "fetch-fab",
    title: "fetch fab",
    services: "creative direction, visual identity, digital experience",
    summary:
      "a concept for a programme that trains people to challenge habitual thinking — the visual language treats thoughts as forms that can be disrupted, reframed and rebuilt",
    cover: {
      src: "/assets/projects/fetch-fab/fm_01.png",
      alt: "fetch fab identity"
    },
    blocks: [
      {
        body:
          "the fetch fab mark begins with a familiar signal and fractures it into a new shape — the identity makes a change in thinking visible before any explanation appears",
        media: { src: "/assets/projects/fetch-fab/fm_01.png", alt: "fetch fab identity" },
        mediaStatus: "ready"
      },
      {
        body:
          "the site frames complex problems as material for transformation — distorted forms and direct language encourage people to challenge the path their thinking usually takes",
        media: { src: "/assets/projects/fetch-fab/fm_02.png", alt: "fetch fab thinking programme website" },
        mediaStatus: "ready"
      },
      {
        body:
          "visual experiments turn mental friction into an expressive system — stretched, broken and recombined shapes suggest that new answers can start with a changed point of view",
        media: { src: "/assets/projects/fetch-fab/fm_03.png", alt: "fetch fab visual experiment" },
        mediaStatus: "ready"
      },
      {
        body:
          "the final composition brings the idea into a single invitation — distort your thinking, then use the new shape to approach what once felt unsolvable",
        media: { src: "/assets/projects/fetch-fab/fm_04.png", alt: "fetch fab invitation" },
        mediaStatus: "ready"
      }
    ]
  }
];

const projectOrder = [
  "content-platform-experiments",
  "football-federation",
  "internet-computer",
  "sheremetyevo-international-airport",
  "research-platform",
  "breaking"
] as const;

export const projects: Project[] = projectOrder.map((slug) => {
  const project = projectDefinitions.find((candidate) => candidate.slug === slug);

  if (!project) {
    throw new Error(`missing project definition for ${slug}`);
  }

  return project;
});

const directProjectOrder = ["polee", "greeno", "motif-network", "cdms", "knowfid", "fetch-fab"] as const;

export const directProjects: Project[] = directProjectOrder.map((slug) => {
  const project = directProjectDefinitions.find((candidate) => candidate.slug === slug);

  if (!project) {
    throw new Error(`missing direct project definition for ${slug}`);
  }

  return project;
});

export const allProjects: Project[] = [...projects, ...directProjects];

const homeCardDefinitions: HomeProjectCard[] = [
  {
    id: "content-platform-experiments",
    projectSlug: "content-platform-experiments",
    cover: { src: "/assets/projects/content-platform-experiments/s_1.png", alt: "Pock content platform interface" },
    mediaStatus: "ready"
  },
  {
    id: "football-federation",
    projectSlug: "football-federation",
    cover: { src: "/assets/projects/football-federation/qf_1.png", alt: "Digital platform for the football federation interface" },
    mediaStatus: "ready"
  },
  {
    id: "sheremetyevo-international-airport",
    projectSlug: "sheremetyevo-international-airport",
    cover: { src: "/assets/projects/sheremetyevo-international-airport/sh_1.png", alt: "Sheremetyevo International Airport screen" },
    mediaStatus: "ready"
  },
  {
    id: "research-platform",
    projectSlug: "research-platform",
    cover: { src: "/assets/projects/research-platform/xx_1.png", alt: "Research platform overview" },
    mediaStatus: "ready"
  },
  {
    id: "internet-computer",
    projectSlug: "internet-computer",
    cover: { src: "/assets/projects/internet-computer/ic_1.png", alt: "internet computer website" },
    mediaStatus: "ready"
  },
  {
    id: "breaking",
    projectSlug: "breaking",
    cover: { src: "/assets/projects/breaking/hg_1.png", alt: "high st staking screen 1" },
    mediaStatus: "ready"
  }
];

export const homeCards: HomeProjectCard[] = projectOrder.map((projectSlug) => {
  const card = homeCardDefinitions.find((candidate) => candidate.projectSlug === projectSlug);

  if (!card) {
    throw new Error(`missing home card for ${projectSlug}`);
  }

  return card;
});
