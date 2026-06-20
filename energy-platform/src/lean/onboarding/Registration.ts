export interface Participant {
  id: string;
  name: string;
  type: 'FACTORY' | 'RETAILER';
  contact: string;
}

export class Registry {
  private static participants: Participant[] = [];

  static register(p: Participant) {
    this.participants.push(p);
    console.log(`[LEAN] ${p.type} registered: ${p.name}`);
  }
}
