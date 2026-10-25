export type LocalAssetPath = `/${string}`;

export type ProjectImageBlock = {
  type: "image";
  src: LocalAssetPath;
  alt: string;
  caption?: string;
};

export type ProjectCopyBlock = {
  type: "copy";
  body: string;
};

export type ProjectBlock = ProjectImageBlock | ProjectCopyBlock;

export type Project = {
  slug: string;
  title: string;
  services: string;
  summary: string;
  cover: {
    src: LocalAssetPath;
    alt: string;
  };
  blocks: ProjectBlock[];
};

export const projects: Project[] = [];
