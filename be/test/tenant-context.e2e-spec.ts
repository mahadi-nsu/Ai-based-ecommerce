import { randomUUID } from "node:crypto";

import { TenantStatus } from "@prisma/client";
import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";

import { AppModule } from "@app/app.module.js";
import { PrismaService } from "@app/database/prisma.service.js";
import { TENANT_SLUG_HEADER } from "@app/tenant-context/tenant-context.constants.js";

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

describe("TenantContextMiddleware (e2e)", () => {
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

  it("rejects tenant-owned routes without tenant context", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/products",
      headers: {
        "x-request-id": "req_missing_tenant"
      }
    });
    const body = response.json<ApiErrorResponse>();

    expect(response.statusCode).toBe(400);
    expect(body).toMatchObject({
      success: false,
      error: {
        code: "TENANT_REQUIRED",
        message: "Tenant context is required"
      },
      meta: {
        requestId: "req_missing_tenant"
      }
    });
  });

  it("rejects unknown tenant slugs", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/products",
      headers: {
        [TENANT_SLUG_HEADER]: createTestSlug("missing-shop")
      }
    });
    const body = response.json<ApiErrorResponse>();

    expect(response.statusCode).toBe(404);
    expect(body).toMatchObject({
      success: false,
      error: {
        code: "TENANT_NOT_FOUND",
        message: "Tenant not found"
      }
    });
  });

  it("rejects inactive tenants", async () => {
    const slug = createTestSlug("suspended-shop");
    await prisma.tenant.create({
      data: {
        name: "Suspended Shop",
        slug,
        status: TenantStatus.SUSPENDED
      }
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/products",
      headers: {
        [TENANT_SLUG_HEADER]: slug
      }
    });
    const body = response.json<ApiErrorResponse>();

    expect(response.statusCode).toBe(403);
    expect(body).toMatchObject({
      success: false,
      error: {
        code: "TENANT_INACTIVE",
        message: "Tenant is not active",
        details: {
          status: TenantStatus.SUSPENDED
        }
      }
    });
  });

  it("allows active tenant requests to continue to route handling", async () => {
    const slug = createTestSlug("active-shop");
    await prisma.tenant.create({
      data: {
        name: "Active Shop",
        slug,
        status: TenantStatus.ACTIVE
      }
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/products",
      headers: {
        [TENANT_SLUG_HEADER]: slug
      }
    });
    const body = response.json<ApiErrorResponse>();

    expect(response.statusCode).toBe(404);
    expect(body).toMatchObject({
      success: false,
      error: {
        code: "NOT_FOUND"
      }
    });
  });

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
