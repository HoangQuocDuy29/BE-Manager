import { User } from "../entities/user.entity";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt";

export async function loginService(email: string, password: string) {
  const em = global.orm.em.fork();
  const user = await em.findOne(User, { email });

  if (!user) throw new Error("User not found");
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid password");

  const token = generateToken({ id: user.id, email: user.email });
  return { token, user: { id: user.id, name: user.name, email: user.email } };
}
