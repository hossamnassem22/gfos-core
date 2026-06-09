-- 1. جدول الأحداث الخارجية (Transactional Outbox)
-- الحالة PENDING: الحدث لم يُرسل بعد
-- الحالة PROCESSING: الـ Dispatcher يقوم بمعالجته حالياً (يمنع التكرار)
-- الحالة SENT: تم الإرسال بنجاح
-- الحالة FAILED: حدث خطأ، سيُعاد المحاولة
-- الحالة DEAD: تجاوز الحد الأقصى للمحاولات (يتطلب تدخل يدوي)
CREATE TABLE outbox_events (
    event_id UUID PRIMARY KEY,
    aggregate_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'DEAD')),
    
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_retry_at TIMESTAMPTZ DEFAULT NOW(),
    processing_started_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    last_error TEXT
);

-- 2. جدول ضمان عدم التكرار (Idempotency Store)
CREATE TABLE processed_events (
    event_id UUID NOT NULL,
    subscriber_name TEXT NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (event_id, subscriber_name)
);

-- 3. الفهارس للتشغيل العالي (Operational Performance)
CREATE INDEX idx_outbox_operational 
ON outbox_events(status, next_retry_at) 
WHERE status IN ('PENDING', 'FAILED');
