// =============================================================
// GFOS Marketplace Routes — Merchants, Products, Orders, Reviews
// Multi-tenant marketplace API
// =============================================================

import { sql } from "../../../infrastructure/database/connection.ts";

const jsonHeaders = {
  "content-type": "application/json",
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "Authorization, Content-Type",
};

const json = (data: unknown, init?: ResponseInit) =>
  Response.json(data, { ...init, headers: { ...jsonHeaders, ...init?.headers } });

// =============================================================
// AUTH HELPER
// =============================================================
async function verifyToken(req: Request): Promise<{ userId: string; role: string; tenantId: string } | null> {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace("Bearer ", "");
  if (!token) return null;
  try {
    const parts = token.split(".");
    const payload = parts.length > 1 ? parts[1] : parts[0];
    const decoded = JSON.parse(atob(payload));
    return {
      userId: String(decoded.sub ?? decoded.userId ?? "1"),
      role: String(decoded.role ?? "MERCHANT"),
      tenantId: String(decoded.tenantId ?? decoded.sub ?? "1"),
    };
  } catch {
    return null;
  }
}

// =============================================================
// MERCHANT ROUTES
// =============================================================

// POST /api/merchants/register — تسجيل تاجر جديد
export async function registerMerchant(req: Request): Promise<Response> {
  const body = await req.json();
  const {
    name, nameAr, phone, email, password,
    businessType, category, description,
    address, city, governorate, latitude, longitude,
  } = body;

  if (!name || !phone || !password) {
    return json({ error: "الاسم، الهاتف، وكلمة المرور مطلوبة" }, { status: 400 });
  }

  // Generate a simple password hash (use bcrypt in production)
  const passwordHash = btoa(password + "_gfos_salt");

  try {
    const [row] = await sql`
      INSERT INTO merchants (
        tenant_id, name, name_ar, phone, email, password_hash,
        business_type, category, description,
        address, city, governorate, latitude, longitude,
        status
      )
      VALUES (
        gen_random_uuid(), ${name}, ${nameAr ?? null}, ${phone}, ${email ?? null}, ${passwordHash},
        ${businessType ?? "retailer"}, ${category ?? null}, ${description ?? null},
        ${address ?? null}, ${city ?? null}, ${governorate ?? null},
        ${latitude ?? null}, ${longitude ?? null},
        'PENDING'
      )
      RETURNING id, name, phone, status, plan, created_at
    `;
    return json({ merchant: row, message: "تم التسجيل بنجاح — في انتظار التفعيل" }, { status: 201 });
  } catch (err) {
    if (String(err).includes("unique")) {
      return json({ error: "رقم الهاتف مسجل مسبقاً" }, { status: 409 });
    }
    return json({ error: "فشل التسجيل", detail: String(err) }, { status: 500 });
  }
}

// POST /api/merchants/login — دخول التاجر
export async function loginMerchant(req: Request): Promise<Response> {
  const { phone, password } = await req.json();
  const passwordHash = btoa(password + "_gfos_salt");

  const [merchant] = await sql`
    SELECT id, name, phone, status, plan, tenant_id
    FROM merchants
    WHERE phone = ${phone} AND password_hash = ${passwordHash}
    LIMIT 1
  `;

  if (!merchant) return json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
  if (merchant.status !== "ACTIVE") {
    return json({ error: `الحساب ${merchant.status === "PENDING" ? "في انتظار التفعيل" : "موقوف"}` }, { status: 403 });
  }

  const payload = btoa(JSON.stringify({
    sub: merchant.id,
    role: "MERCHANT",
    tenantId: merchant.tenant_id,
  }));
  const token = `m.${payload}.sig`;

  return json({
    token,
    merchant: { id: merchant.id, name: merchant.name, plan: merchant.plan },
  });
}

// GET /api/merchants/me — بيانات التاجر الحالي
export async function getMyMerchant(req: Request): Promise<Response> {
  const auth = await verifyToken(req);
  if (!auth) return json({ error: "غير مصرح" }, { status: 401 });

  const [merchant] = await sql`
    SELECT id, name, name_ar, phone, email, business_type, category,
           description, logo_url, address, city, governorate,
           latitude, longitude, status, plan, trust_score,
           total_orders, verified, created_at
    FROM merchants WHERE id = ${auth.userId} LIMIT 1
  `;
  if (!merchant) return json({ error: "التاجر غير موجود" }, { status: 404 });
  return json(merchant);
}

