import { ReminderRepository } from "../core/ports/ReminderRepository.ts";

export class ReminderWorker {
  constructor(private repo: ReminderRepository) {}

  async run() {
    const reminders = await this.repo.getDueReminders();

    for (const r of reminders) {
      console.log("Processing reminder:", r);
    }
  }
}
