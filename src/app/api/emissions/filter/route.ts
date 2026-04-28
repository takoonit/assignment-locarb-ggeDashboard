import { NextRequest } from "next/server";
import { apiResponse, apiError, withApiErrorHandling } from "@/lib/api-utils";
import { FilterQuerySchema } from "@/lib/api-schemas";
import { getEmissionsFilter } from "@/lib/services/emissions";

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

  const filterData = await getEmissionsFilter(
    query.data.country,
    query.data.gas,
    query.data.year
  );

  if (!filterData) {
    return apiError("NOT_FOUND", { message: "Country not found" }, 404);
  }

  return apiResponse(filterData);
});
