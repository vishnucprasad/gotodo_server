import { IsOptional, IsString, Length } from 'class-validator';

export class EditCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @Length(7)
  color?: string;
}
