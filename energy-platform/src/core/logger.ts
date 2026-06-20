export const logEvent = (action: string, details: string) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${action}: ${details}`);
};
