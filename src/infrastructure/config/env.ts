export function validateEnv() {
  const required = [
    "JWT_SECRET",
    "DB_URL",
    "ENV",
  ];

  for (const key of required) {
    if (!Deno.env.get(key)) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }

  return {
    env: Deno.env.get("ENV"),
    jwtSecret: Deno.env.get("JWT_SECRET"),
    dbUrl: Deno.env.get("DB_URL"),
  };
}
