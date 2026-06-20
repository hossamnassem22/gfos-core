export interface UserRepository {
  findById(id: string): Promise<any>;
  findByEmail(email: string): Promise<any>;
}
