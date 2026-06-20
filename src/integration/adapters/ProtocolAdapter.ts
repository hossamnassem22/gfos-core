export class ProtocolAdapter {
  static transform(raw: any, sourceFormat: string) {
    console.log(`[ADAPTER] Converting from ${sourceFormat} to Internal Standard.`);
    // منطق التحويل (Mapping Logic)
    return { ...raw, systemTimestamp: Date.now() };
  }
}
