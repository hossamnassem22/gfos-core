import { CustomerService } from "../../../application/boundary/index.ts";

export async function customersRoute() {
  return CustomerService.list();
}
