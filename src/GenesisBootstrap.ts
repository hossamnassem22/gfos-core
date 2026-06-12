import { StorageEngine } from "@engine/StorageEngine.ts";
import { LedgerRepository } from "@/infrastructure/persistence/LedgerRepository.ts";

export interface GenesisKernel {
  storage: StorageEngine;
  ledgerRepo: LedgerRepository;
}

export class GenesisBootstrap {
  static async initialize(): Promise<GenesisKernel> {
    console.log("Initializing Genesis Kernel...");

    // التهيئة الصريحة للمكونات من المسارات المعتمدة
    const storage = new StorageEngine();
    const ledgerRepo = new LedgerRepository();

    console.log("Genesis Kernel initialized successfully.");

    return {
      storage,
      ledgerRepo
    };
  }

  // دعم لنمط init المذكور في الاختبار
  static async init(): Promise<{ committer: any }> {
    const kernel = await this.initialize();
    
    // محاكاة كائن committer
    const committer = {
      commit: async (entries: any[]) => {
        console.log(`Committing ${entries.length} entries to storage...`);
        for (const entry of entries) {
          await kernel.ledgerRepo.save(entry);
        }
      }
    };

    return { committer };
  }
}
