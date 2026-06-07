import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import * as fc from "npm:fast-check";
import { GenesisKernel } from "@kernel/GenesisKernel.ts";
import { SnapshotEngine } from "@engine/SnapshotEngine.ts";

Deno.test("Crash Recovery: Real-world State Integrity", async () => {
  const mockStorage = new SnapshotEngine(); 
  const kernel = new GenesisKernel(mockStorage);

  await fc.assert(
    fc.asyncProperty(fc.array(fc.string({ minLength: 1 })), async (events) => {
      for (const e of events) {
        await kernel.executeAction(e);
      }
      const originalState = kernel.getState();
      const recoveredState = await mockStorage.load();

      assertEquals(recoveredState, originalState, "حالة النظام بعد التعافي تختلف عن الحالة الأصلية!");
    })
  );
});
