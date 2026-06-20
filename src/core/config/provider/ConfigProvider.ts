export class ConfigProvider {
  private config: Record<string, string> = {
    DB_URL: Deno.env.get("DB_URL") || "localhost:5432",
    PORT: Deno.env.get("PORT") || "8080",
    NODE_ENV: Deno.env.get("NODE_ENV") || "development"
  };

  get(key: string): string {
    return this.config[key];
  }
}
