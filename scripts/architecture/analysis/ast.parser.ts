import { Project } from "npm:ts-morph";

export interface ImportEdge {
  from: string;
  to: string;
}

export class ASTParser {
  private project = new Project({
    tsConfigFilePath: "tsconfig.json",
  });

  getImportEdges(): ImportEdge[] {
    const edges: ImportEdge[] = [];

    const sourceFiles = this.project.getSourceFiles();

    for (const file of sourceFiles) {
      const filePath = file.getFilePath();

      for (const imp of file.getImportDeclarations()) {
        const resolved = imp.getModuleSpecifierSourceFile();
        if (!resolved) continue;

        edges.push({
          from: filePath,
          to: resolved.getFilePath(),
        });
      }
    }

    return edges;
  }
}
