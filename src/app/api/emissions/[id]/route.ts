import type { NextRequest } from "next/server";
import {
  parseIdParam,
  parseJsonBody,
  updateEmissionBodySchema,
} from "@/lib/api-schemas";
import { apiResponse, withApiErrorHandling } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/require-admin";
import {
  deleteAnnualEmission,
  updateAnnualEmission,
} from "@/lib/services/emissions";

type IdRouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = withApiErrorHandling(
  async (request: NextRequest, context?: unknown) => {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await (context as IdRouteContext).params;
    const body = await parseJsonBody(updateEmissionBodySchema, request);
    const emission = await updateAnnualEmission(parseIdParam(id), body);

    return apiResponse(emission);
  },
);

export const DELETE = withApiErrorHandling(
  async (_request: NextRequest, context?: unknown) => {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await (context as IdRouteContext).params;
    const deleted = await deleteAnnualEmission(parseIdParam(id));

    return apiResponse(deleted);
  },
);
