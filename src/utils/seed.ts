import 'reflect-metadata';
import { MikroORM } from "@mikro-orm/core";
import { User } from '../entities/user.entity';
import bcrypt from "bcryptjs";
import mikroConfig from "../config/mikro-orm.config";

async function seed() {
  const orm = await MikroORM.init(mikroConfig);
  const em = orm.em.fork();

  console.log("Seeding user using User entity:", User.name);

  try {
    const repo = em.getRepository(User);
    const existing = await repo.findOne({ email: "admin@example.com" });

    if (!existing) {
      const hashed = await bcrypt.hash("123456", 10);

      const user = em.create(User, {
        name: "Admin",
        email: "admin@example.com",
        password: hashed,
        createdAt: new Date(), 
      });

      await em.persistAndFlush(user);
      console.log("✅ Seeded user: admin@example.com / 123456");
    } else {
      console.log("⚠️ User already exists.");
    }
  } catch (err) {
    console.error("❌ Error while seeding user:", err);
  } finally {
    await orm.close();
  }
}

seed();
