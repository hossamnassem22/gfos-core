-- تحديث سجل التوثيق لربطه بمعرفات بوابات الدفع
ALTER TABLE ledger_entries 
ADD COLUMN IF NOT EXISTS gateway_provider TEXT,
ADD COLUMN IF NOT EXISTS gateway_tx_id TEXT;
