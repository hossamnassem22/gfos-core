CREATE OR REPLACE VIEW customer_portfolio_summary AS
SELECT
    c.id                                    AS customer_id,
    c.name,
    c.phone,

    COUNT(DISTINCT d.id)                    AS debt_count,

    COALESCE(SUM(
        CASE
            WHEN s.status IN ('PENDING','OVERDUE')
            THEN s.remaining_balance_cents
            ELSE 0
        END
    ),0)                                    AS remaining_balance_cents,

    COALESCE(SUM(
        CASE
            WHEN s.status = 'OVERDUE'
            THEN s.total_payment_cents
            ELSE 0
        END
    ),0)                                    AS overdue_amount_cents,

    COUNT(
        CASE
            WHEN s.status = 'OVERDUE'
            THEN 1
        END
    )                                       AS overdue_installments

FROM customers c
LEFT JOIN debt_agreements d
       ON d.customer_id = c.id
LEFT JOIN amortization_schedule s
       ON s.debt_id = d.id

GROUP BY
    c.id,
    c.name,
    c.phone;
