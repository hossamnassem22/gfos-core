import { serveDir } from "jsr:@std/http/file-server";

Deno.serve({ port: 5173 }, (req) => {
  return serveDir(req, { fsRoot: "./frontend", quiet: true });
});
