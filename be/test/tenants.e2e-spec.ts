import { TenantStatus } from "@prisma/client";
import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";

import { AppModule } from "@app/app.module.js";
import { PrismaService } from "@app/database/prisma.service.js";

describe("TenantsController (e2e)", () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

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

  beforeEach(async () => {
    await prisma.tenant.deleteMany();
  });

  afterAll(async () => {
    await prisma.tenant.deleteMany();
    await app.close();
  });

  it("creates and reads a tenant", async () => {
    const createResponse = await app.inject({
      method: "POST",
      url: "/api/platform/tenants",
      payload: {
        name: "Gadget Zone",
        slug: "gadget-zone",
        logoUrl: "https://res.cloudinary.com/demo/image/upload/sample.png",
        logoPublicId: "tenants/gadget-zone/logo"
      }
    });
    const created: {
      id: string;
      slug: string;
      status: TenantStatus;
      logoUrl: string;
      logoPublicId: string;
    } = createResponse.json();

    expect(createResponse.statusCode).toBe(201);
    expect(created).toMatchObject({
      slug: "gadget-zone",
      status: TenantStatus.ACTIVE,
      logoUrl: "https://res.cloudinary.com/demo/image/upload/sample.png",
      logoPublicId: "tenants/gadget-zone/logo"
    });

    const readResponse = await app.inject({
      method: "GET",
      url: `/api/platform/tenants/${created.id}`
    });

    expect(readResponse.statusCode).toBe(200);
    expect(readResponse.json()).toMatchObject({
      id: created.id,
      slug: "gadget-zone"
    });
  });

  it("rejects duplicate slugs", async () => {
    await prisma.tenant.create({
      data: {
        name: "Gadget Zone",
        slug: "gadget-zone"
      }
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/platform/tenants",
      payload: {
        name: "Gadget Zone Duplicate",
        slug: "gadget-zone"
      }
    });

    expect(response.statusCode).toBe(409);
  });

  it("updates tenant status", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Gadget Zone",
        slug: "gadget-zone"
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
      id: tenant.id,
      status: TenantStatus.SUSPENDED
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
  });
});
