export class RetryPolicy {
  static async execute<T>(action: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
      return await action();
    } catch (e) {
      if (retries <= 0) throw e;
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.execute(action, retries - 1, delay * 2); // Exponential Backoff
    }
  }
}
