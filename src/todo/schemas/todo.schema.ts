import { BaseEntity } from '@app/database';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { TodoStatus } from '../types';

@Schema({ versionKey: false, timestamps: true, collection: 'todos' })
export class Todo extends BaseEntity {
  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  categoryId: Types.ObjectId;

  @Prop({ required: true })
  task: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: String, default: TodoStatus.Todo })
  status?: TodoStatus;

  @Prop()
  description: string;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
