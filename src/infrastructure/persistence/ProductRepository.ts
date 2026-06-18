import { sql } from "../../database/connection.ts";

export interface Product {
  id?: string;
  merchant_id: string;
  title: string;
  price: number;
  stock: number;
}

export class ProductRepository {
  async add(product: Product): Promise<string> {
    const [row] = await sql`
      INSERT INTO products (merchant_id, title, price, stock)
      VALUES (${product.merchant_id}, ${product.title}, ${product.price}, ${product.stock})
      RETURNING id
    `;
    return row.id;
  }

  async listByMerchant(merchantId: string): Promise<Product[]> {
    const rows = await sql`SELECT * FROM products WHERE merchant_id = ${merchantId} AND is_active = true`;
    return rows.map(r => ({
      id: r.id,
      merchant_id: r.merchant_id,
      title: r.title,
      price: parseFloat(r.price),
      stock: r.stock
    }));
  }
}
