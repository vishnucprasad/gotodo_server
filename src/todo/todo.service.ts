import { Injectable, NotFoundException } from '@nestjs/common';
import { Todo } from './schemas';
import { ChangeStatusDto, CreateTodoDto, EditTodoDto, GetTodoDto } from './dto';
import { TodoRepository } from './repositories';
import { Types } from 'mongoose';
import { CategorySchema } from '../category/schemas';

@Injectable()
export class TodoService {
  constructor(private readonly todoRepo: TodoRepository) {}

  public async getTodos(userId: string, dto: GetTodoDto): Promise<Todo[]> {
    return await this.todoRepo.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          date: {
            $gte: new Date(dto.from),
            $lte: new Date(dto.to),
          },
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
          categoryId: dto.categoryId && new Types.ObjectId(dto.categoryId),
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

    if (dto.categoryId) {
      dto.categoryId = new Types.ObjectId(dto.categoryId);
    }

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

  public async changeStatus(
    userId: string,
    todoId: string,
    dto: ChangeStatusDto,
  ): Promise<Todo> {
    const session = await this.todoRepo.startTransaction();

    try {
      const todo = await this.todoRepo.findOneAndUpdate(
        { _id: new Types.ObjectId(todoId), userId: new Types.ObjectId(userId) },
        { status: dto.status },
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

  public async deleteTodo(userId: string, todoId: string): Promise<void> {
    await this.todoRepo.findOneAndDelete({
      _id: new Types.ObjectId(todoId),
      userId: new Types.ObjectId(userId),
    });
  }
}
