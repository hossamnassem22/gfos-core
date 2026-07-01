-- Seed data for dev
INSERT INTO customers (name, email, phone)
VALUES ('Demo Merchant', 'demo@merchant.local', '+201000000000')
ON CONFLICT DO NOTHING;
