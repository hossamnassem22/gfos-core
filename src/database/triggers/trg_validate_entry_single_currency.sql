CREATE CONSTRAINT TRIGGER trg_validate_entry_single_currency
AFTER INSERT OR UPDATE ON journal_entry_lines
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION validate_entry_single_currency();
