export type ApiMeta = {
  requestId?: string;
};

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  meta?: ApiMeta;
};

export type ApiErrorResponse = {
  success: false;
  error: ApiError;
  meta?: ApiMeta;
};
