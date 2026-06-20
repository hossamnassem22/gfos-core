import bcrypt from "npm:bcryptjs";
import { UserRepository } from "../../infrastructure/repositories/UserRepository.ts";

export class AuthService {
  private repo = new UserRepository();

  async validate(email: string, password: string) {
    if (!email || !password) return null;

    const user = await this.repo.findByEmail(email);
    if (!user) return null;

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
