import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class BaseEntity {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;
}
