import { TrendPredictor } from "../predictive/TrendPredictor.ts";
import { ScalingExecutor } from "@core/autoscaling/executor/ScalingExecutor.ts";

export class ProactiveOrchestrator {
  private predictor = new TrendPredictor();
  private executor = new ScalingExecutor();

  async analyzeAndAct(history: number[]) {
    const prediction = this.predictor.predict(history);
    if (prediction > 80) {
      console.log("[REVOLUTIONARY] Predicting surge. Pre-scaling resources...");
      await this.executor.execute("SCALE_UP");
    }
  }
}
