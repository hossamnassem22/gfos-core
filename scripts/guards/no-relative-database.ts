const forbiddenPatterns = [
  "../../database",
  "../database",
  "@infra/database",
  "database/connection"
];

const cmd = new Deno.Command("grep", {
  args: ["-R", forbiddenPatterns.join("|"), "src"]
});

const { stdout } = await cmd.output();
const result = new TextDecoder().decode(stdout);

if (result.trim()) {
  console.log("🚨 DATABASE LAYER VIOLATION:");
  console.log(result);
  Deno.exit(1);
}

console.log("✅ No forbidden database imports");
