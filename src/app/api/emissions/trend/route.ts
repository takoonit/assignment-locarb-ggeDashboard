import { NextRequest } from "next/server";
import { apiResponse, apiError, withApiErrorHandling } from "@/lib/api-utils";
import { TrendQuerySchema } from "@/lib/api-schemas";
import { getEmissionsTrend } from "@/lib/services/emissions";

export const GET = withApiErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const query = TrendQuerySchema.safeParse({
    country: searchParams.get("country"),
    gas: searchParams.get("gas") || undefined,
    fromYear: searchParams.get("fromYear"),
    toYear: searchParams.get("toYear"),
  });

  if (!query.success) {
    return apiError("INVALID_PARAMS", query.error.flatten().fieldErrors);
  }

  const trend = await getEmissionsTrend({
    country: query.data.country,
    gas: query.data.gas,
    fromYear: query.data.fromYear,
    toYear: query.data.toYear,
  });

  if (!trend) {
    return apiError("NOT_FOUND", { message: "Country not found" }, 404);
  }

  return apiResponse(trend);
});
