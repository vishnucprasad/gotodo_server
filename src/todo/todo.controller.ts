import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { ChangeStatusDto, CreateTodoDto, EditTodoDto, GetTodoDto } from './dto';
import { Todo } from './schemas';
import { CurrentUser } from '@app/common';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get('all')
  public getTodos(
    @CurrentUser('_id') userId: string,
    @Query() dto: GetTodoDto,
  ): Promise<Todo[]> {
    return this.todoService.getTodos(userId, dto);
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

  @Patch(':id')
  public editTodo(
    @CurrentUser('_id') userId: string,
    @Param('id') todoId: string,
    @Body() dto: EditTodoDto,
  ): Promise<Todo> {
    return this.todoService.editTodo(userId, todoId, dto);
  }

  @Patch('status/:id')
  public changeStatus(
    @CurrentUser('_id') userId: string,
    @Param('id') todoId: string,
    @Body() dto: ChangeStatusDto,
  ) {
    return this.todoService.changeStatus(userId, todoId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  public deleteTodo(
    @CurrentUser('_id') userId: string,
    @Param('id') todoId: string,
  ): Promise<void> {
    return this.todoService.deleteTodo(userId, todoId);
  }
}
