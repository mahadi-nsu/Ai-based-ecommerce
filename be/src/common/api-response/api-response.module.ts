import { Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";

import { ObservabilityModule } from "../../observability/observability.module.js";
import { ApiExceptionFilter } from "./api-exception.filter.js";
import { ApiResponseInterceptor } from "./api-response.interceptor.js";

@Module({
  imports: [ObservabilityModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter
    }
  ]
})
export class ApiResponseModule {}
