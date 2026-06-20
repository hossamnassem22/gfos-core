import { SelfHealing } from "../../infrastructure/resilience/SelfHealing.ts";

export class ResilientBilling {
  static async charge(userId: string, amount: number) {
    return SelfHealing.call(async () => {
      if (Math.random() < 0.3) {
        throw new Error("Random failure (simulated)");
      }

      return {
        userId,
        amount,
        status: "charged",
      };
    });
  }
}
