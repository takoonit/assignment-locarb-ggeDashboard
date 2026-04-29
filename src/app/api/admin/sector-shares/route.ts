import type { NextRequest } from "next/server";
import { apiSuccess, apiError, withApiErrorHandling } from "@/lib/api/response";
import { AdminPageQuerySchema } from "@/lib/schemas";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listAdminSectorSharesPaged } from "@/lib/services/emissions";

export const GET = withApiErrorHandling(async (req: NextRequest) => {
  await requireAdmin();

  const { searchParams } = new URL(req.url);
  const query = AdminPageQuerySchema.safeParse({
    page: searchParams.get("page"),
    pageSize: searchParams.get("pageSize"),
  });

  if (!query.success) {
    return apiError("INVALID_PARAMS", query.error.flatten().fieldErrors);
  }

  const result = await listAdminSectorSharesPaged(query.data);
  return apiSuccess(result);
});
