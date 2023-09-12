import { BaseEntityRepository } from '@app/database';
import { Injectable, Logger } from '@nestjs/common';
import { Category } from '../schemas';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

@Injectable()
export class CategoryRepository extends BaseEntityRepository<Category> {
  protected logger: Logger = new Logger(CategoryRepository.name);

  constructor(
    @InjectModel(Category.name)
    protected readonly categoryModel: Model<Category>,
    @InjectConnection()
    protected readonly connection: Connection,
  ) {
    super(categoryModel, connection);
  }
}
