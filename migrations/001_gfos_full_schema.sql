-- =============================================================
-- GFOS Platform — Complete Database Schema
-- Multi-tenant marketplace + banking + trust system
-- =============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- 1. MERCHANTS (التجار)
-- =============================================================
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    name_ar TEXT,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    password_hash TEXT NOT NULL,
    business_type TEXT,                       -- manufacturer, wholesaler, retailer, shop
    category TEXT,                            -- electronics, food, clothing, etc.
    description TEXT,
    logo_url TEXT,
    address TEXT,
    city TEXT,
    governorate TEXT,                         -- المحافظة
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status TEXT DEFAULT 'PENDING',             -- PENDING, ACTIVE, SUSPENDED, REJECTED
    plan TEXT DEFAULT 'FREE',                 -- FREE, BASIC, PRO, ENTERPRISE
    trust_score DECIMAL(3, 2) DEFAULT 0.00,   -- 0.00 to 5.00
    total_orders INT DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchants_tenant ON merchants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(status);
CREATE INDEX IF NOT EXISTS idx_merchants_category ON merchants(category);
CREATE INDEX IF NOT EXISTS idx_merchants_city ON merchants(city);

-- =============================================================
-- 2. CUSTOMERS (المستهلكين / المواطنين)
-- =============================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    national_id TEXT,
    password_hash TEXT,
    address TEXT,
    city TEXT,
    governorate TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    trust_score DECIMAL(3, 2) DEFAULT 0.00,
    total_orders INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(phone, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- =============================================================
-- 3. CATEGORIES (تصنيفات المنتجات)
-- =============================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    slug TEXT NOT NULL,
    icon TEXT,
    parent_id UUID REFERENCES categories(id),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(slug, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id);

-- =============================================================
-- 4. PRODUCTS (المنتجات)
-- =============================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    sku TEXT,                                 -- Stock Keeping Unit
    title TEXT NOT NULL,
    title_ar TEXT,
    description TEXT,
    description_ar TEXT,
    brand TEXT,
    price DECIMAL(12, 2) NOT NULL,            -- السعر الأساسي
    cost DECIMAL(12, 2),                      -- التكلفة (للمحل)
    compare_at_price DECIMAL(12, 2),          -- للعرض كخصم
    currency TEXT DEFAULT 'EGP',
    stock INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    image_url TEXT,
    images TEXT[],                            -- مصفوفة صور إضافية
    tags TEXT[],
    weight_kg DECIMAL(8, 3),
    dimensions TEXT,                          -- "30x20x10 cm"
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    views_count INT DEFAULT 0,
    sold_count INT DEFAULT 0,
    rating_avg DECIMAL(3, 2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_merchant ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('arabic', coalesce(title_ar, '') || ' ' || coalesce(description_ar, '')));

-- =============================================================
-- 5. ORDERS (الطلبات)
-- =============================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    order_number TEXT UNIQUE NOT NULL,        -- ORD-2026-00001
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    customer_id UUID REFERENCES customers(id),
    customer_name TEXT,
    customer_phone TEXT NOT NULL,
    customer_address TEXT,
    subtotal DECIMAL(12, 2) NOT NULL,
    discount DECIMAL(12, 2) DEFAULT 0,
    shipping_fee DECIMAL(12, 2) DEFAULT 0,
    tax DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'EGP',
    status TEXT DEFAULT 'PENDING',            -- PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
    payment_method TEXT,                      -- CASH_ON_DELIVERY, BANK_TRANSFER, WALLET, EXTERNAL
    payment_status TEXT DEFAULT 'UNPAID',     -- UNPAID, PARTIAL, PAID, REFUNDED
    payment_reference TEXT,                   -- مرجع خارجي للدفع
    notes TEXT,
    delivery_date TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- =============================================================
-- 6. ORDER ITEMS (عناصر الطلب)
-- =============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_title TEXT NOT NULL,              -- snapshot
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- =============================================================
-- 7. REVIEWS (التقييمات)
-- =============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    merchant_id UUID REFERENCES merchants(id),
    customer_id UUID REFERENCES customers(id),
    customer_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    is_verified BOOLEAN DEFAULT false,         -- من عميل اشترى فعلاً
    is_approved BOOLEAN DEFAULT true,
    merchant_reply TEXT,
    merchant_reply_at TIMESTAMP WITH TIME ZONE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_merchant ON reviews(merchant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id);

-- =============================================================
-- 8. MESSAGES (الدردشة بين التجار والعملاء)
-- =============================================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    customer_id UUID REFERENCES customers(id),
    customer_name TEXT,
    customer_phone TEXT,
    subject TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unread_merchant_count INT DEFAULT 0,
    unread_customer_count INT DEFAULT 0,
    status TEXT DEFAULT 'OPEN',               -- OPEN, CLOSED, ARCHIVED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_merchant ON conversations(merchant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL,                -- MERCHANT, CUSTOMER, SYSTEM
    sender_id UUID,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'text',         -- text, image, file, order_card
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- =============================================================
-- 9. NOTIFICATIONS (الإشعارات)
-- =============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_type TEXT NOT NULL,                  -- MERCHANT, CUSTOMER, ADMIN
    user_id UUID,
    type TEXT NOT NULL,                       -- NEW_ORDER, PAYMENT_RECEIVED, NEW_REVIEW, LOW_STOCK, etc.
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    metadata JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_type, user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(is_read) WHERE is_read = false;

-- =============================================================
-- 10. CART (عربة التسوق)
-- =============================================================
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    customer_phone TEXT NOT NULL,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_phone, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_phone ON cart_items(customer_phone);

-- =============================================================
-- 11. TRUST SCORES HISTORY (سجل درجات الثقة)
-- =============================================================
CREATE TABLE IF NOT EXISTS trust_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    entity_type TEXT NOT NULL,                -- MERCHANT, CUSTOMER
    entity_id UUID NOT NULL,
    event_type TEXT NOT NULL,                 -- ORDER_COMPLETED, REVIEW_RECEIVED, COMPLAINT, etc.
    score_delta DECIMAL(3, 2) NOT NULL,
    new_score DECIMAL(3, 2),
    reference_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trust_events_entity ON trust_events(entity_type, entity_id);

-- =============================================================
-- 12. AUDIT LOG (سجل العمليات)
-- =============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    actor_type TEXT,                          -- MERCHANT, CUSTOMER, ADMIN, SYSTEM
    actor_id UUID,
    action TEXT NOT NULL,                     -- CREATE_PRODUCT, UPDATE_ORDER, etc.
    entity_type TEXT,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_type, actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- =============================================================
-- 13. FINANCIAL LAYER (الطبقة المالية — مستوحاة من Selfni Core)
-- =============================================================

-- Debt agreements (اتفاقيات الديون / التقسيط)
CREATE TABLE IF NOT EXISTS debt_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,                    -- merchant or platform user
    customer_id UUID REFERENCES customers(id),
    merchant_id UUID REFERENCES merchants(id),
    order_id UUID REFERENCES orders(id),
    principal_cents BIGINT NOT NULL,          -- المبلغ بالـ millimes (قرش/فلس)
    annual_rate_bps INT DEFAULT 0,            -- basis points (100 = 1%)
    term_months INT NOT NULL DEFAULT 1,
    amort_type TEXT DEFAULT 'DECLINING',      -- FLAT, DECLINING, BALLOON
    currency TEXT DEFAULT 'EGP',
    status TEXT DEFAULT 'ACTIVE',             -- ACTIVE, CLOSED, DEFAULTED, RESTRUCTURED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_debt_tenant ON debt_agreements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_debt_customer ON debt_agreements(customer_id);
CREATE INDEX IF NOT EXISTS idx_debt_status ON debt_agreements(status);

-- Amortization schedule (جدول الأقساط)
CREATE TABLE IF NOT EXISTS amortization_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debt_id UUID NOT NULL REFERENCES debt_agreements(id) ON DELETE CASCADE,
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    principal_cents BIGINT NOT NULL,
    interest_cents BIGINT NOT NULL,
    total_payment_cents BIGINT NOT NULL,
    remaining_balance_cents BIGINT NOT NULL,
    status TEXT DEFAULT 'PENDING',            -- PENDING, PAID, OVERDUE, PARTIAL
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_amort_debt ON amortization_schedule(debt_id);
CREATE INDEX IF NOT EXISTS idx_amort_due ON amortization_schedule(due_date);
CREATE INDEX IF NOT EXISTS idx_amort_status ON amortization_schedule(status);

-- Payments (المدفوعات)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    debt_id UUID REFERENCES debt_agreements(id),
    order_id UUID REFERENCES orders(id),
    amount_cents BIGINT NOT NULL,
    currency TEXT DEFAULT 'EGP',
    payment_method TEXT,                      -- CASH, BANK_TRANSFER, WALLET
    external_reference TEXT,
    penalties_paid BIGINT DEFAULT 0,
    interest_paid BIGINT DEFAULT 0,
    principal_paid BIGINT DEFAULT 0,
    remaining BIGINT DEFAULT 0,
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_debt ON payments(debt_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);

-- Financial events (أحداث مالية)
CREATE TABLE IF NOT EXISTS financial_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    event_type TEXT NOT NULL,                 -- INSTALLMENT_OVERDUE, PAYMENT_RECEIVED, etc.
    aggregate_type TEXT,                      -- DEBT, ORDER, INVOICE
    aggregate_id UUID,
    payload JSONB NOT NULL,
    idempotency_key TEXT UNIQUE,              -- للحماية من التكرار
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_aggregate ON financial_events(aggregate_type, aggregate_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON financial_events(event_type);

-- Journal entries (قيود اليومية المحاسبية)
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    transaction_id UUID,
    account_code TEXT NOT NULL,               -- 1100, 2100, etc.
    account_name TEXT,
    debit_cents BIGINT DEFAULT 0,
    credit_cents BIGINT DEFAULT 0,
    currency TEXT DEFAULT 'EGP',
    description TEXT,
    reference_type TEXT,
    reference_id UUID,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (debit_cents >= 0 AND credit_cents >= 0),
    CHECK (NOT (debit_cents > 0 AND credit_cents > 0))   -- قيد واحد إما مدين أو دائن
);

CREATE INDEX IF NOT EXISTS idx_journal_tenant ON journal_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_journal_account ON journal_entries(account_code);
CREATE INDEX IF NOT EXISTS idx_journal_posted ON journal_entries(posted_at DESC);

-- =============================================================
-- VIEWS (عروض جاهزة)
-- =============================================================

-- Portfolio health per tenant
CREATE OR REPLACE VIEW view_portfolio_health AS
SELECT
    d.tenant_id,
    COUNT(DISTINCT d.id) AS total_debts,
    COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'ACTIVE') AS active_debts,
    COALESCE(SUM(d.principal_cents), 0) AS total_principal_cents,
    COUNT(s.id) FILTER (WHERE s.status = 'OVERDUE') AS overdue_installments,
    COUNT(s.id) FILTER (WHERE s.status = 'PENDING') AS pending_installments,
    COUNT(s.id) FILTER (WHERE s.status = 'PAID') AS paid_installments,
    COALESCE(SUM(s.total_payment_cents) FILTER (WHERE s.status = 'OVERDUE'), 0) AS overdue_amount_cents
FROM debt_agreements d
LEFT JOIN amortization_schedule s ON s.debt_id = d.id
GROUP BY d.tenant_id;

-- Overdue report
CREATE OR REPLACE VIEW view_overdue_report AS
SELECT
    s.id,
    s.debt_id,
    s.installment_number,
    s.due_date,
    s.total_payment_cents,
    s.principal_cents,
    s.interest_cents,
    (CURRENT_DATE - s.due_date) AS days_late,
    d.tenant_id,
    d.customer_id,
    d.merchant_id,
    c.name AS customer_name,
    c.phone AS customer_phone,
    m.name AS merchant_name
FROM amortization_schedule s
JOIN debt_agreements d ON d.id = s.debt_id
LEFT JOIN customers c ON c.id = d.customer_id
LEFT JOIN merchants m ON m.id = d.merchant_id
WHERE s.status = 'OVERDUE'
ORDER BY s.due_date ASC;

-- Dashboard summary per merchant
CREATE OR REPLACE VIEW view_merchant_dashboard AS
SELECT
    m.id AS merchant_id,
    m.tenant_id,
    m.name AS merchant_name,
    COUNT(DISTINCT p.id) FILTER (WHERE p.is_active = true) AS active_products,
    COUNT(DISTINCT p.id) AS total_products,
    COUNT(DISTINCT o.id) AS total_orders,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'PENDING') AS pending_orders,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'DELIVERED') AS completed_orders,
    COALESCE(SUM(o.total_amount) FILTER (WHERE o.status = 'DELIVERED'), 0) AS total_revenue,
    COALESCE(AVG(r.rating), 0) AS avg_rating,
    COUNT(DISTINCT r.id) AS review_count
