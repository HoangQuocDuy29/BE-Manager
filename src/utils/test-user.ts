import 'reflect-metadata';
import { MikroORM } from "@mikro-orm/core";
import mikroConfig from "../config/mikro-orm.config";
import { User } from "../entities/user.entity";

async function test() {
  const orm = await MikroORM.init(mikroConfig);
  const em = orm.em.fork();

  console.log("🔍 Testing User Entity:", User);
  const repo = em.getRepository(User);
  const found = await repo.findAll();
  console.log("✅ Users found:", found);
}

test();
