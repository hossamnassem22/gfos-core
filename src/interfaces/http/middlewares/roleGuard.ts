export function roleGuard(allowedRoles: string[]) {
  return async (req: any, rep: any) => {

    const user = req.user;

    if (!user) {
      return rep.code(401).send({ error: "UNAUTHORIZED" });
    }

    if (!allowedRoles.includes(user.role)) {
      return rep.code(403).send({ error: "FORBIDDEN" });
    }
  };
}
