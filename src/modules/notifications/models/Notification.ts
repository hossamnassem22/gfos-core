export interface Notification {
  recipientId: string;
  channel: "EMAIL" | "SMS" | "SYSTEM";
  templateId: string;
  data: Record<string, any>;
  priority: "LOW" | "HIGH" | "URGENT";
}
