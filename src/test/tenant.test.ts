import { TenantContext } from "../core/context/TenantContext.ts";

Deno.test("Tenant context isolation", () => {
  TenantContext.setTenant("tenant-1");

  if (TenantContext.getTenant() !== "tenant-1") {
    throw new Error("Tenant context failed");
  }

  TenantContext.clear();
});
