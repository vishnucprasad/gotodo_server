import { Body, Controller, Get, Post } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { Todo } from './schemas';
import { CurrentUser } from '@app/common';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get('all')
  public getTodos(@CurrentUser('_id') userId: string): Promise<Todo[]> {
    return this.todoService.getTodos(userId);
  }

  @Post('create')
  public createTodo(
    @CurrentUser('_id') userId: string,
    @Body() dto: CreateTodoDto,
  ): Promise<Todo> {
    return this.todoService.createTodo(userId, dto);
  }
}
