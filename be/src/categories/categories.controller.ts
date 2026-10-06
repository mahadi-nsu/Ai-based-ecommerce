import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";

import { CategoriesService } from "./categories.service.js";
import { CreateCategoryDto } from "./dto/create-category.dto.js";
import { UpdateCategoryDto } from "./dto/update-category.dto.js";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @Get()
  listCategories() {
    return this.categoriesService.listCategories();
  }

  @Get(":id")
  getCategoryById(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.categoriesService.getCategoryById(id);
  }

  @Patch(":id")
  updateCategory(@Param("id", new ParseUUIDPipe()) id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.updateCategory(id, dto);
  }

  @Delete(":id")
  deleteCategory(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.categoriesService.deleteCategory(id);
  }
}
