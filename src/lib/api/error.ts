export const API_ERROR_CODES = [
  "INVALID_PARAMS",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "INTERNAL_ERROR",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public details: Record<string, unknown> = {},
    public status: number = 400
  ) {
    super(code);
    this.name = "ApiError";
  }
}
