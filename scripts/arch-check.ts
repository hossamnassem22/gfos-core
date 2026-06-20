import { collectTsFiles } from "../src/architecture/scanner/files.ts";
import { scanFiles } from "../src/architecture/scanner/analyzer.ts";

const EXCLUDED_PATHS = [
  "src/architecture/",
  "scripts/",
];

function shouldExclude(file: string) {
  return EXCLUDED_PATHS.some(p => file.includes(p));
}

async function readFiles(files: string[]) {
  const map: Record<string, string> = {};

  for (const file of files) {
    map[file] = await Deno.readTextFile(file);
  }

  return map;
}

const allFiles = await collectTsFiles("src");

// ❗ فلترة الملفات المهمة فقط
const files = allFiles.filter(f => !shouldExclude(f));

const contentMap = await readFiles(files);

const violations = scanFiles(files, contentMap);

if (violations.length > 0) {
  console.log("❌ ARCHITECTURE VIOLATIONS:\n");

  for (const v of violations) {
    console.log(`- ${v.ruleId} => ${v.match} in ${v.file}`);
  }

  console.log("\nTotal:", violations.length);
  Deno.exit(1);
}

console.log("✅ Architecture Stable (Stabilization Layer Active)");
