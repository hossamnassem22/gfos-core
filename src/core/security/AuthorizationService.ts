import { Role, Permission, ROLE_PERMISSIONS } from "./rbac.ts";

export class AuthorizationService {
  static hasPermission(role: Role, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role].includes(permission);
  }

  static assert(role: Role, permission: Permission) {
    if (!this.hasPermission(role, permission)) {
      throw new Error(
        `ACCESS_DENIED: role=${role} missing permission=${permission}`
      );
    }
  }
}
