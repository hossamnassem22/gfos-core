export class DisplayGuard {
  static maskSensitiveData(data: any, role: string): any {
    if (role !== "ADMIN") return "***";
    return data;
  }
}
