export class BillingException extends Error {
  constructor(public message: string, public code: string) {
    super(message);
    this.name = "BillingException";
  }
}
