import { HttpStatus, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { ApiErrorCode } from "../common/api-response/api-error-code.js";
import { ApiException } from "../common/api-response/api-exception.js";
import { TenantContextService } from "../tenant-context/tenant-context.service.js";
import type { CreateCategoryDto } from "./dto/create-category.dto.js";
import type { UpdateCategoryDto } from "./dto/update-category.dto.js";
import { PrismaService } from "@app/database/prisma.service.js";
import { mapCategoryToResponse } from "./category.mapper.js";

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService
  ) {}

  async createCategory(dto: CreateCategoryDto) {
    const tenantId = this.tenantContext.getRequiredTenantId();
  
    try {
      const category = await this.prisma.category.create({
        data: {
          tenantId,
          name: dto.name,
          slug: dto.slug,
          description: dto.description,
          imageUrl: dto.imageUrl,
          imagePublicId: dto.imagePublicId
        }
      });
  
      return mapCategoryToResponse(category);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ApiException(HttpStatus.CONFLICT, {
          code: ApiErrorCode.CategorySlugExists,
          message: "Category slug already exists"
        });
      }
  
      throw error;
    }
  }

  listCategories() {
    this.tenantContext.getRequiredTenantId();
    throwCategoryCrudNotImplemented();
  }

  getCategoryById(id: string) {
    void id;
    this.tenantContext.getRequiredTenantId();
    throwCategoryCrudNotImplemented();
  }

  updateCategory(id: string, dto: UpdateCategoryDto) {
    void id;
    void dto;
    this.tenantContext.getRequiredTenantId();
    throwCategoryCrudNotImplemented();
  }

  deleteCategory(id: string) {
    void id;
    this.tenantContext.getRequiredTenantId();
    throwCategoryCrudNotImplemented();
  }
}

function throwCategoryCrudNotImplemented(): never {
  throw new ApiException(HttpStatus.NOT_IMPLEMENTED, {
    code: ApiErrorCode.CategoryCrudNotImplemented,
    message: "Category CRUD logic is not implemented yet"
  });
}


// Helper functions
function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}