CREATE TABLE IF NOT EXISTS salesmen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id),
    name TEXT NOT NULL,
    commission_rate DECIMAL(5, 2) DEFAULT 0.05 -- مثلاً 5%
);

-- تعديل جدول الطلبات ليرتبط بالمندوب
ALTER TABLE orders ADD COLUMN IF NOT EXISTS salesman_id UUID REFERENCES salesmen(id);
