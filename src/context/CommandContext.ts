import { AsyncLocalStorage } from "node:async_hooks";

export interface CommandContext {
  tenantId: string;
  requestId: string;
  userId?: string;
}

const commandStorage = new AsyncLocalStorage<CommandContext>();

export class CommandContextManager {
  static run<T>(ctx: CommandContext, fn: () => T): T {
    return commandStorage.run(ctx, fn);
  }

  static get(): CommandContext {
    const ctx = commandStorage.getStore();
    if (!ctx) {
      throw new Error("COMMAND_CONTEXT_NOT_FOUND");
    }
    return ctx;
  }

  static tenantId(): string {
    return this.get().tenantId;
  }
}
