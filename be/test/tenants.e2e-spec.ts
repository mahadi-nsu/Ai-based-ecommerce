import { randomUUID } from "node:crypto";

import { TenantStatus } from "@prisma/client";
import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";

import { AppModule } from "@app/app.module.js";
import { PrismaService } from "@app/database/prisma.service.js";
import type { TenantResponse } from "@app/tenants/tenant.mapper.js";

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  meta: {
    requestId: string;
  };
};

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

describe("TenantsController (e2e)", () => {
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

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await cleanupCurrentTestTenants(prisma, currentTestSlugs);
  });

  it("creates and reads a tenant", async () => {
    const slug = createTestSlug("gadget-zone");
    const createResponse = await app.inject({
      method: "POST",
      url: "/api/platform/tenants",
      payload: {
        name: "Gadget Zone",
        slug,
        logoUrl: "https://res.cloudinary.com/demo/image/upload/sample.png",
        logoPublicId: "tenants/gadget-zone/logo"
      }
    });
    const created: {
      success: true;
      data: TenantResponse;
    } = createResponse.json();

    expect(createResponse.statusCode).toBe(201);
    expect(created).toMatchObject({
      success: true,
      data: {
      slug,
      status: TenantStatus.ACTIVE,
      logoUrl: "https://res.cloudinary.com/demo/image/upload/sample.png",
      logoPublicId: "tenants/gadget-zone/logo"
      }
    });

    const readResponse = await app.inject({
      method: "GET",
      url: `/api/platform/tenants/${created.data.id}`
    });

    expect(readResponse.statusCode).toBe(200);
    const readBody = readResponse.json<ApiSuccessResponse<TenantResponse>>();
    expect(readBody).toMatchObject({
      success: true,
      data: {
        id: created.data.id,
        slug
      }
    });
    expect(readBody.meta.requestId).toEqual(expect.any(String));
  });

  it("rejects duplicate slugs", async () => {
    const slug = createTestSlug("gadget-zone");
    await prisma.tenant.create({
      data: {
        name: "Gadget Zone",
        slug
      }
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/platform/tenants",
      payload: {
        name: "Gadget Zone Duplicate",
        slug
      }
    });

    expect(response.statusCode).toBe(409);
    const body = response.json<ApiErrorResponse>();
    expect(body).toMatchObject({
      success: false,
      error: {
        code: "TENANT_SLUG_EXISTS",
        message: "Tenant slug already exists"
      }
    });
    expect(body.meta.requestId).toEqual(expect.any(String));
  });

  it("updates tenant status", async () => {
    const slug = createTestSlug("gadget-zone");
    const tenant = await prisma.tenant.create({
      data: {
        name: "Gadget Zone",
        slug
      }
    });

    const response = await app.inject({
      method: "PATCH",
      url: `/api/platform/tenants/${tenant.id}/status`,
      payload: {
        status: TenantStatus.SUSPENDED
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      success: true,
      data: {
        id: tenant.id,
        status: TenantStatus.SUSPENDED
      }
    });
  });

  it("validates slug format", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/platform/tenants",
      payload: {
        name: "Bad Slug Store",
        slug: "Bad Slug"
      }
    });

    expect(response.statusCode).toBe(400);
    const body = response.json<ApiErrorResponse>();
    expect(body).toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_FAILED",
        message: "Validation failed"
      }
    });
    expect(body.error.details).toEqual(expect.arrayContaining(["slug must be lowercase kebab-case"]));
  });

  it("wraps list responses with data and request metadata", async () => {
    const slug = createTestSlug("gadget-zone");
    await prisma.tenant.create({
      data: {
        name: "Gadget Zone",
        slug
      }
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/platform/tenants",
      headers: {
        "x-request-id": "req_tenants_list"
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<ApiSuccessResponse<TenantResponse[]>>();
    expect(body).toMatchObject({
      success: true,
      meta: {
        requestId: "req_tenants_list"
      }
    });
    expect(body.data).toEqual(expect.arrayContaining([expect.objectContaining({ slug })]));
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
