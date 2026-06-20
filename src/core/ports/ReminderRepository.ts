export interface ReminderRepository {
  getDueReminders(): Promise<any[]>;
}
