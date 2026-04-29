import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { getAvailableMapYears } from "@/lib/services/emissions";

export const GET = withApiErrorHandling(async () => {
  const years = await getAvailableMapYears();
  return apiSuccess(years);
});
