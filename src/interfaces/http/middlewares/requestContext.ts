import { randomUUID } from "node:crypto";

export async function requestContext(req: any, rep: any) {
  const traceId = randomUUID();

  req.traceId = traceId;

  rep.header("x-trace-id", traceId);

  req.startedAt = Date.now();
}
