import { ARCHITECTURE_RULES } from "../registry.ts";

export interface Violation {
  ruleId: string;
  file: string;
  match: string;
}

function getLayer(file: string): string {
  if (file.includes("src/application")) return "application";
  if (file.includes("src/core")) return "core";
  if (file.includes("src/domain")) return "domain";
  if (file.includes("src/interfaces")) return "interfaces";
  if (file.includes("src/infrastructure")) return "infrastructure";
  if (file.includes("src/test")) return "test";
  if (file.includes("src/workers")) return "workers";
  return "unknown";
}

export function scanFiles(files: string[], contentMap: Record<string, string>) {
  const violations: Violation[] = [];

  for (const file of files) {
    const content = contentMap[file] || "";
    const layer = getLayer(file);

    for (const rule of ARCHITECTURE_RULES.forbiddenImports) {
      if (!content.includes(rule.pattern)) continue;

      // ❗ المنطق الجديد: السماح داخل infrastructure نفسها
      if (layer === "infrastructure") continue;

      violations.push({
        ruleId: rule.id,
        file,
        match: rule.pattern,
      });
    }
  }

  return violations;
}
