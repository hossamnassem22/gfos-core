import { JwtService } from "../../../infrastructure/security/JwtService.ts";

export async function authMiddleware(req: any, rep: any) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return rep.code(401).send({ error: "NO_TOKEN" });
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = JwtService.verify(token);

    req.user = payload;
  } catch (_err) {
    return rep.code(401).send({ error: "INVALID_TOKEN" });
  }
}
