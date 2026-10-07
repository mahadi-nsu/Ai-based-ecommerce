import { jest } from "@jest/globals";
import type { Category } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { ApiErrorCode } from "../common/api-response/api-error-code.js";
import type { PrismaService } from "../database/prisma.service.js";
import type { TenantContextService } from "../tenant-context/tenant-context.service.js";
import { CategoriesService } from "./categories.service.js";

type CategoryCreate = (args: { data: Record<string, unknown> }) => Promise<Category>;

type PrismaMock = {
  category: {
    create: jest.Mock<CategoryCreate>;
  };
};

type TenantContextMock = Pick<TenantContextService, "getRequiredTenantId"> & {
  getRequiredTenantId: jest.Mock<() => string>;
};

describe("CategoriesService", () => {
  let prisma: PrismaMock;
  let tenantContext: TenantContextMock;
  let service: CategoriesService;

  beforeEach(() => {
    prisma = createPrismaMock();
    tenantContext = createTenantContextMock();
    service = new CategoriesService(
      prisma as unknown as PrismaService,
      tenantContext as unknown as TenantContextService
    );
  });

  it("creates a category inside the current tenant", async () => {
    const category = createCategory();
    prisma.category.create.mockResolvedValue(category);

    await expect(
      service.createCategory({
        name: "Electronics",
        slug: "electronics",
        description: "Devices and accessories",
        imageUrl: "https://res.cloudinary.com/demo/image/upload/categories/electronics.png",
        imagePublicId: "categories/electronics"
      })
    ).resolves.toEqual({
      id: category.id,
      name: "Electronics",
      slug: "electronics",
      description: "Devices and accessories",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/categories/electronics.png",
      imagePublicId: "categories/electronics",
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString()
    });
    expect(tenantContext.getRequiredTenantId).toHaveBeenCalledTimes(1);
    expect(prisma.category.create).toHaveBeenCalledWith({
      data: {
        tenantId: "tenant-id",
        name: "Electronics",
        slug: "electronics",
        description: "Devices and accessories",
        imageUrl: "https://res.cloudinary.com/demo/image/upload/categories/electronics.png",
        imagePublicId: "categories/electronics"
      }
    });
  });

  it("returns a conflict when the category slug already exists in the tenant", async () => {
    prisma.category.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test"
      })
    );

    await expect(
      service.createCategory({
        name: "Electronics",
        slug: "electronics"
      })
    ).rejects.toMatchObject({
      response: {
        code: ApiErrorCode.CategorySlugExists,
        message: "Category slug already exists"
      }
    });
  });

  it.each([
    ["listCategories", () => service.listCategories()],
    ["getCategoryById", () => service.getCategoryById("6b74484b-bc91-4516-a479-04cdb5dc34f2")],
    [
      "updateCategory",
      () => service.updateCategory("6b74484b-bc91-4516-a479-04cdb5dc34f2", { name: "Updated" })
    ],
    ["deleteCategory", () => service.deleteCategory("6b74484b-bc91-4516-a479-04cdb5dc34f2")]
  ])("%s requires tenant context before pending implementation logic", (_name, act) => {
    expect(readThrownApiErrorCode(act)).toBe(ApiErrorCode.CategoryCrudNotImplemented);
    expect(tenantContext.getRequiredTenantId).toHaveBeenCalledTimes(1);
  });
});

function createPrismaMock(): PrismaMock {
  return {
    category: {
      create: jest.fn<CategoryCreate>()
    }
  };
}

function createTenantContextMock() {
  return {
    getRequiredTenantId: jest.fn(() => "tenant-id")
  } satisfies TenantContextMock;
}

function createCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: "6b74484b-bc91-4516-a479-04cdb5dc34f2",
    tenantId: "tenant-id",
    name: "Electronics",
    slug: "electronics",
    description: "Devices and accessories",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/categories/electronics.png",
    imagePublicId: "categories/electronics",
    deletedAt: null,
    createdAt: new Date("2026-10-07T00:00:00.000Z"),
    updatedAt: new Date("2026-10-07T00:00:00.000Z"),
    ...overrides
  };
}

function readThrownApiErrorCode(act: () => unknown) {
  try {
    act();
    return undefined;
  } catch (error) {
    return readApiErrorCode(error);
  }
}

function readApiErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return undefined;
  }

  const response = error.response;

  if (!response || typeof response !== "object" || !("code" in response)) {
    return undefined;
  }

  return response.code;
}
