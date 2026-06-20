export type Role = "admin" | "manager" | "user";

export type Permission =
  | "tenant:read"
  | "tenant:write"
  | "billing:read"
  | "billing:write"
  | "agreement:read"
  | "agreement:write";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "tenant:read",
    "tenant:write",
    "billing:read",
    "billing:write",
    "agreement:read",
    "agreement:write",
  ],
  manager: [
    "tenant:read",
    "billing:read",
    "agreement:read",
    "agreement:write",
  ],
  user: [
    "tenant:read",
    "agreement:read",
  ],
};
