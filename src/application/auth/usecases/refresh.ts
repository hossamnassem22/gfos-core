import { TokenService } from "../../../core/TokenService.ts";
import { SessionRepositoryPort } from "../../ports/session-repository.port.ts";

export class RefreshUseCase {
  constructor(
    private sessions: SessionRepositoryPort,
    private tokens = new TokenService(Deno.env.get("JWT_SECRET")!)
  ) {}

  async execute(refreshToken: string) {
    if (!refreshToken) throw new Error("MISSING_REFRESH_TOKEN");

    const session = await this.sessions.findByToken(refreshToken);
    if (!session || session.revoked) {
      throw new Error("INVALID_SESSION");
    }

    const payload = await this.tokens.verify(refreshToken);

    if (payload.type !== "refresh") {
      throw new Error("INVALID_TOKEN_TYPE");
    }

    const newAccessToken = await this.tokens.signAccess({
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    return { accessToken: newAccessToken };
  }
}
