export interface UserReadModel {
  id: number;
  email: string;
  role: string;
}

export class GetUserQueryHandler {
  constructor(private db: any) {}

  async handle(userId: number): Promise<UserReadModel | null> {
    // استعلام مباشر وسريع (Read Model)
    return await this.db.query("SELECT id, email, role FROM users WHERE id = $1", [userId]);
  }
}
