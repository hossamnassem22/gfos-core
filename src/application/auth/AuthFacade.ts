import { LoginUseCase } from "./usecases/login.ts";
import { RefreshUseCase } from "./usecases/refresh.ts";

export class AuthFacade {
  constructor(
    private loginUC = new LoginUseCase(),
    private refreshUC = new RefreshUseCase({} as any)
  ) {}

  login(email: string, password: string) {
    return this.loginUC.execute(email, password);
  }

  refresh(token: string) {
    return this.refreshUC.execute(token);
  }
}
