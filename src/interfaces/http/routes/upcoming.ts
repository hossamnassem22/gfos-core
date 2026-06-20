import { UpcomingService } from "../../../application/boundary/index.ts";

export async function upcomingRoute() {
  return UpcomingService.list();
}
