// سكربت بسيط للتحقق من عدم وجود استيرادات غير قانونية (Dependency Violation)
const content = Deno.readTextFileSync("src/modules/auth/AuthModule.ts");
if (content.includes("some-forbidden-module")) {
  console.error("Architecture Violation detected!");
  Deno.exit(1);
}
console.log("Architecture Guard: PASSED");
