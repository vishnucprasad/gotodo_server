import { Injectable } from '@nestjs/common';
import { Todo } from './schemas';
import { CreateTodoDto } from './dto/create-todo.dto';
import { TodoRepository } from './repositories';
import { Types } from 'mongoose';
import { CategorySchema } from '../category/schemas';

@Injectable()
export class TodoService {
  constructor(private readonly todoRepo: TodoRepository) {}

  public async getTodos(userId: string): Promise<Todo[]> {
    return await this.todoRepo.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: CategorySchema.get('collection'),
          foreignField: '_id',
          localField: 'categoryId',
          as: 'category',
        },
      },
      {
        $set: {
          category: { $first: '$category' },
        },
      },
    ]);
  }

  public async createTodo(userId: string, dto: CreateTodoDto): Promise<Todo> {
    const session = await this.todoRepo.startTransaction();

    try {
      const todo = await this.todoRepo.create(
        {
          userId: new Types.ObjectId(userId),
          categoryId: new Types.ObjectId(dto.categoryId),
          task: dto.task,
          date: dto.date,
          description: dto.description,
        },
        { session },
      );
      await session.commitTransaction();
      return todo;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
