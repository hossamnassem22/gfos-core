import { assertEquals } from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { AuthFacade } from "./AuthFacade.ts";
import bcrypt from "npm:bcryptjs";

Deno.test("AuthFacade.login - Should return tokens on valid credentials", async () => {
  const password = "correct_password";
  const hashedPassword = await bcrypt.hash(password, 10); // Hash حقيقي

  // محاكاة الـ Repository
  const mockRepo = {
    findByEmail: async () => ({
      id: 1,
      email: "test@example.com",
      password_hash: hashedPassword, // التخزين المشفر
      role: "user",
      createdAt: new Date(),
    }),
    save: async () => {},
  };

  const mockTokenService = {
    signAccess: async () => "access-token",
    signRefresh: async () => "refresh-token",
    verify: async () => ({}),
  };

  const mockSessionService = { create: async () => {}, find: async () => null, revoke: async () => {} };

  const facade = new AuthFacade(mockRepo as any, mockTokenService as any, mockSessionService as any);
  
  const result = await facade.login("test@example.com", password);
  
  assertEquals(result?.accessToken, "access-token");
});
