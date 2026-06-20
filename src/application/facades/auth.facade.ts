import { AuthService } from "../services/AuthService.ts";

/**
 * Facade layer:
 * يمنع HTTP layer من الوصول المباشر للخدمات الداخلية
 */
export class AuthFacade {
  private service = new AuthService();

  login(email: string, password: string) {
    return this.service.login(email, password);
  }
}
