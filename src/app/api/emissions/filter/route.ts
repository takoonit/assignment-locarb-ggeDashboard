import { NextRequest } from "next/server";
import { apiResponse, apiError, withApiErrorHandling } from "@/lib/api-utils";
import { FilterQuerySchema } from "@/lib/api-schemas";
import { getFilteredEmission } from "@/lib/services/emissions";

export const GET = withApiErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const query = FilterQuerySchema.safeParse({
    country: searchParams.get("country"),
    gas: searchParams.get("gas"),
    year: searchParams.get("year"),
  });

  if (!query.success) {
    return apiError("INVALID_PARAMS", query.error.flatten().fieldErrors);
  }

  const filterData = await getFilteredEmission({
    country: query.data.country,
    gas: query.data.gas,
    year: query.data.year,
  });

  return apiResponse(filterData);
});
