import { EventBroker } from "../messaging/EventBroker.ts";

export class Replication {
  static replicate(event: any) {
    const regions = ["eu-west", "us-east", "asia"];

    for (const region of regions) {
      console.log(`[REPLICATE] -> ${region}`, event);
      EventBroker.publish(`replica.${region}`, event);
    }
  }
}
