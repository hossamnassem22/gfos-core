import { assertEquals } from "@std/assert";
import { UserRepository } from "./UserRepository.ts";

Deno.test("UserRepository: Should save and find a user", async () => {
  const repo = new UserRepository();
  const user = {
    id: "user_123",
    name: "Hossam",
    email: "hossam@example.com",
    createdAt: new Date(),
  };

  await repo.save(user);
  const found = await repo.findById("user_123");
  
  assertEquals(found?.email, "hossam@example.com");
  assertEquals(found?.name, "Hossam");
});
