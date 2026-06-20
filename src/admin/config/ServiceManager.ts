export class ServiceManager {
  private static activeServices = new Set<string>(['FACTORY', 'RETAIL', 'FINANCE']);

  static toggleService(service: string, state: boolean) {
    state ? this.activeServices.add(service) : this.activeServices.delete(service);
    console.log(`[ADMIN] Service ${service} state updated to: ${state}`);
  }
}
