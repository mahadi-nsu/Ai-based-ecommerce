import { HttpException, type HttpStatus } from "@nestjs/common";

import type { ApiErrorCode } from "./api-error-code.js";

export type ApiExceptionBody = {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
};

export class ApiException extends HttpException {
  constructor(status: HttpStatus, body: ApiExceptionBody) {
    super(body, status);
  }
}
