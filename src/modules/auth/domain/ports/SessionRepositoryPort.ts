import { Session } from "../models/Session.ts";

export interface SessionRepositoryPort {
  create(userId: number, refreshToken: string, expiresAt: Date): Promise<void>;
  find(refreshToken: string): Promise<Session | null>;
  revoke(refreshToken: string): Promise<void>;
}
