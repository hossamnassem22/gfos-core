import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { getDashboardPage } from "./interfaces/web/controllers/dashboard.controller.ts";

const app = new Application();
const router = new Router();

router.get("/", async (context) => {
  context.response.headers.set("Content-Type", "text/html");
  context.response.body = await getDashboardPage();
});

app.use(router.routes());
console.log("GFOS Enterprise جاهز على http://localhost:8080");
await app.listen({ port: 8080 });
