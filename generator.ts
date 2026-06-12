import { sql } from "@infra/database/connection.ts";

async function generateCatalog(merchantId: string) {
  const products = await sql`SELECT title, price FROM products WHERE merchant_id = ${merchantId}`;
  
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: sans-serif; padding: 20px; direction: rtl; }
      .product { border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 8px; }
      .price { color: green; font-weight: bold; }
    </style>
  </head>
  <body>
    <h1>قائمة المنتجات</h1>
    ${products.map(p => `
      <div class="product">
        <h3>${p.title}</h3>
        <p class="price">السعر: ${p.price} ج.م</p>
      </div>
    `).join('')}
  </body>
  </html>`;

  await Deno.writeTextFile("catalog.html", html);
  console.log("✅ تم إنشاء ملف catalog.html بنجاح!");
}

const merchantId = Deno.args[0];
if (!merchantId) {
  console.log("الاستخدام: deno run --allow-all generator.ts <MERCHANT_ID>");
} else {
  await generateCatalog(merchantId);
}
