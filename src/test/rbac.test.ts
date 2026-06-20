import { AuthorizationService } from "../core/security/AuthorizationService.ts";

Deno.test("RBAC allows admin access", () => {
  if (!AuthorizationService.hasPermission("admin", "billing:write")) {
    throw new Error("Admin should have permission");
  }
});

Deno.test("RBAC blocks user write access", () => {
  const allowed = AuthorizationService.hasPermission("user", "billing:write");

  if (allowed) {
    throw new Error("User should not have billing write access");
  }
});