// PUT /api/merchants/me — تحديث بيانات التاجر
export async function updateMyMerchant(req: Request): Promise<Response> {
  const auth = await verifyToken(req);
  if (!auth) return json({ error: "غير مصرح" }, { status: 401 });

  const body = await req.json();
  const fields = [
    "name", "name_ar", "email", "business_type", "category", "description",
    "logo_url", "address", "city", "governorate", "latitude", "longitude",
  ];

  const updates: string[] = [];
  const values: any[] = [];
  let i = 1;
  for (const f of fields) {
    if (body[f] !== undefined) {
      updates.push(`${f} = $${i}`);
      values.push(body[f]);
      i++;
    }
  }
  if (!updates.length) return json({ error: "لا توجد حقول للتحديث" }, { status: 400 });

  values.push(auth.userId);
  const query = `UPDATE merchants SET ${updates.join(", ")} WHERE id = $${i} RETURNING *`;
  const [row] = await sql.unsafe(query, values);
  return json(row);
}

// =============================================================
// CATEGORY ROUTES
// =============================================================

// GET /api/categories — قائمة التصنيفات
export async function listCategories(_req: Request): Promise<Response> {
  const rows = await sql`
    SELECT id, name, name_ar, slug, icon, parent_id, sort_order
    FROM categories WHERE is_active = true
    ORDER BY sort_order ASC, name_ar ASC
  `;
  return json(rows);
}

// =============================================================
// PRODUCT ROUTES
// =============================================================

// GET /api/products — قائمة المنتجات (مع فلترة)
export async function listProducts(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const search = url.searchParams.get("q") || "";
  const categoryId = url.searchParams.get("category_id");
  const merchantId = url.searchParams.get("merchant_id");
  const minPrice = url.searchParams.get("min_price");
  const maxPrice = url.searchParams.get("max_price");
  const city = url.searchParams.get("city");
  const featured = url.searchParams.get("featured");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");
  const sort = url.searchParams.get("sort") ?? "newest"; // newest, price_asc, price_desc, popular, rating

  // Build dynamic WHERE
  const conditions: string[] = ["p.is_active = true"];
  const params: any[] = [];
  let i = 1;

  if (search) {
    conditions.push(`(p.title ILIKE $${i} OR p.title_ar ILIKE $${i} OR p.description_ar ILIKE $${i})`);
    params.push(`%${search}%`);
    i++;
  }
  if (categoryId) {
    conditions.push(`p.category_id = $${i}`);
    params.push(categoryId);
    i++;
  }
  if (merchantId) {
    conditions.push(`p.merchant_id = $${i}`);
    params.push(merchantId);
    i++;
  }
  if (minPrice) {
    conditions.push(`p.price >= $${i}`);
    params.push(parseFloat(minPrice));
    i++;
  }
  if (maxPrice) {
    conditions.push(`p.price <= $${i}`);
    params.push(parseFloat(maxPrice));
    i++;
  }
  if (city) {
    conditions.push(`m.city = $${i}`);
    params.push(city);
    i++;
  }
  if (featured === "true") {
    conditions.push(`p.is_featured = true`);
  }

  const orderBy: Record<string, string> = {
    newest: "p.created_at DESC",
    price_asc: "p.price ASC",
    price_desc: "p.price DESC",
    popular: "p.sold_count DESC",
    rating: "p.rating_avg DESC",
  };

  const where = conditions.join(" AND ");
  const order = orderBy[sort] ?? orderBy.newest;

  params.push(limit, offset);
  const query = `
    SELECT
      p.id, p.title, p.title_ar, p.description_ar, p.brand,
      p.price, p.compare_at_price, p.currency,
      p.stock, p.image_url, p.images, p.tags,
      p.is_featured, p.sold_count, p.views_count,
      p.rating_avg, p.rating_count,
      p.merchant_id, m.name AS merchant_name, m.city AS merchant_city,
      m.trust_score AS merchant_trust, m.verified AS merchant_verified,
      c.id AS category_id, c.name_ar AS category_name, c.icon AS category_icon
    FROM products p
    JOIN merchants m ON m.id = p.merchant_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE ${where} AND m.status = 'ACTIVE'
    ORDER BY ${order}
    LIMIT $${i} OFFSET $${i + 1}
  `;

  const rows = await sql.unsafe(query, params);
  return json({ products: rows, count: rows.length, limit, offset });
}