FROM merchants m
LEFT JOIN products p ON p.merchant_id = m.id
LEFT JOIN orders o ON o.merchant_id = m.id
LEFT JOIN reviews r ON r.merchant_id = m.id
GROUP BY m.id, m.tenant_id, m.name;

-- =============================================================
-- TRIGGERS
-- =============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT unnest(ARRAY['merchants', 'customers', 'products', 'orders', 'cart_items', 'debt_agreements'])
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS set_updated_at ON %I;
            CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION trigger_set_updated_at();
        ', t, t);
    END LOOP;
END $$;

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                            LPAD(nextval('order_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

DROP TRIGGER IF EXISTS trg_order_number ON orders;
CREATE TRIGGER trg_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_number();

-- Update product stock + sold_count on order
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'CONFIRMED' AND OLD.status = 'PENDING' THEN
        UPDATE products
        SET stock = stock - NEW.quantity,
            sold_count = sold_count + NEW.quantity
        WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================
-- SEED DATA (بيانات أولية للتجربة)
-- =============================================================

INSERT INTO categories (id, name, name_ar, slug, icon, sort_order) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Electronics', 'إلكترونيات', 'electronics', '📱', 1),
    ('22222222-2222-2222-2222-222222222222', 'Food & Beverages', 'أغذية ومشروبات', 'food', '🍔', 2),
    ('33333333-3333-3333-3333-333333333333', 'Clothing', 'ملابس', 'clothing', '👕', 3),
    ('44444444-4444-4444-4444-444444444444', 'Home & Kitchen', 'منزل ومطبخ', 'home', '🏠', 4),
    ('55555555-5555-5555-5555-555555555555', 'Beauty & Health', 'جمال وصحة', 'beauty', '💄', 5),
    ('66666666-6666-6666-6666-666666666666', 'Auto Parts', 'قطع غيار سيارات', 'auto', '🚗', 6),
    ('77777777-7777-7777-7777-777777777777', 'Building Materials', 'مواد بناء', 'building', '🏗️', 7),
    ('88888888-8888-8888-8888-888888888888', 'Office Supplies', 'لوازم مكتبية', 'office', '📎', 8)
ON CONFLICT DO NOTHING;

-- =============================================================
-- DONE
-- =============================================================
COMMENT ON SCHEMA public IS 'GFOS Platform — Multi-tenant marketplace + banking + trust system';
