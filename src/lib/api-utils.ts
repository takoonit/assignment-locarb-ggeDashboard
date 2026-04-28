import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "INVALID_PARAMS"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public details: Record<string, any> = {},
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
  details: Record<string, any> = {},
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
  handler: (req: NextRequest, context: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: any) => {
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
