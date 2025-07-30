// File: src/entities/Ticket.ts (New Entity)
import { Entity, PrimaryKey, Property, ManyToOne, ManyToMany, Collection } from '@mikro-orm/core';
import { User } from './User';
import { Task } from './Task';

export enum TicketStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_REVIEW = 'in_review'
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Entity()
export class Ticket {
  @PrimaryKey()
  id!: number;

  @Property()
  title!: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ default: TicketStatus.PENDING })
  status: TicketStatus = TicketStatus.PENDING;

  @Property({ default: TicketPriority.MEDIUM })
  priority: TicketPriority = TicketPriority.MEDIUM;

  @Property({ nullable: true })
  notes?: string;

  @Property({ onCreate: () => new Date(), fieldName: 'requested_at' })
  requestedAt: Date = new Date();

  @Property({ nullable: true, fieldName: 'approved_at' })
  approvedAt?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date(), fieldName: 'updated_at' })
  updatedAt: Date = new Date();

  // Relations
  @ManyToOne(() => Task, { fieldName: 'task_id' })
  task!: Task;

  @ManyToOne(() => User, { fieldName: 'requested_by_id' })
  requestedBy!: User;

  @ManyToOne(() => User, { fieldName: 'approved_by_id', nullable: true })
  approvedBy?: User;

  @ManyToMany(() => User, user => user.assignedTickets, { owner: true })
  assignees = new Collection<User>(this);

  // Helper methods
  isPending(): boolean {
    return this.status === TicketStatus.PENDING;
  }

  isApproved(): boolean {
    return this.status === TicketStatus.APPROVED;
  }

  isRejected(): boolean {
    return this.status === TicketStatus.REJECTED;
  }

  approve(approvedBy: User): void {
    this.status = TicketStatus.APPROVED;
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
  }

  reject(approvedBy: User): void {
    this.status = TicketStatus.REJECTED;
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
  }

  getAssigneeNames(): string[] {
    return this.assignees.getItems().map(user => user.getDisplayName());
  }

  canBeApprovedBy(user: User): boolean {
    return user.isAdmin() || user.id === this.task.creator?.id;
  }
}