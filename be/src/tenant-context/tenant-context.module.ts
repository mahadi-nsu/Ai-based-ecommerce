import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module.js";
import { ObservabilityModule } from "../observability/observability.module.js";
import { TenantContextMiddleware } from "./tenant-context.middleware.js";
import { TenantContextService } from "./tenant-context.service.js";

@Module({
  imports: [DatabaseModule, ObservabilityModule],
  providers: [TenantContextMiddleware, TenantContextService],
  exports: [TenantContextService]
})
export class TenantContextModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantContextMiddleware).forRoutes("*");
  }
}
