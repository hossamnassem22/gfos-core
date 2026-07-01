import { ArchitectureGraph, GraphNode, GraphEdge } from "./graph.types.ts";

export class GraphBuilder {
  build(): ArchitectureGraph {
    const nodes = new Map<string, GraphNode>();
    const edges: GraphEdge[] = [];

    // Recursively find .ts files under src and scripts
    const files = this.collectFiles(["src", "scripts"]);

    for (const filePath of files) {
      nodes.set(filePath, {
        id: filePath,
        path: filePath,
        type: this.detectType(filePath),
      });

      const content = Deno.readTextFileSync(filePath);
      const importRegex = /import\s+(?:[^'"\n]+)\s+from\s+['"](.+)['"]/g;
      let m: RegExpExecArray | null;
      while ((m = importRegex.exec(content)) !== null) {
        const spec = m[1];
        let target = spec;
        if (spec.startsWith("./") || spec.startsWith("../")) {
          try {
            const resolved = new URL(spec, `file://${Deno.cwd()}/${filePath}`).pathname;
            // Normalize leading slash if present
            target = resolved.startsWith("/") ? resolved.slice(1) : resolved;
          } catch (_) {
            target = spec;
          }
        }

        edges.push({
          from: filePath,
          to: target,
          fromType: this.detectType(filePath),
          toType: this.detectType(target),
          file: filePath,
        });
      }
    }

    return {
      nodes,
      edges,
    };
  }

  private collectFiles(dirs: string[]) {
    const out: string[] = [];
    for (const d of dirs) {
      try {
        this.walkSync(d, out);
      } catch (_err) {
        // ignore missing directories
      }
    }
    return out;
  }

  private walkSync(dir: string, out: string[]) {
    for (const entry of Deno.readDirSync(dir)) {
      const full = `${dir}/${entry.name}`;
      if (entry.isDirectory) {
        this.walkSync(full, out);
      } else if (entry.isFile && full.endsWith(".ts")) {
        out.push(full);
      }
    }
  }

  private detectType(path: string) {
    if (path.includes("/domain/")) return "domain";
    if (path.includes("/application/")) return "application";
    if (path.includes("/interfaces/")) return "interfaces";
    return "infrastructure";
  }
}
