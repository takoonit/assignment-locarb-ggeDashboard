import type { NextRequest } from "next/server";
import {
  createSectorShareBodySchema,
  parseJsonBody,
} from "@/lib/api-schemas";
import { apiResponse, withApiErrorHandling } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/require-admin";
import { createSectorShare } from "@/lib/services/emissions";

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const adminError = await requireAdmin();
  if (adminError) return adminError;

  const body = await parseJsonBody(createSectorShareBodySchema, request);
  const sectorShare = await createSectorShare(body);

  return apiResponse(sectorShare);
});
