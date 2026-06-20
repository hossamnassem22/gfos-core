import app from "../../main.ts";

export async function startServer() {
  const PORT = 3011;

  // ensure server is listening before tests
  await new Promise((resolve) => setTimeout(resolve, 800));

  return { baseUrl: `http://localhost:${PORT}` };
}
