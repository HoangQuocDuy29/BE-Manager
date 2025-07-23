import { Migration } from '@mikro-orm/migrations';

export class Migration20250723054540 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "task" ("id" serial primary key, "title" varchar(255) not null, "description" varchar(255) null, "deadline" timestamptz null, "priority" varchar(255) not null, "assignee" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);
  }

}
