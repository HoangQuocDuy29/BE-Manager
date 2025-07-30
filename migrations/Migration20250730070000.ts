// File: src/migrations/Migration20250730_add_user_task_extensions.ts
import { Migration } from '@mikro-orm/migrations';

export class Migration20250730AddUserTaskExtensions extends Migration {

  async up(): Promise<void> {
    console.log('🚀 Starting safe migration...');

    // ========== PHASE 1: ADD NEW COLUMNS (SAFE) ==========
    console.log('📝 Phase 1: Adding new columns to existing tables...');
    
    // 1. Thêm cột mới cho User (nullable để không ảnh hưởng data cũ)
    this.addSql('alter table "user" add column if not exists "username" varchar(255);');
    this.addSql('alter table "user" add column if not exists "full_name" varchar(255);');
    this.addSql('alter table "user" add column if not exists "avatar" varchar(255);');
    this.addSql('alter table "user" add column if not exists "phone" varchar(255);');
    this.addSql('alter table "user" add column if not exists "department" varchar(255);');
    this.addSql('alter table "user" add column if not exists "position" varchar(255);');
    this.addSql('alter table "user" add column if not exists "status" varchar(20) default \'active\';');
    this.addSql('alter table "user" add column if not exists "last_login_at" timestamptz;');
    this.addSql('alter table "user" add column if not exists "updated_at" timestamptz default now();');

    // 2. Thêm cột mới cho Task (nullable để không ảnh hưởng data cũ)
    this.addSql('alter table "task" add column if not exists "status" varchar(20) default \'pending\';');
    this.addSql('alter table "task" add column if not exists "start_date" timestamptz;');
    this.addSql('alter table "task" add column if not exists "end_date" timestamptz;');
    this.addSql('alter table "task" add column if not exists "estimated_hours" int default 0;');
    this.addSql('alter table "task" add column if not exists "actual_hours" int default 0;');
    this.addSql('alter table "task" add column if not exists "progress" int default 0;');
    this.addSql('alter table "task" add column if not exists "notes" text;');
    this.addSql('alter table "task" add column if not exists "creator_id" int;');

    console.log('✅ Phase 1 completed: New columns added safely');

    // ========== PHASE 2: CREATE NEW TABLES ==========
    console.log('📝 Phase 2: Creating new tables...');

    // 3. Tạo bảng task_assignees (Many-to-Many) - Chỉ tạo nếu chưa tồn tại
    this.addSql(`
      create table if not exists "task_assignees" (
        "task_id" int not null, 
        "user_id" int not null, 
        constraint "task_assignees_pkey" primary key ("task_id", "user_id")
      );
    `);

    // 4. Tạo bảng Ticket - Chỉ tạo nếu chưa tồn tại
    this.addSql(`
      create table if not exists "ticket" (
        "id" serial primary key, 
        "title" varchar(255) not null, 
        "description" text, 
        "status" varchar(20) default 'pending', 
        "priority" varchar(10) default 'medium', 
        "task_id" int not null, 
        "requested_by_id" int not null, 
        "approved_by_id" int, 
        "requested_at" timestamptz default now(), 
        "approved_at" timestamptz, 
        "notes" text, 
        "created_at" timestamptz default now(), 
        "updated_at" timestamptz default now()
      );
    `);

    // 5. Tạo bảng ticket_assignees
    this.addSql(`
      create table if not exists "ticket_assignees" (
        "ticket_id" int not null, 
        "user_id" int not null, 
        constraint "ticket_assignees_pkey" primary key ("ticket_id", "user_id")
      );
    `);

    // 6. Tạo bảng LogWork
    this.addSql(`
      create table if not exists "log_work" (
        "id" serial primary key, 
        "task_id" int not null, 
        "user_id" int not null, 
        "date" date not null, 
        "hours_worked" decimal(5,2) default 0, 
        "description" text, 
        "created_at" timestamptz default now(), 
        "updated_at" timestamptz default now()
      );
    `);

    console.log('✅ Phase 2 completed: New tables created');

    // ========== PHASE 3: ADD CONSTRAINTS ==========
    console.log('📝 Phase 3: Adding foreign key constraints...');

    // Thêm foreign keys - sử dụng IF NOT EXISTS để tránh lỗi
    this.addSql(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'task_creator_id_foreign') THEN
          ALTER TABLE "task" ADD CONSTRAINT "task_creator_id_foreign" 
          FOREIGN KEY ("creator_id") REFERENCES "user" ("id") ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    this.addSql(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'task_assignees_task_id_foreign') THEN
          ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_task_id_foreign" 
          FOREIGN KEY ("task_id") REFERENCES "task" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    this.addSql(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'task_assignees_user_id_foreign') THEN
          ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_user_id_foreign" 
          FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    // Ticket constraints
    this.addSql(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_task_id_foreign') THEN
          ALTER TABLE "ticket" ADD CONSTRAINT "ticket_task_id_foreign" 
          FOREIGN KEY ("task_id") REFERENCES "task" ("id") ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    this.addSql(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_requested_by_id_foreign') THEN
          ALTER TABLE "ticket" ADD CONSTRAINT "ticket_requested_by_id_foreign" 
          FOREIGN KEY ("requested_by_id") REFERENCES "user" ("id") ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    this.addSql(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_approved_by_id_foreign') THEN
          ALTER TABLE "ticket" ADD CONSTRAINT "ticket_approved_by_id_foreign" 
          FOREIGN KEY ("approved_by_id") REFERENCES "user" ("id") ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    // Ticket assignees constraints
    this.addSql(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_assignees_ticket_id_foreign') THEN
          ALTER TABLE "ticket_assignees" ADD CONSTRAINT "ticket_assignees_ticket_id_foreign" 
          FOREIGN KEY ("ticket_id") REFERENCES "ticket" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    this.addSql(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_assignees_user_id_foreign') THEN
          ALTER TABLE "ticket_assignees" ADD CONSTRAINT "ticket_assignees_user_id_foreign" 
          FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    // LogWork constraints
    this.addSql(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'log_work_task_id_foreign') THEN
          ALTER TABLE "log_work" ADD CONSTRAINT "log_work_task_id_foreign" 
          FOREIGN KEY ("task_id") REFERENCES "task" ("id") ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    this.addSql(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'log_work_user_id_foreign') THEN
          ALTER TABLE "log_work" ADD CONSTRAINT "log_work_user_id_foreign" 
          FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    console.log('✅ Phase 3 completed: Constraints added');

    // ========== PHASE 4: CREATE INDEXES ==========
    console.log('📝 Phase 4: Creating indexes for performance...');

    this.addSql('create index if not exists "user_email_index" on "user" ("email");');
    this.addSql('create index if not exists "user_status_index" on "user" ("status");');
    this.addSql('create index if not exists "task_status_index" on "task" ("status");');
    this.addSql('create index if not exists "task_priority_index" on "task" ("priority");');
    this.addSql('create index if not exists "task_deadline_index" on "task" ("deadline");');
    this.addSql('create index if not exists "ticket_status_index" on "ticket" ("status");');
    this.addSql('create index if not exists "log_work_date_index" on "log_work" ("date");');

    console.log('✅ Phase 4 completed: Indexes created');

    // ========== PHASE 5: MIGRATE EXISTING DATA ==========
    console.log('📝 Phase 5: Migrating existing assignee data...');

    // Migration data từ assignee (string) sang task_assignees (many-to-many)
    // Chỉ migrate nếu có data và chưa migrate
    this.addSql(`
      INSERT INTO task_assignees (task_id, user_id)
      SELECT DISTINCT t.id, u.id 
      FROM task t
      JOIN "user" u ON (
        u.full_name ILIKE t.assignee OR 
        u.email ILIKE t.assignee OR 
        u.username ILIKE t.assignee OR
        TRIM(LOWER(u.full_name)) = TRIM(LOWER(t.assignee)) OR
        TRIM(LOWER(u.email)) = TRIM(LOWER(t.assignee))
      )
      WHERE t.assignee IS NOT NULL 
        AND t.assignee != '' 
        AND NOT EXISTS (
          SELECT 1 FROM task_assignees ta 
          WHERE ta.task_id = t.id AND ta.user_id = u.id
        );
    `);

    // Set creator_id cho các task hiện có (set admin làm creator mặc định)
    this.addSql(`
      UPDATE task 
      SET creator_id = (
        SELECT u.id FROM "user" u 
        JOIN roles r ON u.role_id = r.id 
        WHERE r.name = 'admin' 
        LIMIT 1
      )
      WHERE creator_id IS NULL;
    `);

    console.log('✅ Phase 5 completed: Data migration finished');

    console.log('🎉 Migration completed successfully! Your existing data is preserved.');

    // Thông báo về việc xóa cột assignee cũ (không tự động xóa)
    console.log('⚠️  NOTE: Column "assignee" in task table is kept for backup. You can manually drop it later if needed.');
  }

  async down(): Promise<void> {
    console.log('🔄 Rolling back migration...');

    // Rollback theo thứ tự ngược lại
    this.addSql('drop table if exists "log_work" cascade;');
    this.addSql('drop table if exists "ticket_assignees" cascade;');
    this.addSql('drop table if exists "ticket" cascade;');
    this.addSql('drop table if exists "task_assignees" cascade;');
    
    // Rollback Task table
    this.addSql('alter table "task" drop constraint if exists "task_creator_id_foreign";');
    this.addSql('alter table "task" drop column if exists "status";');
    this.addSql('alter table "task" drop column if exists "start_date";');
    this.addSql('alter table "task" drop column if exists "end_date";');
    this.addSql('alter table "task" drop column if exists "estimated_hours";');
    this.addSql('alter table "task" drop column if exists "actual_hours";');
    this.addSql('alter table "task" drop column if exists "progress";');
    this.addSql('alter table "task" drop column if exists "notes";');
    this.addSql('alter table "task" drop column if exists "creator_id";');
    
    // Rollback User table
    this.addSql('alter table "user" drop column if exists "username";');
    this.addSql('alter table "user" drop column if exists "full_name";');
    this.addSql('alter table "user" drop column if exists "avatar";');
    this.addSql('alter table "user" drop column if exists "phone";');
    this.addSql('alter table "user" drop column if exists "department";');
    this.addSql('alter table "user" drop column if exists "position";');
    this.addSql('alter table "user" drop column if exists "status";');
    this.addSql('alter table "user" drop column if exists "last_login_at";');
    this.addSql('alter table "user" drop column if exists "updated_at";');

    console.log('✅ Rollback completed');
  }
}