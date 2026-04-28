import { NextRequest } from "next/server";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { MapQuerySchema } from "@/lib/schemas";
import { getEmissionsMap } from "@/lib/services/emissions";

export const GET = withApiErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const query = MapQuerySchema.safeParse({
    year: searchParams.get("year"),
    gas: searchParams.get("gas") || undefined,
    includeRegions: searchParams.get("includeRegions"),
  });

  if (!query.success) {
    return apiError("INVALID_PARAMS", query.error.flatten().fieldErrors);
  }

  const mapData = await getEmissionsMap({
    year: query.data.year,
    gas: query.data.gas,
    includeRegions: query.data.includeRegions,
  });

  return apiSuccess(mapData);
});
