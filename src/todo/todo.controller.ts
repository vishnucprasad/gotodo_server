import { Body, Controller, Post } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { Todo } from './schemas';
import { CurrentUser } from '@app/common';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post('create')
  public createTodo(
    @CurrentUser('_id') userId: string,
    @Body() dto: CreateTodoDto,
  ): Promise<Todo> {
    return this.todoService.createTodo(userId, dto);
  }
}
