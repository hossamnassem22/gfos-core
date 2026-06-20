import { AuthorizationService } from "../../core/security/AuthorizationService.ts";
import { UserContext } from "../../core/context/UserContext.ts";
import { Permission } from "../../core/security/rbac.ts";

export class SecurityGuard {
  static check(permission: Permission) {
    const user = UserContext.get();

    AuthorizationService.assert(user.role, permission);

    return true;
  }
}
