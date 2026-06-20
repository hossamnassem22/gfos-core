export type Module = 'FACTORY' | 'RETAIL' | 'FINANCE' | 'LOGISTICS';

export class AccessController {
  private static permissions = new Map<string, Module[]>();

  static grantAccess(adminId: string, modules: Module[]) {
    this.permissions.set(adminId, modules);
  }

  static hasAccess(adminId: string, module: Module): boolean {
    return this.permissions.get(adminId)?.includes(module) ?? false;
  }
}
