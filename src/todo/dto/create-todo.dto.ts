import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  task: string;

  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsOptional()
  description?: string;
}
