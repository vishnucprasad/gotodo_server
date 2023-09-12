import { Body, Controller, Get, Post } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './schemas';
import { CreateCategoryDto } from './dto';
import { CurrentUser } from '@app/common';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('all')
  public getCategories(
    @CurrentUser('_id') userId: string,
  ): Promise<Category[]> {
    return this.categoryService.getCategories(userId);
  }

  @Post('create')
  public createCategory(
    @CurrentUser('_id') userId: string,
    @Body() dto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.createCategory(userId, dto);
  }
}
