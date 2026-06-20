export class JsonLogger {
  log(level: "INFO" | "ERROR" | "WARN", message: string, meta: Record<string, any> = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
      service: "gfos-core"
    };
    console.log(JSON.stringify(entry));
  }
}
