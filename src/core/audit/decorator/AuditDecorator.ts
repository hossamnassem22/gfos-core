import { AuditLogger } from "../engine/AuditLogger.ts";

export class AuditDecorator {
  static async audit<T>(actor: string, action: string, resource: string, actionFn: () => Promise<T>): Promise<T> {
    try {
      const result = await actionFn();
      await AuditLogger.log({ actor, action, resource, status: "SUCCESS", timestamp: "", metadata: {} });
      return result;
    } catch (e) {
      await AuditLogger.log({ actor, action, resource, status: "FAILURE", timestamp: "", metadata: { error: e.message } });
      throw e;
    }
  }
}
