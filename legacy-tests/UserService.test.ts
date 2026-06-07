import { assertEquals, assertRejects } from "@std/assert";
import { UserService } from "./UserService.ts";
import { UserRepository } from "../../infrastructure/persistence/UserRepository.ts";

Deno.test("UserService: Should register a new user and prevent duplicates", async () => {
  const repo = new UserRepository();
  const service = new UserService(repo);
  
  // استخدام بريد إلكتروني فريد لهذا الاختبار لتجنب تداخل البيانات
  const email = `test_${Date.now()}@example.com`;

  // تسجيل مستخدم جديد
  const user = await service.register("u1", "Ahmed", email);
  assertEquals(user.name, "Ahmed");

  // محاولة تسجيل نفس البريد مرة أخرى (يجب أن يفشل)
  await assertRejects(async () => {
    await service.register("u2", "Ahmed Dupe", email);
  }, Error, "Email already registered.");
});
