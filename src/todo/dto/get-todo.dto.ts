import { IsDateString, IsNotEmpty } from 'class-validator';

export class GetTodoDto {
  @IsNotEmpty()
  @IsDateString()
  from: Date;

  @IsNotEmpty()
  @IsDateString()
  to: Date;
}
