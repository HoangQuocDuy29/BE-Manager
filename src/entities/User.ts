// File: src/entities/User.ts (Updated để tương thích với DB hiện tại)
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

  // Relations
  @ManyToOne(() => Role) // Giữ nguyên relation hiện có
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

  // Helper methods
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
}