import { Injectable, NotFoundException } from '@nestjs/common';
import { Todo } from './schemas';
import { CreateTodoDto, EditTodoDto } from './dto';
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

  public async getTodoById(userId: string, todoId: string): Promise<Todo> {
    const todo = await this.todoRepo.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(todoId),
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

    if (!todo[0]) throw new NotFoundException('Todo not found');
    return todo[0];
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

  public async editTodo(
    userId: string,
    todoId: string,
    dto: EditTodoDto,
  ): Promise<Todo> {
    const session = await this.todoRepo.startTransaction();

    try {
      const todo = await this.todoRepo.findOneAndUpdate(
        { _id: new Types.ObjectId(todoId), userId: new Types.ObjectId(userId) },
        { ...dto },
        { session, new: true, lean: true },
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
