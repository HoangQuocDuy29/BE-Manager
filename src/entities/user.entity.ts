import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity() // ✅ MUST HAVE
export class User {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property({ unique: true })
  email!: string;

  @Property()
  password!: string;

  @Property()
  createdAt: Date = new Date();
}
