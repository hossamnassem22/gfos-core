import { PolicyEngine } from "../policy/PolicyEngine.ts";

export class AccessGuard {
  static async protect<T>(resource: string, action: string, actionFn: () => Promise<T>): Promise<T> {
    if (!PolicyEngine.authorize(resource, action)) {
      throw new Error("[SECURITY] Access Denied");
    }
    return await actionFn();
  }
}
