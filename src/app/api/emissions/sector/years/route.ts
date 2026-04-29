import { NextRequest } from "next/server";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { CountryCodeSchema } from "@/lib/schemas";
import { getAvailableSectorYears } from "@/lib/services/emissions";

export const GET = withApiErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const parsed = CountryCodeSchema.safeParse(searchParams.get("country"));

  if (!parsed.success) {
    return apiError("INVALID_PARAMS", { country: parsed.error.flatten().formErrors });
  }

  const years = await getAvailableSectorYears(parsed.data);
  return apiSuccess(years);
});
