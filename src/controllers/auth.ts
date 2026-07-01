import { createJwt, verifyJwt } from "../auth/jwt.ts";

// Simple in-memory user store for bootstrap. Replace with DB-backed repo later.
const users = new Map();

export async function registerHandler(req: Request) {
  try {
    const body = await req.json();
    if (!body.username || !body.password) return new Response(JSON.stringify({ error: "username and password required" }), { status: 400, headers: { "content-type": "application/json" } });
    if (users.has(body.username)) return new Response(JSON.stringify({ error: "user exists" }), { status: 409, headers: { "content-type": "application/json" } });
    // NOTE: store password in plain text for bootstrap ONLY — replace with bcrypt in next iteration
    users.set(body.username, { username: body.username, password: body.password });
    return new Response(JSON.stringify({ username: body.username }), { status: 201, headers: { "content-type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "invalid json" }), { status: 400, headers: { "content-type": "application/json" } });
  }
}

export async function loginHandler(req: Request) {
  try {
    const body = await req.json();
    const user = users.get(body.username);
    if (!user || user.password !== body.password) return new Response(JSON.stringify({ error: "invalid credentials" }), { status: 401, headers: { "content-type": "application/json" } });
    const token = await createJwt({ sub: body.username });
    return new Response(JSON.stringify({ token }), { status: 200, headers: { "content-type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "invalid json" }), { status: 400, headers: { "content-type": "application/json" } });
  }
}
