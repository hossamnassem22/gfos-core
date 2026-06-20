import { StatementService } from "../../../application/boundary/index.ts";

export async function statementRoute() {
  return StatementService.generate();
}
