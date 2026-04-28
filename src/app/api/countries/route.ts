import { NextRequest } from "next/server";
import { apiResponse, apiError, withApiErrorHandling } from "@/lib/api-utils";
import { CountriesQuerySchema } from "@/lib/api-schemas";
import { getCountries } from "@/lib/services/emissions";

export const GET = withApiErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const query = CountriesQuerySchema.safeParse({
    includeRegions: searchParams.get("includeRegions"),
  });

  if (!query.success) {
    return apiError("INVALID_PARAMS", query.error.flatten().fieldErrors);
  }

  const countries = await getCountries(query.data.includeRegions);
  return apiResponse(countries);
});