// GET /api/products/:id — تفاصيل منتج
export async function getProduct(req: Request, productId: string): Promise<Response> {
  // Increment views
  await sql`UPDATE products SET views_count = views_count + 1 WHERE id = ${productId}`;

  const [product] = await sql`
    SELECT
      p.*,
      m.name AS merchant_name, m.phone AS merchant_phone, m.city AS merchant_city,
      m.trust_score AS merchant_trust, m.verified AS merchant_verified,
      m.logo_url AS merchant_logo,
      c.name_ar AS category_name, c.icon AS category_icon
    FROM products p
    JOIN merchants m ON m.id = p.merchant_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.id = ${productId} AND p.is_active = true
    LIMIT 1
  `;

  if (!product) return json({ error: "المنتج غير موجود" }, { status: 404 });

  // Recent reviews
  const reviews = await sql`
    SELECT id, customer_name, rating, title, comment, is_verified, merchant_reply, created_at
    FROM reviews
    WHERE product_id = ${productId} AND is_approved = true
    ORDER BY created_at DESC LIMIT 10
  `;

  return json({ ...product, reviews });
}

// POST /api/products — إضافة منتج جديد
export async function createProduct(req: Request): Promise<Response> {
  const auth = await verifyToken(req);
  if (!auth || auth.role !== "MERCHANT") {
    return json({ error: "يجب تسجيل الدخول كتاجر" }, { status: 401 });
  }

  const body = await req.json();
  const {
    categoryId, sku, title, titleAr, description, descriptionAr, brand,
    price, cost, compareAtPrice, currency,
    stock, lowStockThreshold, imageUrl, images, tags,
    weightKg, dimensions, isFeatured,
  } = body;

  if (!title || price == null) {
    return json({ error: "العنوان والسعر مطلوبان" }, { status: 400 });
  }

  // Get merchant tenant_id
  const [merchant] = await sql`SELECT tenant_id FROM merchants WHERE id = ${auth.userId}`;
  if (!merchant) return json({ error: "التاجر غير موجود" }, { status: 404 });

  try {
    const [row] = await sql`
      INSERT INTO products (
        tenant_id, merchant_id, category_id, sku,
        title, title_ar, description, description_ar, brand,
        price, cost, compare_at_price, currency,
        stock, low_stock_threshold, image_url, images, tags,
        weight_kg, dimensions, is_featured
      )
      VALUES (
        ${merchant.tenant_id}, ${auth.userId}, ${categoryId ?? null}, ${sku ?? null},
        ${title}, ${titleAr ?? null}, ${description ?? null}, ${descriptionAr ?? null}, ${brand ?? null},
        ${price}, ${cost ?? null}, ${compareAtPrice ?? null}, ${currency ?? "EGP"},
        ${stock ?? 0}, ${lowStockThreshold ?? 5}, ${imageUrl ?? null},
        ${images ?? null}, ${tags ?? null},
        ${weightKg ?? null}, ${dimensions ?? null}, ${isFeatured ?? false}
      )
      RETURNING *
    `;
    return json(row, { status: 201 });
  } catch (err) {
    return json({ error: "فشل إنشاء المنتج", detail: String(err) }, { status: 500 });
  }
}

