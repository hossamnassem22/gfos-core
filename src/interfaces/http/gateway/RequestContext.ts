export interface RequestContext {
  requestId: string;
  tenantId: string;
  userId: string;
  ip: string;
  path: string;
  method: string;
}
