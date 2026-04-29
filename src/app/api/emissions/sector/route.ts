import { NextRequest } from "next/server";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { SectorQuerySchema } from "@/lib/schemas";
import { getSectorBreakdown } from "@/lib/services/emissions";

export const GET = withApiErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const query = SectorQuerySchema.safeParse({
    country: searchParams.get("country"),
    year: searchParams.get("year"),
  });

  if (!query.success) {
    return apiError("INVALID_PARAMS", query.error.flatten().fieldErrors);
  }

  const sectorData = await getSectorBreakdown({
    country: query.data.country,
    year: query.data.year,
  });

  if (!sectorData) {
    return apiError("NOT_FOUND", { message: "Country not found" }, 404);
  }

  return apiSuccess(sectorData);
});