// PUT /api/products/:id — تحديث منتج
export async function updateProduct(req: Request, productId: string): Promise<Response> {
  const auth = await verifyToken(req);
  if (!auth) return json({ error: "غير مصرح" }, { status: 401 });

  // Verify ownership
  const [product] = await sql`SELECT merchant_id FROM products WHERE id = ${productId}`;
  if (!product) return json({ error: "المنتج غير موجود" }, { status: 404 });
  if (product.merchant_id !== auth.userId && auth.role !== "ADMIN") {
    return json({ error: "ليس لديك صلاحية" }, { status: 403 });
  }

  const body = await req.json();
  const fieldMap: Record<string, string> = {
    categoryId: "category_id", sku: "sku",
    title: "title", titleAr: "title_ar",
    description: "description", descriptionAr: "description_ar", brand: "brand",
    price: "price", cost: "cost", compareAtPrice: "compare_at_price", currency: "currency",
    stock: "stock", lowStockThreshold: "low_stock_threshold",
    imageUrl: "image_url", images: "images", tags: "tags",
    weightKg: "weight_kg", dimensions: "dimensions",
    isActive: "is_active", isFeatured: "is_featured",
  };

  const updates: string[] = [];
  const values: any[] = [];
  let i = 1;
  for (const [k, v] of Object.entries(body)) {
    const col = fieldMap[k];
    if (col) {
      updates.push(`${col} = $${i}`);
      values.push(v);
      i++;
    }
  }
  if (!updates.length) return json({ error: "لا توجد حقول للتحديث" }, { status: 400 });

  values.push(productId);
  const query = `UPDATE products SET ${updates.join(", ")} WHERE id = $${i} RETURNING *`;
  const [row] = await sql.unsafe(query, values);
  return json(row);
}

// DELETE /api/products/:id — حذف منتج (soft delete)
export async function deleteProduct(req: Request, productId: string): Promise<Response> {
  const auth = await verifyToken(req);
  if (!auth) return json({ error: "غير مصرح" }, { status: 401 });

  const [product] = await sql`SELECT merchant_id FROM products WHERE id = ${productId}`;
  if (!product) return json({ error: "المنتج غير موجود" }, { status: 404 });
  if (product.merchant_id !== auth.userId && auth.role !== "ADMIN") {
    return json({ error: "ليس لديك صلاحية" }, { status: 403 });
  }

  await sql`UPDATE products SET is_active = false WHERE id = ${productId}`;
  return json({ ok: true, message: "تم حذف المنتج" });
}

// GET /api/merchants/me/products — منتجات التاجر الحالي
export async function getMyProducts(req: Request): Promise<Response> {
  const auth = await verifyToken(req);
  if (!auth) return json({ error: "غير مصرح" }, { status: 401 });

  const url = new URL(req.url);
  const includeInactive = url.searchParams.get("all") === "true";

  const rows = await sql`
    SELECT id, title, title_ar, price, compare_at_price, stock, image_url,
           is_active, is_featured, sold_count, views_count,
           rating_avg, rating_count, created_at
    FROM products
    WHERE merchant_id = ${auth.userId}
      ${includeInactive ? sql`` : sql`AND is_active = true`}
    ORDER BY created_at DESC
  `;
  return json(rows);
}

// =============================================================
// ORDER ROUTES
// =============================================================

