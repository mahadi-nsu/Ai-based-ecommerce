import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { ApiResponseModule } from "./common/api-response/api-response.module.js";
import { HealthModule } from "./health/health.module.js";
import { ObservabilityModule } from "./observability/observability.module.js";
import { TenantContextModule } from "./tenant-context/tenant-context.module.js";
import { TenantsModule } from "./tenants/tenants.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"]
    }),
    ObservabilityModule,
    ApiResponseModule,
    TenantContextModule,
    HealthModule,
    TenantsModule
  ]
})
export class AppModule {}
