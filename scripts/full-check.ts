const cmds = [
  "deno run --allow-read scripts/arch-check.ts",
  "deno test --allow-read --allow-env --allow-net",
];

for (const cmd of cmds) {
  const p = Deno.run({
    cmd: ["bash", "-c", cmd],
    stdout: "inherit",
    stderr: "inherit",
  });

  const status = await p.status();

  if (!status.success) {
    console.log("\n❌ SYSTEM CHECK FAILED");
    Deno.exit(1);
  }
}

console.log("\n✅ FULL SYSTEM VERIFIED");
