import { randomUUID } from "node:crypto";

import { TenantStatus } from "@prisma/client";
import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";

import { AppModule } from "@app/app.module.js";
import { PrismaService } from "@app/database/prisma.service.js";
import { TENANT_SLUG_HEADER } from "@app/tenant-context/tenant-context.constants.js";

type CategoryRouteCase = readonly [
  method: "POST" | "GET" | "PATCH" | "DELETE",
  url: string,
  payload?: Record<string, unknown>
];

type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    requestId: string;
  };
};

describe("CategoriesController (e2e)", () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let currentTestSlugs: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    app.setGlobalPrefix("api");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
      })
    );

    prisma = moduleRef.get(PrismaService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  beforeEach(() => {
    currentTestSlugs = [];
  });

  afterEach(async () => {
    await cleanupCurrentTestTenants(prisma, currentTestSlugs);
  });

  afterAll(async () => {
    await app.close();
  });

  it("rejects category routes without tenant context", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/categories",
      headers: {
        "x-request-id": "req_categories_missing_tenant"
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json<ApiErrorResponse>()).toMatchObject({
      success: false,
      error: {
        code: "TENANT_REQUIRED",
        message: "Tenant context is required"
      },
      meta: {
        requestId: "req_categories_missing_tenant"
      }
    });
  });

  it.each([
    ["POST", "/api/categories", { name: "Electronics", slug: "electronics" }],
    ["GET", "/api/categories", undefined],
    ["GET", "/api/categories/6b74484b-bc91-4516-a479-04cdb5dc34f2", undefined],
    ["PATCH", "/api/categories/6b74484b-bc91-4516-a479-04cdb5dc34f2", { name: "Updated" }],
    ["DELETE", "/api/categories/6b74484b-bc91-4516-a479-04cdb5dc34f2", undefined]
  ] satisfies CategoryRouteCase[])(
    "%s %s is wired and returns the pending implementation error",
    async (method, url, payload) => {
    const tenantSlug = await createActiveTenant();
    const response = await app.inject({
      method,
      url,
      headers: {
        [TENANT_SLUG_HEADER]: tenantSlug
      },
      payload
    });

    expect(response.statusCode).toBe(501);
    const body = response.json<ApiErrorResponse>();
    expect(body).toMatchObject({
      success: false,
      error: {
        code: "CATEGORY_CRUD_NOT_IMPLEMENTED",
        message: "Category CRUD logic is not implemented yet"
      }
    });
    expect(body.meta.requestId).toEqual(expect.any(String));
    }
  );

  it("validates category creation before reaching placeholder logic", async () => {
    const tenantSlug = await createActiveTenant();
    const response = await app.inject({
      method: "POST",
      url: "/api/categories",
      headers: {
        [TENANT_SLUG_HEADER]: tenantSlug
      },
      payload: {
        name: "E",
        slug: "Bad Slug"
      }
    });
    const body = response.json<ApiErrorResponse>();

    expect(response.statusCode).toBe(400);
    expect(body).toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_FAILED",
        message: "Validation failed"
      }
    });
    expect(body.error.details).toEqual(
      expect.arrayContaining([
        "name must be longer than or equal to 2 characters",
        "slug must be lowercase kebab-case"
      ])
    );
  });

  it("validates category updates before reaching placeholder logic", async () => {
    const tenantSlug = await createActiveTenant();
    const response = await app.inject({
      method: "PATCH",
      url: "/api/categories/6b74484b-bc91-4516-a479-04cdb5dc34f2",
      headers: {
        [TENANT_SLUG_HEADER]: tenantSlug
      },
      payload: {
        slug: "Bad Slug"
      }
    });
    const body = response.json<ApiErrorResponse>();

    expect(response.statusCode).toBe(400);
    expect(body).toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_FAILED",
        message: "Validation failed"
      }
    });
    expect(body.error.details).toEqual(expect.arrayContaining(["slug must be lowercase kebab-case"]));
  });

  async function createActiveTenant() {
    const slug = createTestSlug("category-shop");
    await prisma.tenant.create({
      data: {
        name: "Category Shop",
        slug,
        status: TenantStatus.ACTIVE
      }
    });

    return slug;
  }

  function createTestSlug(prefix: string) {
    const slug = `${prefix}-${randomUUID().slice(0, 8)}`;
    currentTestSlugs.push(slug);

    return slug;
  }
});

async function cleanupCurrentTestTenants(prisma: PrismaService, slugs: string[]) {
  if (slugs.length === 0) {
    return;
  }

  await prisma.tenant.deleteMany({
    where: {
      slug: {
        in: slugs
      }
    }
  });
}
