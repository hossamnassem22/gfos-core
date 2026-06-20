export interface Session {
  readonly id: number;
  readonly userId: number;
  readonly refreshToken: string;
  readonly expiresAt: Date;
}
