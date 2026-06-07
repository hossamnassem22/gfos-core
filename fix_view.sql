CREATE OR REPLACE VIEW view_overdue_report AS
SELECT 
    s.id AS installment_id,
    s.due_date,
    s.total_payment_cents,
    d.user_id,
    e.created_at AS event_recorded_at
FROM amortization_schedule s
JOIN debt_agreements d ON s.debt_id = d.id
JOIN financial_events e ON (
    (e.payload::text::jsonb)->>'installmentId'
)::uuid = s.id
WHERE s.status = 'OVERDUE' 
AND e.event_type = 'InstallmentOverdue';
