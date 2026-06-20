import { SessionRepositoryPort } from "../../domain/ports/SessionRepositoryPort.ts";
import { Session } from "../../domain/models/Session.ts";

export class SessionService {
  constructor(private repo: SessionRepositoryPort) {}

  async create(userId: number, refreshToken: string, expiresAt: Date): Promise<void> {
    await this.repo.create(userId, refreshToken, expiresAt);
  }

  async find(refreshToken: string): Promise<Session | null> {
    return await this.repo.find(refreshToken);
  }

  async revoke(refreshToken: string): Promise<void> {
    await this.repo.revoke(refreshToken);
  }
}
