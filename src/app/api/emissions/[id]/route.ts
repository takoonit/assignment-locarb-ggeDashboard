import type { NextRequest } from "next/server";
import {
  parseIdParam,
  parseJsonBody,
  updateEmissionBodySchema,
} from "@/lib/schemas";
import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  deleteAnnualEmission,
  updateAnnualEmission,
} from "@/lib/services/emissions";

type IdRouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = withApiErrorHandling(
  async (request: NextRequest, context?: unknown) => {
    await requireAdmin();

    const { id } = await (context as IdRouteContext).params;
    const body = await parseJsonBody(updateEmissionBodySchema, request);
    const emission = await updateAnnualEmission(parseIdParam(id), body);

    return apiSuccess(emission);
  },
);

export const DELETE = withApiErrorHandling(
  async (_request: NextRequest, context?: unknown) => {
    await requireAdmin();

    const { id } = await (context as IdRouteContext).params;
    const deleted = await deleteAnnualEmission(parseIdParam(id));

    return apiSuccess(deleted);
  },
);
