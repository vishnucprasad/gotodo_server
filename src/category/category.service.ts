import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './repositories';
import { CreateCategoryDto } from './dto';
import { Category } from './schemas';
import { Types } from 'mongoose';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepository) {}

  public async getCategories(userId: string): Promise<Category[]> {
    return await this.categoryRepo.find({
      userId: new Types.ObjectId(userId),
    });
  }

  public async createCategory(
    userId: string,
    dto: CreateCategoryDto,
  ): Promise<Category> {
    const session = await this.categoryRepo.startTransaction();

    try {
      const category = await this.categoryRepo.create(
        {
          userId: new Types.ObjectId(userId),
          name: dto.name,
          color: dto.color,
        },
        { session },
      );
      await session.commitTransaction();
      return category;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
