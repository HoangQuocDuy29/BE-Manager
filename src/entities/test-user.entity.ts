import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class TestUser {
  @PrimaryKey()
  id!: number;

  @Property()
  username!: string;
}
