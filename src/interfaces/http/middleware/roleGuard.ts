export function roleGuard(roles: string[]) {
  return async (req: any, rep: any) => {
    const user = req.user;

    if (!user || !roles.includes(user.role)) {
      return rep.code(403).send({ error: "FORBIDDEN" });
    }
  };
}
