CREATE OR REPLACE FUNCTION post_ledger_entries_with_conversion(
  p_journal_entry_id UUID,
  p_tenant_id UUID,
  p_transaction_currency VARCHAR(3),
  p_base_currency VARCHAR(3)
)
RETURNS void AS $$
DECLARE
  line_record RECORD;
  v_exchange_rate NUMERIC(18, 8);
  v_base_amount BIGINT;
  v_transaction_amount BIGINT;
BEGIN

  -- 1. Get exchange rate (strict validation)
  SELECT rate
  INTO v_exchange_rate
  FROM currency_exchange_rates
  WHERE from_currency = p_transaction_currency
    AND to_currency = p_base_currency
    AND rate_date = CURRENT_DATE
    AND tenant_id = p_tenant_id
    AND is_active = true
  LIMIT 1;

  IF v_exchange_rate IS NULL THEN
    RAISE EXCEPTION 
      'Missing exchange rate: % → %',
      p_transaction_currency, p_base_currency;
  END IF;

  -- 2. Iterate journal lines
  FOR line_record IN
    SELECT *
    FROM journal_entry_lines
    WHERE journal_entry_id = p_journal_entry_id
      AND tenant_id = p_tenant_id
  LOOP

    -- 3. Preserve accounting direction
    v_transaction_amount :=
      COALESCE(line_record.debit_amount_minor_units, 0)
      - COALESCE(line_record.credit_amount_minor_units, 0);

    -- 4. Convert to base currency (safe multiplication)
    v_base_amount := FLOOR(v_transaction_amount * v_exchange_rate);

    -- 5. Insert ledger entry
    INSERT INTO ledger_entries (
      tenant_id,
      gl_account_id,
      account_code,
      account_name,

      debit_amount_minor_units,
      credit_amount_minor_units,

      currency_code,
      transaction_currency_code,
      base_currency_code,

      exchange_rate,
      base_currency_amount_minor_units,

      journal_entry_id,
      created_at
    )
    VALUES (
      p_tenant_id,
      line_record.gl_account_id,
      line_record.account_code,
      line_record.account_name,

      CASE WHEN v_transaction_amount > 0 THEN v_transaction_amount ELSE 0 END,
      CASE WHEN v_transaction_amount < 0 THEN ABS(v_transaction_amount) ELSE 0 END,

      p_transaction_currency,
      p_transaction_currency,
      p_base_currency,

      v_exchange_rate,
      v_base_amount,

      p_journal_entry_id,
      NOW()
    );

  END LOOP;

END;
$$ LANGUAGE plpgsql;
