import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";

const RULES = [
  {
    name: "NO_DOMAIN_IMPORT_INFRASTRUCTURE",
    from: "src/domain",
    forbidden: ["src/infrastructure", "src/application"],
  },
  {
    name: "NO_APPLICATION_IMPORT_INFRASTRUCTURE",
    from: "src/application",
    forbidden: ["src/infrastructure/database", "src/infrastructure/security"],
  },
];

function checkViolations(filePath: string, content: string) {
  const violations: string[] = [];

  for (const rule of RULES) {
    if (!filePath.startsWith(rule.from)) continue;

    for (const forbidden of rule.forbidden) {
      if (content.includes(forbidden)) {
        violations.push(
          `${rule.name} => ${forbidden} in ${filePath}`,
        );
      }
    }
  }

  return violations;
}

Deno.test("Architecture - clean boundaries enforcement", async () => {
  const violations: string[] = [];

  for await (const entry of walk("./src", { includeFiles: true })) {
    if (!entry.path.endsWith(".ts")) continue;

    const content = await Deno.readTextFile(entry.path);
    violations.push(...checkViolations(entry.path, content));
  }

  if (violations.length > 0) {
    console.log("\n❌ ARCHITECTURE VIOLATIONS:");
    for (const v of violations) console.log("-", v);
    console.log("----- output end -----");

    throw new Error(`Architecture violation detected (${violations.length})`);
  }

  console.log("✅ Architecture clean");
});
