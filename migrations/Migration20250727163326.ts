// 📁 BE: src/migrations/Migration20250727163326.ts
import { Migration } from '@mikro-orm/migrations';

export class Migration20250727163326 extends Migration {

  override async up(): Promise<void> {
    // Tạo bảng user nếu chưa có
    this.addSql(`
      create table if not exists "user" (
        "id" serial primary key,
        "email" varchar(255) not null,
        "password" varchar(255) not null,
        "created_at" timestamptz not null,
        "role_id" int not null references "roles"("id")  // Thêm role_id và liên kết với bảng roles
      );
    `);

    // Đảm bảo trường email là duy nhất
    this.addSql(`alter table "user" add constraint "user_email_unique" unique ("email");`);
  }

  override async down(): Promise<void> {
    // Xóa bảng user nếu có
    this.addSql(`drop table if exists "user" cascade;`);
  }
}
