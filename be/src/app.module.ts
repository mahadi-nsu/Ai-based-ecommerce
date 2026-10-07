import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { CategoriesModule } from "./categories/categories.module.js";
import { ApiResponseModule } from "./common/api-response/api-response.module.js";
import { HealthModule } from "./health/health.module.js";
import { MediaModule } from "./media/media.module.js";
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
    CategoriesModule,
    MediaModule,
    HealthModule,
    TenantsModule
  ]
})
export class AppModule {}
