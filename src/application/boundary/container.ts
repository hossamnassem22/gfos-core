import type { DatabasePort } from "../ports/database.port.ts";
import type { UserRepositoryPort } from "../ports/user-repository.port.ts";

/**
 * Application Container (Boundary Layer)
 * هذا الملف لا يحتوي أي import من infrastructure
 * فقط عقود (Ports)
 */

export interface ApplicationContainer {
  database: DatabasePort;
  userRepository: UserRepositoryPort;
}
