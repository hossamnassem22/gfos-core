import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const BASE_URL = "http://localhost:3011";

async function post(path: string, body: any) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return { res, data };
}

Deno.test("AUTH - login success", async () => {
  const { res, data } = await post("/auth/login", {
    email: "test@selfni.com",
    password: "123456",
  });

  assertEquals(res.status, 200);

  if (!data.accessToken) throw new Error("Missing accessToken");
  if (!data.refreshToken) throw new Error("Missing refreshToken");
});

Deno.test("AUTH - login fail", async () => {
  const { res } = await post("/auth/login", {
    email: "wrong@user.com",
    password: "wrong",
  });

  assertEquals(res.status, 401);
});

Deno.test("AUTH - refresh token flow", async () => {
  const login = await post("/auth/login", {
    email: "test@selfni.com",
    password: "123456",
  });

  const refreshToken = login.data.refreshToken;

  const { res, data } = await post("/auth/refresh", {
    refreshToken,
  });

  assertEquals(res.status, 200);

  if (!data.accessToken) throw new Error("Missing accessToken");
});
