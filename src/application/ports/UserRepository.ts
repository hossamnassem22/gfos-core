export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
}
