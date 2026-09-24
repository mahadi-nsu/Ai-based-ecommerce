import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from "@nestjs/common";
import { catchError, Observable, tap, throwError } from "rxjs";

import { PinoLoggerService } from "../logger/pino-logger.service.js";
import { RequestContextService } from "../request-context/request-context.service.js";

type RequestLike = {
  method?: string;
  url?: string;
  routeOptions?: {
    url?: string;
  };
  headers?: Record<string, string | string[] | undefined>;
  ip?: string;
};

type ResponseLike = {
  statusCode?: number;
};

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly requestContextService: RequestContextService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = performance.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<RequestLike>();
    const response = httpContext.getResponse<ResponseLike>();

    return next.handle().pipe(
      tap(() => {
        this.logRequest("HTTP request completed", request, response, startedAt);
      }),
      catchError((error: unknown) => {
        this.logRequest("HTTP request failed", request, response, startedAt, error);

        return throwError(() => error);
      })
    );
  }

  private logRequest(
    message: string,
    request: RequestLike,
    response: ResponseLike,
    startedAt: number,
    error?: unknown
  ) {
    const durationMs = Math.round((performance.now() - startedAt) * 100) / 100;
    const statusCode =
      error instanceof HttpException ? error.getStatus() : (response.statusCode ?? (error ? 500 : 200));

    this.logger.write(error ? "error" : "info", message, {
      requestId: this.requestContextService.getRequestId(),
      method: request.method,
      path: request.url,
      route: request.routeOptions?.url,
      statusCode,
      durationMs,
      userAgent: readHeader(request.headers, "user-agent"),
      ip: request.ip,
      err: error instanceof Error ? { message: error.message, stack: error.stack } : undefined
    });
  }
}

function readHeader(headers: Record<string, string | string[] | undefined> | undefined, name: string) {
  const value = headers?.[name];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
