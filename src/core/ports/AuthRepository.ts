export interface AuthRepository {
  saveRefreshToken(userId: string, token: string): Promise<void>;
  validateRefreshToken(token: string): Promise<boolean>;
}
