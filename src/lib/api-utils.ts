import { NextRequest, NextResponse } from "next/server";

export const API_ERROR_CODES = [
  "INVALID_PARAMS",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "INTERNAL_ERROR",
] as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[number];

export const API_ERROR_CODES = [
  "INVALID_PARAMS",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "INTERNAL_ERROR",
] as const;

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

export function apiResponse<T>(data: T, status: number = 200) {
  return NextResponse.json({ data }, { status });
}

export function apiError(
  code: ApiErrorCode,
  details: Record<string, unknown> = {},
  status: number = 400
) {
  return NextResponse.json(
    {
      error: {
        code,
        details,
      },
    },
    { status }
  );
}

export function withApiErrorHandling(
  handler: (req: NextRequest, context?: unknown) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: unknown) => {
    try {
      return await handler(req, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return apiError(error.code, error.details, error.status);
      }

      console.error(`Unhandled API Error:`, error);
      return apiError("INTERNAL_ERROR", {}, 500);
    }
  };
}
