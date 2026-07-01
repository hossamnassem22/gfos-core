import { queryObject } from "./client.ts";

export interface Customer {
  id?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

export async function createCustomer(c: Customer) {
  const res = await queryObject(
    `INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING id, name, email, phone, created_at`,
    [c.name, c.email ?? null, c.phone ?? null]
  );
  // @ts-ignore
  return res.rows[0];
}
