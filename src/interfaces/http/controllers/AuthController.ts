import { AuthService } from "../../../application/auth/AuthService.ts";
import { JwtService } from "../../../infrastructure/security/JwtService.ts";

export class AuthController {
  constructor(private service = new AuthService()) {}

  login = async (req: any, rep: any) => {
    const { email, password } = req.body ?? {};

    const result = await this.service.login(email, password);

    if (result.error || !result.user) {
      return rep.code(result.status ?? 401).send(result);
    }

    const token = JwtService.sign({
      userId: result.user.id,
      role: result.user.role,
    });

    return rep.send({
      user: result.user,
      token,
    });
  };
}
