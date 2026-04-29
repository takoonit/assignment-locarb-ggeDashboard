import type { NextRequest } from "next/server";
import {
  createSectorShareBodySchema,
  parseJsonBody,
} from "@/lib/schemas";
import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createSectorShare } from "@/lib/services/emissions";

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  await requireAdmin();

  const body = await parseJsonBody(createSectorShareBodySchema, request);
  const sectorShare = await createSectorShare(body);

  return apiSuccess(sectorShare);
});
