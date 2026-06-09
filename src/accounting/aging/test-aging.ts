import { AgingEngineImpl } from "./AgingEngine.ts";

const engine = new AgingEngineImpl();
const now = new Date();
const pastDate = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

const statement = {
  entries: [
    { date: pastDate(10), debit: 1000, credit: 0 }, // CURRENT
    { date: pastDate(40), debit: 2000, credit: 0 }, // D30_60
    { date: pastDate(70), debit: 3000, credit: 0 }  // D60_90
  ]
};

const profile = engine.buildProfile("CUST-001", statement);
console.log("Aging Profile:", JSON.stringify(profile, null, 2));

if (profile.buckets.D30_60 === 2000 && profile.buckets.D60_90 === 3000) {
    console.log("✅ Aging Engine Test Passed: Buckets distribution is correct.");
} else {
    console.error("❌ Aging Engine Test Failed.");
}
