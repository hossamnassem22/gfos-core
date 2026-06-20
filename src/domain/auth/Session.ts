export interface Session {
  userId: number;
  refreshToken: string;
  expiresAt: Date;
  revoked: boolean;
}
