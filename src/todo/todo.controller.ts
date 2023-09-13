import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

  @Get(':id')
  public getTodoById(
    @CurrentUser('_id') userId: string,
    @Param('id') todoId: string,
  ): Promise<Todo> {
    return this.todoService.getTodoById(userId, todoId);
  }

  @Post('create')
  public createTodo(
    @CurrentUser('_id') userId: string,
    @Body() dto: CreateTodoDto,
  ): Promise<Todo> {
    return this.todoService.createTodo(userId, dto);
  }
}