// POST /api/orders — إنشاء طلب جديد
export async function createOrder(req: Request): Promise<Response> {
  const body = await req.json();
  const {
    merchantId, customerName, customerPhone, customerAddress,
    items, notes, paymentMethod,
  } = body;

  if (!merchantId || !customerPhone || !items?.length) {
    return json({ error: "بيانات الطلب غير مكتملة" }, { status: 400 });
  }

  // Get merchant tenant_id
  const [merchant] = await sql`SELECT id, tenant_id, name FROM merchants WHERE id = ${merchantId}`;
  if (!merchant) return json({ error: "التاجر غير موجود" }, { status: 404 });

  // Get or create customer
  let customerId: string;
  const [existing] = await sql`SELECT id FROM customers WHERE phone = ${customerPhone} AND tenant_id = ${merchant.tenant_id}`;
  if (existing) {
    customerId = existing.id;
  } else {
    const [created] = await sql`
      INSERT INTO customers (tenant_id, phone, name)
      VALUES (${merchant.tenant_id}, ${customerPhone}, ${customerName ?? null})
      RETURNING id
    `;
    customerId = created.id;
  }

  // Calculate totals + verify stock
  let subtotal = 0;
  const orderItems: Array<{ productId: string; title: string; quantity: number; price: number; total: number }> = [];

  for (const item of items) {
    const [product] = await sql`
      SELECT id, title, price, stock, is_active
      FROM products WHERE id = ${item.productId} AND merchant_id = ${merchantId}
    `;
    if (!product) return json({ error: `المنتج غير موجود: ${item.productId}` }, { status: 404 });
    if (!product.is_active) return json({ error: `المنتج غير متاح: ${product.title}` }, { status: 400 });
    if (product.stock < item.quantity) {
      return json({ error: `المخزون غير كافٍ: ${product.title}` }, { status: 400 });
    }

    const itemTotal = parseFloat(product.price) * item.quantity;
    subtotal += itemTotal;
    orderItems.push({
      productId: product.id,
      title: product.title,
      quantity: item.quantity,
      price: parseFloat(product.price),
      total: itemTotal,
    });
  }

  const totalAmount = subtotal;

  // Create order in transaction
  const result = await sql.begin(async (tx) => {
    const [order] = await tx`
      INSERT INTO orders (
        tenant_id, merchant_id, customer_id, customer_name, customer_phone, customer_address,
        subtotal, total_amount, currency, status, payment_method, notes
      )
      VALUES (
        ${merchant.tenant_id}, ${merchantId}, ${customerId}, ${customerName ?? null},
        ${customerPhone}, ${customerAddress ?? null},
        ${subtotal}, ${totalAmount}, 'EGP', 'PENDING', ${paymentMethod ?? "CASH_ON_DELIVERY"}, ${notes ?? null}
      )
      RETURNING *
    `;

    for (const item of orderItems) {
      await tx`
        INSERT INTO order_items (order_id, product_id, product_title, quantity, unit_price, total_price)
        VALUES (${order.id}, ${item.productId}, ${item.title}, ${item.quantity}, ${item.price}, ${item.total})
      `;
    }

    return order;
  });

  // Create notification for merchant
  await sql`
    INSERT INTO notifications (tenant_id, user_type, user_id, type, title, message, link, metadata)
    VALUES (
      ${merchant.tenant_id}, 'MERCHANT', ${merchantId},
      'NEW_ORDER', 'طلب جديد 🎉',
      ${`طلب جديد من ${customerName ?? customerPhone} بقيمة ${totalAmount} جنيه`},
      ${`/orders/${result.id}`},
      ${sql.json({ orderId: result.id, total: totalAmount })}
    )
  `;

  return json({ ...result, items: orderItems }, { status: 201 });
}

// GET /api/orders/:id — تفاصيل طلب
export async function getOrder(req: Request, orderId: string): Promise<Response> {
  const [order] = await sql`
    SELECT o.*, m.name AS merchant_name, m.phone AS merchant_phone
    FROM orders o
    JOIN merchants m ON m.id = o.merchant_id
    WHERE o.id = ${orderId}
    LIMIT 1
  `;
  if (!order) return json({ error: "الطلب غير موجود" }, { status: 404 });

  const items = await sql`SELECT * FROM order_items WHERE order_id = ${orderId}`;

  return json({ ...order, items });
}

// GET /api/merchants/me/orders — طلبات التاجر
export async function getMyOrders(req: Request): Promise<Response> {
  const auth = await verifyToken(req);
  if (!auth) return json({ error: "غير مصرح" }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 200);

  const rows = await sql`
    SELECT o.id, o.order_number, o.customer_name, o.customer_phone, o.customer_address,
           o.total_amount, o.currency, o.status, o.payment_method, o.payment_status,
           o.created_at, o.delivery_date, o.delivered_at,
           COUNT(oi.id) AS item_count
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.merchant_id = ${auth.userId}
      ${status ? sql`AND o.status = ${status}` : sql``}
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT ${limit}
  `;
  return json(rows);
}

