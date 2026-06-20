import { Tenant, TenantRepository } from "../../core/ports/TenantRepository.ts";

const db = new Map<string, Tenant>();

export class TenantRepositoryImpl implements TenantRepository {
  async create(tenant: Tenant): Promise<Tenant> {
    db.set(tenant.id, tenant);
    return tenant;
  }

  async findById(id: string): Promise<Tenant | null> {
    return db.get(id) || null;
  }

  async list(): Promise<Tenant[]> {
    return Array.from(db.values());
  }
}
