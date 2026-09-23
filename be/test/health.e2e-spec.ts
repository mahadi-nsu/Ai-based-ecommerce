import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";

import { AppModule } from "@app/app.module.js";

describe("HealthController (e2e)", () => {
  let app: NestFastifyApplication;

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

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/api/health (GET)", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/health",
      headers: {
        "x-request-id": "req_test_health"
      }
    });
    const body: {
      status: string;
      service: string;
      timestamp: string;
    } = response.json();

    expect(response.statusCode).toBe(200);
    expect(response.headers["x-request-id"]).toBe("req_test_health");
    expect(body).toMatchObject({
      status: "ok",
      service: "ecommerce-ai-backend"
    });
    expect(body.timestamp).toEqual(expect.any(String));
  });
});
