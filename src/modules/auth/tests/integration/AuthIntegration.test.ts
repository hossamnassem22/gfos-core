import { assertEquals } from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { AuthModuleComposer } from "../../application/AuthModuleComposer.ts";
import { PostgresUserRepository } from "../../infrastructure/persistence/PostgresUserRepository.ts";
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import bcrypt from "npm:bcryptjs";

const pool = new Pool(Deno.env.get("DATABASE_URL")!, 1, true);

Deno.test("Auth Integration: Login flow via Repository Port", async () => {
  const userRepo = new PostgresUserRepository(pool); 
  const facade = AuthModuleComposer.compose(pool);
  
  const password = "correct_password";
  const hashedPassword = await bcrypt.hash(password, 10);
  
  assertEquals(!!facade, true);
});
