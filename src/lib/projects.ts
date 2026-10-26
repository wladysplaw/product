import type { Project } from "../data/projects";

export type ProjectPath = {
  params: {
    slug: string;
  };
};

export type ProjectNeighbors = {
  previous: Project | undefined;
  next: Project | undefined;
};

export function getProjectPaths(items: readonly Project[]): ProjectPath[] {
  return items.map(({ slug }) => ({ params: { slug } }));
}

export function getProjectBySlug(slug: string, items: readonly Project[]): Project | undefined {
  return items.find((project) => project.slug === slug);
}

export function getProjectNeighbors(slug: string, items: readonly Project[]): ProjectNeighbors {
  const index = items.findIndex((project) => project.slug === slug);

  return {
    previous: index > 0 ? items[index - 1] : undefined,
    next: index >= 0 ? items[(index + 1) % items.length] : undefined
  };
}
