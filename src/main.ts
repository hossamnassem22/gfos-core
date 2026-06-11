import { buildServer } from "./interface/http/server.ts";

const start = async () => {
  const app = await buildServer();
  await app.listen({ port: 3000, host: "0.0.0.0" });
};

start();
