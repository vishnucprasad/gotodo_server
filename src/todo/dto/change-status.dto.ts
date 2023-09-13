import { IsEnum, IsNotEmpty } from 'class-validator';
import { TodoStatus } from '../types';

export class ChangeStatusDto {
  @IsEnum(TodoStatus)
  @IsNotEmpty()
  status: TodoStatus;
}
