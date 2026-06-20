export class ShutdownManager {
  private static tasks: Array<() => Promise<void>> = [];

  static register(task: () => Promise<void>) {
    this.tasks.push(task);
  }

  static async init() {
    Deno.addSignalListener("SIGINT", async () => {
      console.log("[SHUTDOWN] Signal received. Cleaning up...");
      for (const task of this.tasks) await task();
      Deno.exit(0);
    });
  }
}
