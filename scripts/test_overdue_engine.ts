import { OverdueEngine } from "../src/application/services/OverdueEngine.ts";

console.log("--- Starting Overdue Engine Test (Dry Run) ---");

try {
  // نقوم بتشغيله كـ dryRun للتأكد من أن الاستعلامات تعمل بدون تغيير البيانات فعلياً
  const result = await OverdueEngine.process({ dryRun: true, batchSize: 5 });
  
  console.log("✓ Test completed successfully.");
  console.log("Result:", result);
} catch (err) {
  console.error("✗ Test failed:");
  console.error(err);
}
