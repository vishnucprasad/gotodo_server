import { Logger, NotFoundException } from '@nestjs/common';
import { BaseEntity } from './base-entity.schema';
import {
  AggregateOptions,
  ClientSession,
  Connection,
  FilterQuery,
  Model,
  PipelineStage,
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

  public async create(
    document: Omit<TEntity, '_id'>,
    options?: SaveOptions,
  ): Promise<TEntity> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (await createdDocument.save(options)) as TEntity;
  }

  public async findOne(filterQuery: FilterQuery<TEntity>): Promise<TEntity> {
    const document = await this.model.findOne(filterQuery, {}, { lean: true });
    return document as TEntity;
  }

  public async findOneAndUpdate(
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

  public async upsert(
    filterQuery: FilterQuery<TEntity>,
    document: Partial<TEntity>,
  ) {
    return this.model.findOneAndUpdate(filterQuery, document, {
      lean: true,
      upsert: true,
      new: true,
    });
  }

  public async findOneAndDelete(filterQuery: FilterQuery<TEntity>) {
    const document = await this.model.findOneAndDelete(filterQuery, {
      lean: true,
    });

    if (!document) {
      this.logger.warn(`Document not found with filterQuery:`, filterQuery);
      throw new NotFoundException('Document not found.');
    }

    return document;
  }

  public async find(filterQuery: FilterQuery<TEntity>) {
    return this.model.find(filterQuery, {}, { lean: true });
  }

  public async aggregate(
    pipeline: PipelineStage[],
    options?: AggregateOptions,
  ) {
    return this.model.aggregate<TEntity>(pipeline, options);
  }

  public async startTransaction(): Promise<ClientSession> {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }
}
