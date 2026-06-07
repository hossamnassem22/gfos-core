import Fastify from "npm:fastify";
import cors from "npm:@fastify/cors";
import { authRoutes } from "./routes/auth.ts";
import { productRoutes } from "./routes/products.ts";
import { orderRoutes } from "./routes/orders.ts";

const app = Fastify({ logger: false });
await app.register(cors);

// تسجيل الـ Middleware (التوثيق)
await app.register(authRoutes);

// تسجيل المسارات
await app.register(productRoutes);
await app.register(orderRoutes);

app.get("/health", () => ({ status: "ok", service: "beautyhub" }));

await app.listen({ port: 3012, host: "0.0.0.0" });
console.log("BeautyHub API running on port 3012");
