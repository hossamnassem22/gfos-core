export interface RegisterUserCommand {
  email: string;
  password_hash: string;
  role: string;
}

export class RegisterUserHandler {
  constructor(private userRepo: any) {}

  async handle(command: RegisterUserCommand): Promise<void> {
    // منطق التعديل فقط
    await this.userRepo.save(command);
  }
}
