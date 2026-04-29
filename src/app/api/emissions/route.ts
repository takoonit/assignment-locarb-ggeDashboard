import type { NextRequest } from "next/server";
import {
  createEmissionBodySchema,
  parseJsonBody,
} from "@/lib/schemas";
import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAnnualEmission } from "@/lib/services/emissions";

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  await requireAdmin();

  const body = await parseJsonBody(createEmissionBodySchema, request);
  const emission = await createAnnualEmission(body);

  return apiSuccess(emission);
});
