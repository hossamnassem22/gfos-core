export interface AccessRule {
  role: string;
  resource: string;
  permissions: ("READ" | "WRITE" | "DELETE")[];
}

export const DefaultRules: AccessRule[] = [
  { role: "ADMIN", resource: "BILLING", permissions: ["READ", "WRITE"] }
];
