import { OverdueEngine } from "@app/services/OverdueEngine.ts";
import { NotificationEngine } from "@app/services/NotificationEngine.ts";

function msUntil(hour: number, minute: number): number {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

export function startOverdueScheduler() {
  async function run() {
    console.log(`[Scheduler] Running at ${new Date().toISOString()}`);
    try {
      const overdueResult = await OverdueEngine.process({ dryRun: false });
      console.log(`[Scheduler] OverdueEngine:`, overdueResult);
      const notifResult = await NotificationEngine.process();
      console.log(`[Scheduler] Notifications: created=${notifResult.created} skipped=${notifResult.skipped}`);
    } catch (err) {
      console.error(`[Scheduler] Error:`, err);
    }
    setTimeout(run, msUntil(0, 5));
  }

  const delay = msUntil(0, 5);
  console.log(`[Scheduler] Next run in ${Math.round(delay / 60000)} minutes`);
  setTimeout(run, delay);
}
