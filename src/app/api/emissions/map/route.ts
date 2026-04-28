import { NextRequest } from "next/server";
import { apiResponse, apiError, withApiErrorHandling } from "@/lib/api-utils";
import { MapQuerySchema } from "@/lib/api-schemas";
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

  const mapData = await getEmissionsMap(
    query.data.year,
    query.data.gas,
    query.data.includeRegions
  );

  return apiResponse(mapData);
});
