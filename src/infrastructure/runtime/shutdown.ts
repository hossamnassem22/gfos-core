export function registerShutdown(handler: () => void) {
  const signals = ["SIGINT", "SIGTERM"];

  for (const sig of signals) {
    addEventListener(sig, () => {
      console.log(`[SHUTDOWN] Received ${sig}`);
      handler();
      Deno.exit(0);
    });
  }
}
