CREATE OR REPLACE FUNCTION validate_entry_single_currency()
RETURNS TRIGGER AS $$
DECLARE
  v_entry_id UUID;
  v_currencies_in_entry INT;
BEGIN
  v_entry_id := NEW.journal_entry_id;

  SELECT COUNT(DISTINCT currency_code)
  INTO v_currencies_in_entry
  FROM journal_entry_lines
  WHERE journal_entry_id = v_entry_id;

  IF v_currencies_in_entry > 1 THEN
    RAISE EXCEPTION 
      'INVALID_JOURNAL_ENTRY: Multi-currency not allowed. Found % currencies in entry %',
      v_currencies_in_entry,
      v_entry_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
