#!/usr/bin/env -S deno run --allow-read --allow-env

/**
 * 🧱 GFOS Architecture Engine v2 (Correct)
 * ----------------------------------------
 * يعتمد على تحليل imports فقط وليس النصوص
 */

const ROOT = "src";

// ===============================
// قواعد الاعتماد (Dependency Rules)
// ===============================
const RULES = [
  {
    from: "domain",
    deny: ["infrastructure", "interfaces", "application"],
  },
  {
    from: "application",
    deny: ["infrastructure"],
  },
  {
    from: "interfaces",
    deny: ["infrastructure"],
  },
];

// ===============================
// استخراج الطبقة
// ===============================
function getLayer(path: string): string {
  const parts = path.split("/");
  const i = parts.indexOf("src");
  return parts[i + 1] || "";
}

// ===============================
// استخراج imports فقط (مهم)
// ===============================
function extractImports(content: string): string[] {
  const imports: string[] = [];

  const importRegex = /from\s+["']([^"']+)["']/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

// ===============================
// تحويل import إلى layer
// ===============================
function resolveLayer(importPath: string): string {
  if (importPath.includes("infrastructure")) return "infrastructure";
  if (importPath.includes("application")) return "application";
  if (importPath.includes("interfaces")) return "interfaces";
  if (importPath.includes("domain")) return "domain";
  return "external";
}

// ===============================
// فحص الملفات
// ===============================
function getFiles(dir: string): string[] {
  const files: string[] = [];

  for (const entry of Deno.readDirSync(dir)) {
    const full = `${dir}/${entry.name}`;

    if (entry.isDirectory) {
      files.push(...getFiles(full));
    } else if (entry.name.endsWith(".ts")) {
      files.push(full);
    }
  }

  return files;
}

// ===============================
// فحص الانتهاكات
// ===============================
function check(files: string[]) {
  const violations: string[] = [];

  for (const file of files) {
    const layer = getLayer(file);
    const content = Deno.readTextFileSync(file);

    const imports = extractImports(content);

    for (const imp of imports) {
      const targetLayer = resolveLayer(imp);

      for (const rule of RULES) {
        if (layer !== rule.from) continue;

        if (rule.deny.includes(targetLayer)) {
          violations.push(
            `[VIOLATION] ${layer} → ${targetLayer} in ${file}`
          );
        }
      }
    }
  }

  return violations;
}

// ===============================
// تشغيل
// ===============================
function run() {
  console.log("🧱 Running Architecture Engine v2...");

  const files = getFiles(ROOT);
  const violations = check(files);

  if (violations.length > 0) {
    console.log("\n🚨 ARCHITECTURE VIOLATIONS DETECTED:\n");

    for (const v of violations) {
      console.log(v);
    }

    console.log("\n❌ BUILD FAILED");
    Deno.exit(1);
  }

  console.log("✅ Architecture OK");
}

run();
