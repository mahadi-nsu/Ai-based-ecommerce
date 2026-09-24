import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from "@nestjs/common";

import { RequestContextService } from "../../observability/request-context/request-context.service.js";
import { ApiErrorCode } from "./api-error-code.js";
import type { ApiErrorResponse } from "./api-response.types.js";

type HttpExceptionResponse = string | {
  code?: string;
  message?: string | string[];
  error?: string;
  details?: unknown;
  statusCode?: number;
};

type HttpResponseLike = {
  status: (statusCode: number) => {
    send: (body: unknown) => void;
  };
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(private readonly requestContextService: RequestContextService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<HttpResponseLike>();
    const statusCode: HttpStatus =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const error = this.toApiError(exception, statusCode);

    response.status(statusCode).send({
      success: false,
      error,
      meta: {
        requestId: this.requestContextService.getRequestId()
      }
    } satisfies ApiErrorResponse);
  }

  private toApiError(exception: unknown, statusCode: number) {
    if (!(exception instanceof HttpException)) {
      return {
        code: ApiErrorCode.InternalServerError,
        message: "Internal server error"
      };
    }

    const exceptionResponse = exception.getResponse() as HttpExceptionResponse;

    if (typeof exceptionResponse === "string") {
      return {
        code: this.defaultCode(statusCode),
        message: exceptionResponse
      };
    }

    if (exception instanceof BadRequestException && Array.isArray(exceptionResponse.message)) {
      return {
        code: ApiErrorCode.ValidationFailed,
        message: "Validation failed",
        details: exceptionResponse.message
      };
    }

    return {
      code: exceptionResponse.code ?? this.defaultCode(statusCode),
      message: readMessage(exceptionResponse),
      details: exceptionResponse.details
    };
  }

  private defaultCode(statusCode: HttpStatus) {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return ApiErrorCode.BadRequest;
      case HttpStatus.UNAUTHORIZED:
        return ApiErrorCode.Unauthorized;
      case HttpStatus.FORBIDDEN:
        return ApiErrorCode.Forbidden;
      case HttpStatus.NOT_FOUND:
        return ApiErrorCode.NotFound;
      case HttpStatus.CONFLICT:
        return ApiErrorCode.Conflict;
      default:
        return ApiErrorCode.InternalServerError;
    }
  }
}

function readMessage(exceptionResponse: Exclude<HttpExceptionResponse, string>) {
  if (typeof exceptionResponse.message === "string") {
    return exceptionResponse.message;
  }

  if (Array.isArray(exceptionResponse.message)) {
    return "Validation failed";
  }

  return exceptionResponse.error ?? "Request failed";
}
