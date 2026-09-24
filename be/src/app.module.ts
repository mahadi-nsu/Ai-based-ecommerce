import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { HealthModule } from "./health/health.module.js";
import { ObservabilityModule } from "./observability/observability.module.js";
import { TenantsModule } from "./tenants/tenants.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"]
    }),
    ObservabilityModule,
    HealthModule,
    TenantsModule
  ]
})
export class AppModule {}
