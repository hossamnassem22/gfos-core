export interface UserRepositoryPort {
  findById(id: string): Promise<any>;
  save(user: any): Promise<void>;
}
