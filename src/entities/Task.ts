import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Task {
  @PrimaryKey()
  id!: number;

  @Property()
  title!: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  deadline?: Date;

  @Property()
  priority!: 'low' | 'medium' | 'high';

  @Property({ nullable: true })
  assignee?: string;

  @Property({ type: Date })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
