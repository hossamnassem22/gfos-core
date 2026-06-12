import { User } from "../../domain/user/User.ts";
import { UserRepository } from "../../infrastructure/persistence/UserRepository.ts";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async register(id: string, name: string, email: string): Promise<User> {
    // 1. التحقق من عدم تكرار البريد
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error("Email already registered.");
    }

    // 2. إنشاء المستخدم
    const newUser: User = {
      id,
      name,
      email,
      createdAt: new Date(),
    };

    // 3. الحفظ
    await this.userRepository.save(newUser);
    return newUser;
  }
}
