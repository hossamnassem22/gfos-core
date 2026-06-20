export interface User {
  readonly id: number;
  readonly email: string;
  readonly password_hash: string;
  readonly role: string;
  readonly createdAt: Date;
}
