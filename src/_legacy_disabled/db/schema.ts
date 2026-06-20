
export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  status: text('status').notNull(),
  totalDebit: bigint('total_debit', { mode: 'bigint' }).notNull(),
  totalCredit: bigint('total_credit', { mode: 'bigint' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const journalLines = pgTable('journal_lines', {
  id: uuid('id').primaryKey(),
  journalEntryId: uuid('journal_entry_id').references(() => journalEntries.id),
  accountId: text('account_id').notNull(),
  debit: bigint('debit', { mode: 'bigint' }).default(0n),
  credit: bigint('credit', { mode: 'bigint' }).default(0n),
});
