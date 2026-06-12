const { EntryType } = require('./ledger-line');

class JournalEntry {
  constructor(id, lines) {
    this.id = id;
    this.lines = lines;
    this.validateBalance();
  }

  validateBalance() {
    const totalDebit = this.lines
      .filter(l => l.type === EntryType.DEBIT)
      .reduce((sum, l) => sum + BigInt(l.amount), 0n);

    const totalCredit = this.lines
      .filter(l => l.type === EntryType.CREDIT)
      .reduce((sum, l) => sum + BigInt(l.amount), 0n);

    if (totalDebit !== totalCredit) {
      throw new Error('Financial Invariant Violated: Debits must equal Credits');
    }
  }
}
module.exports = { JournalEntry };
