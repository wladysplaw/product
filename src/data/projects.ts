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

export const projects: Project[] = [
  {
    slug: "content-platform-experiments",
    title: "content platform experiments",
    services: "end-to-end",
    summary:
      "a series of experimental digital products exploring new ways to create, distribute and monetize content — each product serves as a testing ground for product hypotheses, user behaviors and business models, helping identify promising ideas and opportunities for further development",
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
    services: "art direction, concept, ux/ui — at brele",
    summary:
      "a federation management portal where each football federation runs its own digital ecosystem — clubs, tournaments, matches, players, coaches and every workflow around them live in one connected system",
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
    services: "lead design at beta",
    summary:
      "a connected airport product ecosystem spanning the website, mobile app, watch app, navigation maps and terminal maps — lead design at beta brought the system together across passenger journeys, terminal navigation and airport services",
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
    services: "end-to-end",
    summary:
      "end-to-end research and product design for a system that helps people set goals and reach them — evidence, market patterns and product logic were synthesized into one path from a first intention to sustained progress",
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
    services: "lead design at clay",
    summary:
      "internet computer is a decentralized network for running applications, websites and services as canisters — the site turns its protocol, infrastructure and network economy into one continuous visual story",
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

export const homeCards: HomeProjectCard[] = [
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
