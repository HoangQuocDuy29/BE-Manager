// File: src/entities/Task.ts (Updated để tương thích với DB hiện tại)
import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, ManyToMany, Collection } from '@mikro-orm/core';
import { User } from './User';
import { Ticket } from '../entities/Ticket';
import { LogWork } from '../entities/LogWork';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Entity()
export class Task {
  @PrimaryKey()
  id!: number;

  @Property()
  title!: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ default: TaskStatus.PENDING })
  status: TaskStatus = TaskStatus.PENDING;

  @Property() // Giữ nguyên kiểu hiện tại từ DB
  priority!: 'low' | 'medium' | 'high';

  @Property({ nullable: true, fieldName: 'start_date' })
  startDate?: Date;

  @Property({ nullable: true, fieldName: 'end_date' })
  endDate?: Date;

  @Property({ nullable: true })
  deadline?: Date;

  @Property({ default: 0, fieldName: 'estimated_hours' })
  estimatedHours: number = 0;

  @Property({ default: 0, fieldName: 'actual_hours' })
  actualHours: number = 0;

  @Property({ default: 0 })
  progress: number = 0; // Percentage (0-100)

  @Property({ nullable: true })
  notes?: string;

  @Property({ nullable: true }) // Giữ lại assignee cũ tạm thời
  assignee?: string;

  @Property({ type: Date })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  // Relations
  @ManyToOne(() => User, { fieldName: 'creator_id', nullable: true })
  creator?: User;

  @ManyToMany(() => User, user => user.assignedTasks, { owner: true })
  assignees = new Collection<User>(this);

  @OneToMany(() => Ticket, ticket => ticket.task)
  tickets = new Collection<Ticket>(this);

  @OneToMany(() => LogWork, logwork => logwork.task)
  logWorks = new Collection<LogWork>(this);

  // Helper methods
  isOverdue(): boolean {
    return this.deadline ? new Date() > this.deadline : false;
  }

  isCompleted(): boolean {
    return this.status === TaskStatus.COMPLETED;
  }

  isPending(): boolean {
    return this.status === TaskStatus.PENDING;
  }

  getTotalLoggedHours(): number {
    return this.logWorks.getItems().reduce((total, log) => total + log.hoursWorked, 0);
  }

  getAssigneeNames(): string[] {
    if (this.assignees.isInitialized()) {
      return this.assignees.getItems().map(user => user.getDisplayName());
    }
    // Fallback to old assignee field
    return this.assignee ? [this.assignee] : [];
  }

  // Convert priority to new enum if needed
  getPriorityEnum(): TaskPriority {
    switch (this.priority) {
      case 'low': return TaskPriority.LOW;
      case 'medium': return TaskPriority.MEDIUM;
      case 'high': return TaskPriority.HIGH;
      default: return TaskPriority.MEDIUM;
    }
  }
}