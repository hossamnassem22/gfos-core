import { ProductRepository } from "@infra/persistence/ProductRepository.ts";
import { OrderRepository } from "@infra/persistence/OrderRepository.ts";
import { sql } from "@infra/database/connection.ts";

const pRepo = new ProductRepository();
const oRepo = new OrderRepository();

async function run() {
  const [command, ...args] = Deno.args;

  try {
    switch (command) {
      case "add-product":
        const [m] = await sql`SELECT id FROM merchants WHERE id = ${args[0]}`;
        if (!m) {
          console.error("❌ خطأ: التاجر غير موجود! تأكد من الـ ID.");
          return;
        }
        await pRepo.add({ merchant_id: args[0], title: args[1], price: parseFloat(args[2]), stock: 10 });
        console.log(`✅ تم إضافة المنتج: ${args[1]}`);
        break;

      case "create-order":
        const id = await oRepo.create({
          merchantId: args[0],
          customerPhone: args[1],
          totalAmount: parseFloat(args[3]),
          items: [{ productId: args[2], quantity: 1, price: parseFloat(args[3]) }]
        });
        console.log(`✅ تم إنشاء الطلب. رقم العملية: ${id}`);
        break;

      default:
        console.log("الخيارات المتاحة: add-product, create-order");
    }
  } catch (e) {
    console.error("حدث خطأ:", e.message);
  } finally {
    await sql.end();
  }
}

run();
