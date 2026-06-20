import { Role } from "../../domain/auth/Role.ts";

export class Policy {
  static canAccess(userRole: Role, required: Role[]): boolean {
    const hierarchy: Role[] = ["USER", "ADMIN", "SUPERADMIN"];

    const userIndex = hierarchy.indexOf(userRole);

    return required.some(role => userIndex >= hierarchy.indexOf(role));
  }
}
