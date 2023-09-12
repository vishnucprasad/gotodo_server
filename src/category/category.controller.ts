import { Body, Controller, Post } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './schemas';
import { CreateCategoryDto } from './dto';
import { CurrentUser } from '@app/common';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  public createCategory(
    @CurrentUser('_id') userId: string,
    @Body() dto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.createCategory(userId, dto);
  }
}
