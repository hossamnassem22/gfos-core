import { TokenService } from "../../../core/TokenService.ts";

export default async function tokenRoutes(app: any) {
  const token = new TokenService(Deno.env.get("JWT_SECRET")!);

  app.post("/auth/refresh", async (req: any, rep: any) => {
    const { refreshToken } = req.body ?? {};

    if (!refreshToken) {
      return rep.code(400).send({ error: "MISSING_REFRESH_TOKEN" });
    }

    try {
      const payload: any = await token.verify(refreshToken);

      if (payload.type !== "refresh") {
        return rep.code(401).send({ error: "INVALID_TOKEN_TYPE" });
      }

      const newAccessToken = await token.signAccess({
        id: payload.userId,
        email: payload.email ?? "",
        role: payload.role ?? "USER",
      });

      return rep.code(200).send({ accessToken: newAccessToken });

    } catch {
      return rep.code(401).send({ error: "INVALID_REFRESH_TOKEN" });
    }
  });
}
