export async function authGuard(req: any, rep: any) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return rep.code(401).send({ error: "MISSING_TOKEN" });
    }

    const token = header.replace("Bearer ", "");

    const payload = req.server.jwt.verify(token);

    req.user = payload;

  } catch {
    return rep.code(401).send({ error: "INVALID_TOKEN" });
  }
}
