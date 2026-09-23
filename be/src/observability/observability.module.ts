import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";

import { PinoLoggerService } from "./logger/pino-logger.service.js";
import { RequestContextMiddleware } from "./request-context/request-context.middleware.js";
import { RequestContextService } from "./request-context/request-context.service.js";
import { RequestLoggingInterceptor } from "./request-logging/request-logging.interceptor.js";

@Module({
  providers: [
    RequestContextService,
    RequestContextMiddleware,
    PinoLoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor
    }
  ],
  exports: [RequestContextService, PinoLoggerService]
})
export class ObservabilityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes("*");
  }
}
