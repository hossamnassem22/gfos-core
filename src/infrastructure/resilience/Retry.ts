export async function retry<T>(
  fn: () => Promise<T>,
  attempts = 3
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await new Promise(r => setTimeout(r, 100 * (i + 1)));
    }
  }

  throw lastError;
}
