export class ConnectionBroker {
  static createConnection(factoryId: string, retailerId: string, details: string) {
    const connectionId = `CONN-${Date.now()}`;
    console.log(`[LEAN] Linking ${retailerId} to ${factoryId}. Reference: ${connectionId}`);
    return connectionId;
  }
}