// PUT /api/orders/:id/status — تحديث حالة الطلب
export async function updateOrderStatus(req: Request, orderId: string): Promise<Response> {
  const auth = await verifyToken(req);
  if (!auth) return json({ error: "غير مصرح" }, { status: 401 });

  const { status } = await req.json();
  const validStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    return json({ error: "حالة غير صالحة" }, { status: 400 });
  }

  // Verify ownership
  const [order] = await sql`SELECT merchant_id, status AS old_status FROM orders WHERE id = ${orderId}`;
  if (!order) return json({ error: "الطلب غير موجود" }, { status: 404 });
  if (order.merchant_id !== auth.userId && auth.role !== "ADMIN") {
    return json({ error: "ليس لديك صلاحية" }, { status: 403 });
  }

  const updates: any = { status };
  if (status === "DELIVERED") updates.delivered_at = new Date();
  if (status === "CANCELLED") updates.cancelled_at = new Date();

  // Update order
  let result;
  if (status === "DELIVERED") {
    [result] = await sql`
      UPDATE orders SET status = ${status}, delivered_at = NOW()
      WHERE id = ${orderId} RETURNING *
    `;
    // Deduct stock when confirmed
    if (order.old_status === "PENDING") {
      const items = await sql`SELECT product_id, quantity FROM order_items WHERE order_id = ${orderId}`;
      for (const item of items) {
        await sql`
          UPDATE products
          SET stock = GREATEST(0, stock - ${item.quantity}),
              sold_count = sold_count + ${item.quantity}
          WHERE id = ${item.product_id}
        `;
      }
    }
  } else if (status === "CANCELLED") {
    [result] = await sql`
      UPDATE orders SET status = ${status}, cancelled_at = NOW()
      WHERE id = ${orderId} RETURNING *
    `;
  } else {
    [result] = await sql`
      UPDATE orders SET status = ${status} WHERE id = ${orderId} RETURNING *
    `;
    // Deduct stock on first confirmation
    if (status === "CONFIRMED" && order.old_status === "PENDING") {
      const items = await sql`SELECT product_id, quantity FROM order_items WHERE order_id = ${orderId}`;
      for (const item of items) {
        await sql`
          UPDATE products
          SET stock = GREATEST(0, stock - ${item.quantity}),
              sold_count = sold_count + ${item.quantity}
          WHERE id = ${item.product_id}
        `;
      }
    }
  }

  // Increment merchant total orders when delivered
  if (status === "DELIVERED") {
    await sql`UPDATE merchants SET total_orders = total_orders + 1 WHERE id = ${order.merchant_id}`;
  }

  return json(result);
}

// =============================================================
// REVIEW ROUTES
// =============================================================

// POST /api/reviews — إضافة تقييم
export async function createReview(req: Request): Promise<Response> {
  const body = await req.json();
  const { orderId, productId, merchantId, customerName, rating, title, comment } = body;

  if (!rating || rating < 1 || rating > 5) {
    return json({ error: "التقييم يجب أن يكون بين 1 و 5" }, { status: 400 });
  }
  if (!customerName) {
    return json({ error: "الاسم مطلوب" }, { status: 400 });
  }

  // Determine tenant_id
  let tenantId: string | null = null;
  let isVerified = false;

  if (orderId) {
    const [order] = await sql`SELECT tenant_id, merchant_id, customer_phone FROM orders WHERE id = ${orderId}`;
    if (!order) return json({ error: "الطلب غير موجود" }, { status: 404 });
    tenantId = order.tenant_id;

    // Verify the customer actually ordered
    if (body.customerPhone && body.customerPhone === order.customer_phone) {
      isVerified = true;
    }
  }

  if (!tenantId) {
    return json({ error: "لا يمكن تحديد المنصة" }, { status: 400 });
  }

  const [row] = await sql`
    INSERT INTO reviews (
      tenant_id, order_id, product_id, merchant_id,
      customer_name, rating, title, comment, is_verified
    )
    VALUES (
      ${tenantId}, ${orderId ?? null}, ${productId ?? null}, ${merchantId ?? null},
      ${customerName}, ${rating}, ${title ?? null}, ${comment ?? null}, ${isVerified}
    )
    RETURNING *
  `;

  // Update product/merchant rating
  if (productId) {
    await sql`
      UPDATE products
      SET rating_avg = (SELECT AVG(rating)::decimal(3,2) FROM reviews WHERE product_id = ${productId} AND is_approved = true),
          rating_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ${productId} AND is_approved = true)
      WHERE id = ${productId}
    `;
  }
  if (merchantId) {
    await sql`
      UPDATE merchants
      SET trust_score = (SELECT AVG(rating)::decimal(3,2) FROM reviews WHERE merchant_id = ${merchantId} AND is_approved = true)
      WHERE id = ${merchantId}
    `;
  }

  return json(row, { status: 201 });
}

