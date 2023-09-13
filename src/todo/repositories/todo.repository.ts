import { BaseEntityRepository } from '@app/database';
import { Injectable, Logger } from '@nestjs/common';
import { Todo } from '../schemas';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

@Injectable()
export class TodoRepository extends BaseEntityRepository<Todo> {
  protected readonly logger: Logger = new Logger(TodoRepository.name);

  constructor(
    @InjectModel(Todo.name) todoModel: Model<Todo>,
    @InjectConnection() connection: Connection,
  ) {
    super(todoModel, connection);
  }
}
