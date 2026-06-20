import { Container } from "@core/di/Container.ts";

export interface ModuleDefinition {
  init(): Promise<void>;
}

export class ModuleRegistry {
  private modules: ModuleDefinition[] = [];

  register(module: ModuleDefinition) {
    this.modules.push(module);
  }

  async bootstrap() {
    for (const mod of this.modules) {
      await mod.init();
    }
  }
}
