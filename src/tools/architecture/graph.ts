import { Project } from "npm:ts-morph@21.0.1";

export function buildDependencyGraph() {
  const project = new Project({
    skipAddingFilesFromTsConfig: true
  });

  return {
    project,
    nodes: []
  };
}
