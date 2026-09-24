export const ApiErrorCode = {
  BadRequest: "BAD_REQUEST",
  Conflict: "CONFLICT",
  Forbidden: "FORBIDDEN",
  InternalServerError: "INTERNAL_SERVER_ERROR",
  NotFound: "NOT_FOUND",
  TenantNotFound: "TENANT_NOT_FOUND",
  TenantSlugExists: "TENANT_SLUG_EXISTS",
  Unauthorized: "UNAUTHORIZED",
  ValidationFailed: "VALIDATION_FAILED"
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];
