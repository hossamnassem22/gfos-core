CREATE OR REPLACE VIEW dashboard_installments AS
SELECT 
    s.id AS installment_id,
    d.user_id,
    d.currency,
    s.due_date,
    s.total_payment_cents,
    s.status,
    (s.due_date - CURRENT_DATE) AS days_remaining,
    CASE 
        WHEN s.status = 'PAID' THEN 'green'
        WHEN s.due_date < CURRENT_DATE THEN 'red'
        WHEN s.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'yellow'
        ELSE 'green'
    END AS color_code
FROM amortization_schedule s
JOIN debt_agreements d ON s.debt_id = d.id;
