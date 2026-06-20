import { FastifyInstance } from "npm:fastify";
import { AuthFacade } from "../../../application/facades/auth.facade.ts";

export default async function logoutRoutes(app: FastifyInstance) {

  app.post("/auth/logout", async (req: any, rep: any) => {
    const { refreshToken } = req.body ?? {};

    if (!refreshToken) {
      return rep.code(400).send({ error: "MISSING_REFRESH_TOKEN" });
    }

    await AuthFacade.revoke(refreshToken);

    return { success: true };
  });
}
