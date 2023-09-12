import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './schemas';
import { CreateCategoryDto, EditCategoryDto } from './dto';
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

  @Get(':id')
  public getCategoryById(
    @CurrentUser('_id') userId: string,
    @Param('id') categoryId: string,
  ): Promise<Category> {
    return this.categoryService.getCategoryById(userId, categoryId);
  }

  @Post('create')
  public createCategory(
    @CurrentUser('_id') userId: string,
    @Body() dto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.createCategory(userId, dto);
  }

  @Patch(':id')
  public editCategory(
    @CurrentUser('_id') userId: string,
    @Param('id') categoryId: string,
    @Body() dto: EditCategoryDto,
  ): Promise<Category> {
    return this.categoryService.editCategory(userId, categoryId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  public deleteCategory(
    @CurrentUser('_id') userId: string,
    @Param('id') categoryId: string,
  ): Promise<void> {
    return this.categoryService.deleteCategory(userId, categoryId);
  }
}
