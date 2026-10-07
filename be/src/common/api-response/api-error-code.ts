export const ApiErrorCode = {
  BadRequest: "BAD_REQUEST",
  CategoryCrudNotImplemented: "CATEGORY_CRUD_NOT_IMPLEMENTED",
  CategorySlugExists: "CATEGORY_SLUG_EXISTS",
  Conflict: "CONFLICT",
  Forbidden: "FORBIDDEN",
  InternalServerError: "INTERNAL_SERVER_ERROR",
  MediaImageRequired: "MEDIA_IMAGE_REQUIRED",
  MediaInvalidImageType: "MEDIA_INVALID_IMAGE_TYPE",
  MediaUploadNotConfigured: "MEDIA_UPLOAD_NOT_CONFIGURED",
  NotFound: "NOT_FOUND",
  TenantInactive: "TENANT_INACTIVE",
  TenantNotFound: "TENANT_NOT_FOUND",
  TenantRequired: "TENANT_REQUIRED",
  TenantSlugExists: "TENANT_SLUG_EXISTS",
  Unauthorized: "UNAUTHORIZED",
  ValidationFailed: "VALIDATION_FAILED"
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];
