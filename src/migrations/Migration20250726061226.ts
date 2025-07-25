import { Migration } from '@mikro-orm/migrations';

export class Migration20250726061226 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "test_user" ("id" serial primary key, "username" varchar(255) not null);`);

    this.addSql(`create table "user" ("id" serial primary key, "name" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, "created_at" timestamptz not null);`);
    this.addSql(`alter table "user" add constraint "user_email_unique" unique ("email");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "test_user" cascade;`);

    this.addSql(`drop table if exists "user" cascade;`);
  }

}
