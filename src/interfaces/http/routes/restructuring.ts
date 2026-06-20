import { RestructuringService } from "../../../application/boundary/index.ts";

export async function restructuringRoute() {
  return RestructuringService.run();
}
