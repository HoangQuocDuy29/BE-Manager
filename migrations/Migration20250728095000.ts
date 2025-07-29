// 📁 BE: src/migrations/Migration20250728095000.ts
import { Migration } from '@mikro-orm/migrations';

export class Migration20250728095000 extends Migration {
  async up(): Promise<void> {
    // Tạo bảng roles (nếu chưa có)
    this.addSql(`
      create table if not exists "roles" (
        "id" serial primary key,
        "name" varchar(50) not null unique check ("name" in ('admin', 'user'))
      );
    `);

    // Thêm dữ liệu mặc định vào bảng roles (admin và user)
    this.addSql(`
      insert into "roles" ("name") values
      ('admin'),
      ('user')
      on conflict ("name") do nothing;
    `);

    // Thêm cột role_id vào bảng user và gán giá trị mặc định
    this.addSql(`
      alter table "user" 
      add column "role_id" int not null default 1 references "roles"("id");  -- Gán mặc định là admin
    `);
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop column "role_id";');
    this.addSql('drop table if exists "roles";');
  }
}
