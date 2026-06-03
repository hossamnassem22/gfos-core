import { DomainEvent } from '../../shared/contracts/EventContracts';
import { LedgerEntry } from '../../shared/contracts/AccountingContracts';
import { RuleRegistry } from '../ledger-kernel/RuleRegistry';

export class AccountingEngine {
  constructor(private registry: RuleRegistry) {}

  transform(event: DomainEvent): LedgerEntry[] {
    const rule = this.registry.resolve(event.type, event.timestamp);
    
    // تنفيذ الـ Mapping Rule
    const entries = rule.transform(event, { 
      accounts: { get: (id) => ({ id, type: 'ASSET' }) } 
    });

    return entries;
  }

  validate(entries: LedgerEntry[]): boolean {
    const sum = entries.reduce((acc, e) => acc + e.amount, 0n);
    return sum === 0n;
  }
}
