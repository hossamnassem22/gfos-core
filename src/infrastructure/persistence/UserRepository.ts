import { User } from "../../domain/user/User.ts";

const kv = await Deno.openKv();

export class UserRepository {
  async save(user: User): Promise<void> {
    const atomic = kv.atomic();
    atomic.set(["users", user.id], user);
    atomic.set(["users_by_email", user.email], user.id);
    await atomic.commit();
  }

  async findById(id: string): Promise<User | null> {
    const result = await kv.get<User>(["users", id]);
    return result.value;
  }

  async findByEmail(email: string): Promise<User | null> {
    const res = await kv.get<string>(["users_by_email", email]);
    if (!res.value) return null;
    return await this.findById(res.value);
  }
}
