import { BaseEntity } from '@app/database';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'categories' })
export class Category extends BaseEntity {
  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, length: 7 })
  color: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
