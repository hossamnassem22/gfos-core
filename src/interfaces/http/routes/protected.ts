import { FastifyInstance } from "npm:fastify";
import { authGuard } from "../middlewares/authGuard.ts";
import { roleGuard } from "../middlewares/roleGuard.ts";

export default async function protectedRoutes(app: FastifyInstance) {

  app.get(
    "/user/profile",
    { preHandler: [authGuard] },
    async (req: any) => {
      return {
        message: "User Access Granted",
        user: req.user
      };
    }
  );

  app.get(
    "/admin/dashboard",
    {
      preHandler: [authGuard, roleGuard(["ADMIN", "SUPERADMIN"])]
    },
    async (req: any) => {
      return {
        message: "Admin Access Granted",
        user: req.user
      };
    }
  );
}
