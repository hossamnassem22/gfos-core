export class ProcessPayment {
  execute(input: {
    tenantId: string;
    amount: number;
  }): void {
    // TODO: implement payment logic
    console.log(`Processing payment for ${input.tenantId}: ${input.amount}`);
  }
}
