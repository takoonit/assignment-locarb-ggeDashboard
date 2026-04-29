import { NextRequest } from "next/server";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { CountriesQuerySchema, createCountryBodySchema, parseJsonBody } from "@/lib/schemas";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listCountries, createCountry } from "@/lib/services/emissions";

export const GET = withApiErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const query = CountriesQuerySchema.safeParse({
    includeRegions: searchParams.get("includeRegions"),
  });

  if (!query.success) {
    return apiError("INVALID_PARAMS", query.error.flatten().fieldErrors);
  }

  const countries = await listCountries({ includeRegions: query.data.includeRegions });
  return apiSuccess(countries);
});

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  await requireAdmin();

  const body = await parseJsonBody(createCountryBodySchema, request);
  const country = await createCountry(body);

  return apiSuccess(country);
});
