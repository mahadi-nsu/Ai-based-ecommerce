import "reflect-metadata";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";

import { AppModule } from "./app.module.js";
import { PinoLoggerService } from "./observability/logger/pino-logger.service.js";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    bufferLogs: true
  });

  app.useLogger(app.get(PinoLoggerService));

  app.setGlobalPrefix(process.env.API_PREFIX ?? "api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  const host = process.env.HOST ?? "127.0.0.1";
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, host);
}

void bootstrap();
