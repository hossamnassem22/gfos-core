export class HealthController {
  private isReady = false;

  setReady(status: boolean) {
    this.isReady = status;
  }

  getLiveness(): { status: string } {
    return { status: "UP" };
  }

  getReadiness(): { status: string } {
    return { status: this.isReady ? "READY" : "NOT_READY" };
  }
}
