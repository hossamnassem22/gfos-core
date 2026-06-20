export class Logger {
  static info(msg: any) {
    console.log("[INFO]", JSON.stringify(msg));
  }

  static error(msg: any) {
    console.log("[ERROR]", JSON.stringify(msg));
  }
}
