import { AuthEngine } from "../auth/AuthEngine.ts";

export class IdentityGuard {
  static async verifyRequest(token: string) {
    const engine = new AuthEngine();
    const identity = await engine.authenticate(token);
    
    // ربط الهوية بسياق المستأجر (TenantContext) الذي بنيناه سابقاً
    // TenantContext.set(identity.tenantId); 
    return identity;
  }
}
