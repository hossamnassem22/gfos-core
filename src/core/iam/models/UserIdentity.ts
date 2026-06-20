export interface UserIdentity {
  userId: string;
  tenantId: string;
  email: string;
  roles: string[];
  mfaEnabled: boolean;
  lastLogin: string;
}
