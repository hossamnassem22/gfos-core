import { randomUUID } from "node:crypto";
import { CommandContext } from "../context/CommandContext.ts";

export class EventFactory {
  static createEvent(type: string, payload: any) {
    return { id: randomUUID(), type, payload };
  }
}
