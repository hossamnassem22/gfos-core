import { serve } from "@std/http";

serve((_req: Request) => {
  return new Response("OK");
});