// POST /api/reviews/:id/reply — رد التاجر على تقييم
export async function replyToReview(req: Request, reviewId: string): Promise<Response> {
  const auth = await verifyToken(req);
  if (!auth) return json({ error: "غير مصرح" }, { status: 401 });

  const { reply } = await req.json();
  if (!reply) return json({ error: "الرد مطلوب" }, { status: 400 });

  const [review] = await sql`SELECT merchant_id FROM reviews WHERE id = ${reviewId}`;
  if (!review) return json({ error: "التقييم غير موجود" }, { status: 404 });
  if (review.merchant_id !== auth.userId && auth.role !== "ADMIN") {
    return json({ error: "ليس لديك صلاحية" }, { status: 403 });
  }

  await sql`
    UPDATE reviews SET merchant_reply = ${reply}, merchant_reply_at = NOW()
    WHERE id = ${reviewId}
  `;
  return json({ ok: true });
}

// =============================================================
// MERCHANT DASHBOARD
// =============================================================

// GET /api/merchants/me/dashboard — لوحة تحكم التاجر
export async function getMerchantDashboard(req: Request): Promise<Response> {
  const auth = await verifyToken(req);
  if (!auth) return json({ error: "غير مصرح" }, { status: 401 });

  // KPIs
  const [kpis] = await sql`
    SELECT
      COUNT(DISTINCT p.id) FILTER (WHERE p.is_active = true) AS active_products,
      COUNT(DISTINCT p.id) AS total_products,
      COUNT(DISTINCT p.id) FILTER (WHERE p.stock <= p.low_stock_threshold AND p.is_active = true) AS low_stock_count,
      COUNT(DISTINCT o.id) AS total_orders,
      COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'PENDING') AS pending_orders,
      COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'CONFIRMED') AS confirmed_orders,
      COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'SHIPPED') AS shipped_orders,
      COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'DELIVERED') AS delivered_orders,
      COALESCE(SUM(o.total_amount) FILTER (WHERE o.status = 'DELIVERED'), 0) AS total_revenue,
      COALESCE(SUM(o.total_amount) FILTER (WHERE o.created_at >= CURRENT_DATE - INTERVAL '7 days'), 0) AS revenue_7d,
      COALESCE(SUM(o.total_amount) FILTER (WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) AS revenue_30d,
      (SELECT AVG(rating)::decimal(3,2) FROM reviews WHERE merchant_id = ${auth.userId} AND is_approved = true) AS avg_rating,
      (SELECT COUNT(*) FROM reviews WHERE merchant_id = ${auth.userId} AND is_approved = true) AS review_count
    FROM merchants m
    LEFT JOIN products p ON p.merchant_id = m.id
    LEFT JOIN orders o ON o.merchant_id = m.id
    WHERE m.id = ${auth.userId}
    GROUP BY m.id
  `;

  // Top products (by sold_count)
  const topProducts = await sql`
    SELECT id, title, price, stock, sold_count, rating_avg, image_url
    FROM products
    WHERE merchant_id = ${auth.userId} AND is_active = true
    ORDER BY sold_count DESC LIMIT 5
  `;

  // Low stock alerts
  const lowStock = await sql`
    SELECT id, title, stock, low_stock_threshold
    FROM products
    WHERE merchant_id = ${auth.userId} AND is_active = true
      AND stock <= low_stock_threshold
    ORDER BY stock ASC LIMIT 10
  `;

  // Recent orders
  const recentOrders = await sql`
    SELECT id, order_number, customer_name, customer_phone,
           total_amount, status, created_at
    FROM orders
    WHERE merchant_id = ${auth.userId}
    ORDER BY created_at DESC LIMIT 10
  `;

  // Sales by day (last 7 days)
  const salesByDay = await sql`
    SELECT
      DATE(created_at) AS day,
      COUNT(*) AS orders,
      COALESCE(SUM(total_amount), 0) AS revenue
    FROM orders
    WHERE merchant_id = ${auth.userId}
      AND status = 'DELIVERED'
      AND created_at >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY DATE(created_at)
    ORDER BY day ASC
  `;

  // Unread notifications count
  const [{ unread }] = await sql`
    SELECT COUNT(*)::int AS unread FROM notifications
    WHERE user_type = 'MERCHANT' AND user_id = ${auth.userId} AND is_read = false
  `;

  return json({
    kpis,
    topProducts,
    lowStock,
    recentOrders,
    salesByDay,
    unreadNotifications: unread,
  });
}
