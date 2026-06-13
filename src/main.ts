import Fastify from "npm:fastify";

const PORT = Number(Deno.env.get("PORT") ?? 3011);
const ENV = Deno.env.get("ENV") ?? "dev";

const app = Fastify({
  logger: true,
});

// Health Check
app.get("/health", async () => {
  return {
    status: "ok",
    service: "gfos-core",
    env: ENV,
    timestamp: new Date().toISOString(),
  };
});

// Route Loader
async function registerRoutes() {
  try {
    const auth = await import("./routes/auth.ts");
    if (auth?.authRoutes) {
      await app.register(auth.authRoutes);
    }
  } catch (err) {
    app.log.warn(err, "auth routes not loaded");
  }

  try {
    const dashboard = await import("./routes/dashboard.ts");
    if (dashboard?.dashboardRoutes) {
      await app.register(dashboard.dashboardRoutes);
    }
  } catch (err) {
    app.log.warn(err, "dashboard routes not loaded");
  }
}

// Bootstrap
async function start() {
  console.log("=====================================");
  console.log("🚀 Starting GFOS Core");
  console.log(`📦 Version: 1.0.0`);
  console.log(`🌍 Environment: ${ENV}`);
  console.log("=====================================");

  await registerRoutes();

  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });

    console.log("=====================================");
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log("=====================================");
  } catch (err) {
    app.log.error(err);
    Deno.exit(1);
  }
}

start();
