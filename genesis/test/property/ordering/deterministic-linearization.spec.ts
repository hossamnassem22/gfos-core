import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import * as fc from "npm:fast-check";
// تصحيح المسار: نخرج 4 مستويات للوصول للجذر حيث يوجد الكود
import { CanonicalComparator } from "../../../../CanonicalComparator.ts";

Deno.test("Certification: Deterministic Ordering Contract", async () => {
  await fc.assert(
    fc.asyncProperty(fc.array(fc.record({
      id: fc.string(),
      hash: fc.string(),
      sequenceHint: fc.integer()
    })), (events) => {
      // الترتيب باستخدام المقارن القانوني (Canonical)
      const sorted1 = [...events].sort(CanonicalComparator.compare);
      const sorted2 = [...events].reverse().sort(CanonicalComparator.compare);
      
      assertEquals(sorted1, sorted2, "فشل الحتمية: الترتيب تغير بتغير ترتيب المدخلات!");
    })
  );
});
