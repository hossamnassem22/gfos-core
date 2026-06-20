export class PredictiveEngine {
  static analyzeSensorData(temperature: number, vibration: number) {
    if (temperature > 85 || vibration > 0.8) {
      console.warn("[FACTORY] Alert: Maintenance required for machine.");
    }
  }
}
