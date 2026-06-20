import { walk } from "https://deno.land/std/fs/mod.ts";

const FORBIDDEN_IMPORTS = [
  "application/services",
  "infrastructure/auth/AuthService",
];

export async function assertArchitectureIntegrity() {
  for await (const file of walk("./src", { exts: [".ts"] })) {
    const content = await Deno.readTextFile(file.path);

    for (const rule of FORBIDDEN_IMPORTS) {
      if (content.includes(rule)) {
        throw new Error(
          `ARCHITECTURE VIOLATION: ${file.path} imports forbidden layer -> ${rule}`
        );
      }
    }
  }

  console.log("✅ Architecture OK");
}
