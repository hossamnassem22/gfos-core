import { Session } from "../../domain/auth/Session.ts";

export interface SessionRepositoryPort {
  create(session: Session): Promise<void>;
  findByToken(token: string): Promise<Session | null>;
  revoke(token: string): Promise<void>;
}
