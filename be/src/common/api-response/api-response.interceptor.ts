import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { map, Observable } from "rxjs";

import { RequestContextService } from "../../observability/request-context/request-context.service.js";
import { SKIP_API_RESPONSE_WRAP } from "./api-response.decorator.js";
import type { ApiSuccessResponse } from "./api-response.types.js";

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly requestContextService: RequestContextService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (this.shouldSkip(context)) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data: unknown): ApiSuccessResponse<unknown> => ({
        success: true,
        data: data ?? null,
        meta: {
          requestId: this.requestContextService.getRequestId()
        }
      }))
    );
  }

  private shouldSkip(context: ExecutionContext) {
    return this.reflector.getAllAndOverride<boolean>(SKIP_API_RESPONSE_WRAP, [
      context.getHandler(),
      context.getClass()
    ]);
  }
}
