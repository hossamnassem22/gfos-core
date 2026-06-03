import { Money } from '../../phase1_core/domain/money';

export enum PartyRole { OWNER = 'OWNER', CITIZEN = 'CITIZEN', MERCHANT = 'MERCHANT', STARTUP = 'STARTUP' }

export class Party {
  public balance: Money = Money.fromCents(0n);
  constructor(public readonly id: string, public readonly name: string, public readonly role: PartyRole) {}
  
  deposit(amount: Money) { this.balance = this.balance.add(amount); }
}

export class PartyRegistry {
  private static parties = new Map<string, Party>();
  static register(party: Party) { this.parties.set(party.id, party); }
  static get(id: string): Party | undefined { return this.parties.get(id); }
}
