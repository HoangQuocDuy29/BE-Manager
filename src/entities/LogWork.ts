// File: src/entities/LogWork.ts (New Entity)  
import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { User } from './User';
import { Task } from './Task';

@Entity({ tableName: 'log_work' })
export class LogWork {
  @PrimaryKey()
  id!: number;

  @Property({ type: 'date' })
  date!: Date;

  @Property({ type: 'decimal', precision: 5, scale: 2, default: 0, fieldName: 'hours_worked' })
  hoursWorked: number = 0;

  @Property({ nullable: true })
  description?: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date(), fieldName: 'updated_at' })
  updatedAt: Date = new Date();

  // Relations
  @ManyToOne(() => Task, { fieldName: 'task_id' })
  task!: Task;

  @ManyToOne(() => User, { fieldName: 'user_id' })
  user!: User;

  // Helper methods
  isToday(): boolean {
    const today = new Date();
    return this.date.toDateString() === today.toDateString();
  }

  isThisWeek(): boolean {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    return this.date >= weekStart && this.date <= weekEnd;
  }

  isThisMonth(): boolean {
    const today = new Date();
    return this.date.getFullYear() === today.getFullYear() && 
           this.date.getMonth() === today.getMonth();
  }

  getFormattedDate(): string {
    return this.date.toLocaleDateString('vi-VN');
  }

  getFormattedHours(): string {
    return `${this.hoursWorked}h`;
  }

  // Validate hours worked (must be positive and reasonable)
  validateHours(): boolean {
    return this.hoursWorked > 0 && this.hoursWorked <= 24;
  }
}