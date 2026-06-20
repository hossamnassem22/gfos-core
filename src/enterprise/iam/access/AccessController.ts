import { IdentityProfile } from "../identity/IdentityProfile.ts";

export class AccessController {
  static canPerform(user: IdentityProfile, action: string): boolean {
    return user.permissions.includes(action);
  }
}
