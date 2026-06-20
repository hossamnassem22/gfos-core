export class RegionRouter {
  static regions = ["eu-west", "us-east", "asia"];

  static select(userId: string): string {
    const hash = [...userId].reduce((a, c) => a + c.charCodeAt(0), 0);
    return this.regions[hash % this.regions.length];
  }
}
