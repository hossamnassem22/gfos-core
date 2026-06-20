import { TokenService } from "../../../core/TokenService.ts";
import { LoginUseCase } from "../../../application/auth/usecases/login.ts";

export default async function authRoutes(app: any) {
  const login = new LoginUseCase();
  const token = new TokenService(Deno.env.get("JWT_SECRET")!);

  app.post("/auth/login", async (req: any, rep: any) => {
    const { email, password } = req.body ?? {};

    const user = await login.execute(email, password);
    if (!user) return rep.code(401).send({ error: "INVALID_CREDENTIALS" });

    const accessToken = await token.signAccess(user);
    const refreshToken = await token.signRefresh(user);

    return rep.code(200).send({
      user,
      accessToken,
      refreshToken,
    });
  });
}
