import { BaseEntity } from '@app/database';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'users' })
export class User extends BaseEntity {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  hash: string;

  @Prop()
  rtHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
