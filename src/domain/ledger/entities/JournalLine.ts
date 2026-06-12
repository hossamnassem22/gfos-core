import { Money } from '../../shared/Money';

export class JournalLine {
  constructor(
    public readonly accountId: string,
    public readonly debit: Money,
    public readonly credit: Money
  ) {
    if (debit.amount > 0n && credit.amount > 0n) {
      throw new Error("DOMAIN_ERROR: INVALID_LINE_STRUCTURE");
    }
  }
}
