export interface ManagementRequest {
  action: "RESET_DATA" | "EXPORT_LOGS" | "UPDATE_CONFIG";
  parameters: Record<string, any>;
  requestedAt: string;
}
