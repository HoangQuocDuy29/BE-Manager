import { Migration } from '@mikro-orm/migrations';

export class Migration20250730172413 extends Migration {

  async up(): Promise<void> {
    console.log('🚀 Adding total_orders and total_spending to user table...');
    
    // Thêm 2 trường mới
    this.addSql('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "total_orders" INTEGER DEFAULT 0;');
    this.addSql('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "total_spending" DECIMAL(12,2) DEFAULT 0;');
    
    // Tạo indexes cho performance
    this.addSql('CREATE INDEX IF NOT EXISTS "user_total_orders_index" ON "user" ("total_orders");');
    this.addSql('CREATE INDEX IF NOT EXISTS "user_total_spending_index" ON "user" ("total_spending");');
    
    // Thêm dữ liệu demo cho users hiện có
    this.addSql(`
      UPDATE "user" 
      SET 
        total_orders = FLOOR(RANDOM() * 50 + 1),
        total_spending = FLOOR(RANDOM() * 10000000 + 100000)
      WHERE total_orders = 0 OR total_orders IS NULL;
    `);
    
    console.log('✅ Added total_orders and total_spending fields successfully');
    console.log('💡 Demo data generated for existing users');
  }

  async down(): Promise<void> {
    console.log('🔄 Rolling back total_orders and total_spending fields...');
    
    this.addSql('DROP INDEX IF EXISTS "user_total_orders_index";');
    this.addSql('DROP INDEX IF EXISTS "user_total_spending_index";');
    this.addSql('ALTER TABLE "user" DROP COLUMN IF EXISTS "total_orders";');
    this.addSql('ALTER TABLE "user" DROP COLUMN IF EXISTS "total_spending";');
    
    console.log('✅ Rollback completed');
  }

}
