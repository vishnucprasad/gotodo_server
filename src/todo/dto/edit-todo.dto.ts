import { IsDateString, IsOptional, IsString } from 'class-validator';

export class EditTodoDto {
  @IsString()
  @IsOptional()
  categoryId?: string;

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
