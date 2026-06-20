import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { AuthFacade } from "./AuthFacade.ts";
import { PostgresUserRepository } from "../infrastructure/persistence/PostgresUserRepository.ts";
import { PostgresSessionRepository } from "../infrastructure/persistence/PostgresSessionRepository.ts";
import { SessionService } from "./services/SessionService.ts";
import { JwtTokenService } from "../infrastructure/security/JwtTokenService.ts";

export class AuthModuleComposer {
  static compose(pool: Pool) {
    // Infrastructure Adapters
    const userRepo = new PostgresUserRepository(pool);
    const sessionRepo = new PostgresSessionRepository(pool);
    const tokenService = new JwtTokenService("secret");

    // Application Services
    const sessionService = new SessionService(sessionRepo);

    // Domain/Application Facade
    return new AuthFacade(userRepo, tokenService, sessionService);
  }
}
