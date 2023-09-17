import { IsDateString, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class EditTodoDto {
  @IsString()
  @IsOptional()
  categoryId?: string | Types.ObjectId;

  @IsString()
  @IsOptional()
  task?: string;

  @IsDateString()
  @IsOptional()
  date?: Date;

  @IsString()
  @IsOptional()
  description?: string;
}
