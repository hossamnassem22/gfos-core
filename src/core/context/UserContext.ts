import { Role } from "../security/rbac.ts";

export interface UserIdentity {
  userId: string;
  tenantId: string;
  role: Role;
}

export class UserContext {
  private static current: UserIdentity | null = null;

  static set(user: UserIdentity) {
    this.current = user;
  }

  static get(): UserIdentity {
    if (!this.current) {
      throw new Error("User context not set");
    }
    return this.current;
  }

  static clear() {
    this.current = null;
  }
}
