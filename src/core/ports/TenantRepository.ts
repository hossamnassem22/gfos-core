export interface Tenant {
  id: string;
  name: string;
  plan: "free" | "pro" | "enterprise";
  createdAt: Date;
}

export interface TenantRepository {
  create(tenant: Tenant): Promise<Tenant>;
  findById(id: string): Promise<Tenant | null>;
  list(): Promise<Tenant[]>;
}
