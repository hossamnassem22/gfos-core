import { Project } from "npm:ts-morph";
import { ArchitectureGraph, GraphNode, GraphEdge } from "./graph.types.ts";

export class GraphBuilder {
  private project: Project;

  constructor() {
    this.project = new Project({
      tsConfigFilePath: "tsconfig.json",
    });
  }

  build(): ArchitectureGraph {
    const nodes = new Map<string, GraphNode>();
    const edges: GraphEdge[] = [];

    const files = this.project.getSourceFiles();

    for (const file of files) {
      const filePath = file.getFilePath();

      nodes.set(filePath, {
        id: filePath,
        path: filePath,
        type: this.detectType(filePath),
      });

      for (const imp of file.getImportDeclarations()) {
        edges.push({
          from: filePath,
          to: imp.getModuleSpecifierValue(),
          fromType: this.detectType(filePath),
          toType: this.detectType(imp.getModuleSpecifierValue()),
          file: filePath,
        });
      }
    }

    return {
      nodes,
      edges, // ✅ Array حقيقي 100%
    };
  }

  private detectType(path: string) {
    if (path.includes("/domain/")) return "domain";
    if (path.includes("/application/")) return "application";
    if (path.includes("/interfaces/")) return "interfaces";
    return "infrastructure";
  }
}
