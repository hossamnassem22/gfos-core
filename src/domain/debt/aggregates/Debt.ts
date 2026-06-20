export class Debt {
  constructor(
    public id: string,
    public customerId: string,
    public principal: number,
    public interestRate: number,
    public termMonths: number
  ) {}

  async calculateSimpleHash(): Promise<string> {
    const data = `${this.id}:${this.customerId}:${this.principal}`;

    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(data)
    );

    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }
}
