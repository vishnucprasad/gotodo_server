import { Logger, NotFoundException } from '@nestjs/common';
import { BaseEntity } from './base-entity.schema';
import {
  ClientSession,
  Connection,
  FilterQuery,
  Model,
  QueryOptions,
  SaveOptions,
  Types,
  UpdateQuery,
} from 'mongoose';

export abstract class BaseEntityRepository<TEntity extends BaseEntity> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly model: Model<TEntity>,
    protected readonly connection: Connection,
  ) {}

  async create(
    document: Omit<TEntity, '_id'>,
    options?: SaveOptions,
  ): Promise<TEntity> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (await createdDocument.save(options)) as TEntity;
  }

  async findOne(filterQuery: FilterQuery<TEntity>): Promise<TEntity> {
    const document = await this.model.findOne(filterQuery, {}, { lean: true });

    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found.');
    }

    return document as TEntity;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TEntity>,
    update: UpdateQuery<TEntity>,
    options?: QueryOptions<TEntity>,
  ) {
    const document = await this.model.findOneAndUpdate(filterQuery, update, {
      lean: true,
      new: true,
      ...options,
    });

    if (!document) {
      this.logger.warn(`Document not found with filterQuery:`, filterQuery);
      throw new NotFoundException('Document not found.');
    }

    return document;
  }

  async upsert(filterQuery: FilterQuery<TEntity>, document: Partial<TEntity>) {
    return this.model.findOneAndUpdate(filterQuery, document, {
      lean: true,
      upsert: true,
      new: true,
    });
  }

  async find(filterQuery: FilterQuery<TEntity>) {
    return this.model.find(filterQuery, {}, { lean: true });
  }

  async startTransaction(): Promise<ClientSession> {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }
}
