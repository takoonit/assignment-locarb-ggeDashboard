import type { NextRequest } from "next/server";
import {
  createEmissionBodySchema,
  parseJsonBody,
} from "@/lib/api-schemas";
import { apiResponse, withApiErrorHandling } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/require-admin";
import { createAnnualEmission } from "@/lib/services/emissions";

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const adminError = await requireAdmin();
  if (adminError) return adminError;

  const body = await parseJsonBody(createEmissionBodySchema, request);
  const emission = await createAnnualEmission(body);

  return apiResponse(emission);
});
