import { BaseEntityRepository } from '@app/database';
import { Injectable, Logger } from '@nestjs/common';
import { User } from '../schemas';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

@Injectable()
export class UserRepository extends BaseEntityRepository<User> {
  protected readonly logger = new Logger(UserRepository.name);

  constructor(
    @InjectModel(User.name) protected readonly userModel: Model<User>,
    @InjectConnection() protected readonly connection: Connection,
  ) {
    super(userModel, connection);
  }
}
