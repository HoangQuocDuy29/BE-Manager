// File: src/entities/User.ts (Updated với các trường cho UI)
import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, ManyToMany, Collection } from '@mikro-orm/core';
import { Role } from './Role';
import { Task } from './Task';
import { Ticket } from '../entities/Ticket';
import { LogWork } from '../entities/LogWork';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  email!: string;

  @Property()
  password!: string;

  @Property({ nullable: true })
  username?: string;

  @Property({ nullable: true, fieldName: 'full_name' })
  fullName?: string;

  @Property({ nullable: true })
  avatar?: string;

  @Property({ nullable: true })
  phone?: string;

  @Property({ nullable: true })
  department?: string;

  @Property({ nullable: true })
  position?: string;

  @Property({ default: UserStatus.ACTIVE })
  status: UserStatus = UserStatus.ACTIVE;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true, fieldName: 'updated_at' })
  updatedAt?: Date;

  @Property({ nullable: true, fieldName: 'last_login_at' })
  lastLoginAt?: Date;

  // ===== CÁC TRƯỜNG MỚI CHO UI BẢNG =====
  @Property({ default: 0, fieldName: 'total_orders' })
  totalOrders: number = 0;

  @Property({ 
    type: 'decimal', 
    precision: 12, 
    scale: 2, 
    default: 0,
    fieldName: 'total_spending' 
  })
  totalSpending: number = 0;

  // Relations
  @ManyToOne(() => Role)
  role!: Role;

  @OneToMany(() => Task, task => task.creator)
  createdTasks = new Collection<Task>(this);

  @ManyToMany(() => Task, task => task.assignees)
  assignedTasks = new Collection<Task>(this);

  @OneToMany(() => Ticket, ticket => ticket.requestedBy)
  requestedTickets = new Collection<Ticket>(this);

  @OneToMany(() => Ticket, ticket => ticket.approvedBy)
  approvedTickets = new Collection<Ticket>(this);

  @ManyToMany(() => Ticket, ticket => ticket.assignees)
  assignedTickets = new Collection<Ticket>(this);

  @OneToMany(() => LogWork, logwork => logwork.user)
  logWorks = new Collection<LogWork>(this);

  // ===== HELPER METHODS CŨ =====
  isAdmin(): boolean {
    return this.role.name === 'admin';
  }

  isUser(): boolean {
    return this.role.name === 'user';
  }

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  getDisplayName(): string {
    return this.fullName || this.username || this.email;
  }

  // ===== HELPER METHODS MỚI =====
  getFormattedSpending(): string {
    return this.totalSpending.toLocaleString('vi-VN') + '₫';
  }

  getJoinDate(): string {
    return this.createdAt.toLocaleDateString('vi-VN');
  }

  getStatusBadgeVariant(): 'default' | 'secondary' | 'destructive' {
    switch (this.status) {
      case UserStatus.ACTIVE:
        return 'default';
      case UserStatus.INACTIVE:
        return 'secondary';
      case UserStatus.SUSPENDED:
        return 'destructive';
      default:
        return 'secondary';
    }
  }

  // Method để tính toán statistics (nếu cần)
  calculateTotalOrders(): number {
    // Logic tính tổng đơn hàng từ relations khác nếu có
    return this.totalOrders;
  }

  calculateTotalSpending(): number {
    // Logic tính tổng chi tiêu từ relations khác nếu có  
    return this.totalSpending;
  }

  // Method cho avatar fallback
  getAvatarFallback(): string {
    return this.getDisplayName().charAt(0).toUpperCase();
  }
}
