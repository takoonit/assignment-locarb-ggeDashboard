import { NextRequest, NextResponse } from "next/server";
import { ApiError, ApiErrorCode } from "@/lib/api/error";

export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json({ data }, { status });
}

export function apiError(
  code: ApiErrorCode,
  details: Record<string, unknown> = {},
  status: number = 400
) {
  return NextResponse.json({ error: { code, details } }, { status });
}

export function withApiErrorHandling<Args extends unknown[], Result extends NextResponse>(
  handler: (req: NextRequest, ...args: Args) => Promise<Result>,
): (req: NextRequest, ...args: Args) => Promise<Result | NextResponse> {
  return async (req: NextRequest, ...args: Args) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      if (error instanceof ApiError) {
        return apiError(error.code, error.details, error.status);
      }

      console.error(`Unhandled API Error:`, error);
      return apiError("INTERNAL_ERROR", {}, 500);
    }
  };
}
