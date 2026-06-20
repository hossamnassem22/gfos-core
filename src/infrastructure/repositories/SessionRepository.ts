import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

export class SessionRepository {
  constructor(private pool: Pool) {} // تأكد أن الـ Constructor يقبل الـ Pool الآن
  // ... باقي الكود
}
