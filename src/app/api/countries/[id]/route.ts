import type { NextRequest } from "next/server";
import {
  parseIdParam,
  parseJsonBody,
  updateCountryBodySchema,
} from "@/lib/schemas";
import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/require-admin";
import { deleteCountry, updateCountry } from "@/lib/services/emissions";

type IdRouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = withApiErrorHandling(
  async (request: NextRequest, context?: unknown) => {
    await requireAdmin();

    const { id } = await (context as IdRouteContext).params;
    const body = await parseJsonBody(updateCountryBodySchema, request);
    const country = await updateCountry(parseIdParam(id), body);

    return apiSuccess(country);
  },
);

export const DELETE = withApiErrorHandling(
  async (_request: NextRequest, context?: unknown) => {
    await requireAdmin();

    const { id } = await (context as IdRouteContext).params;
    const deleted = await deleteCountry(parseIdParam(id));

    return apiSuccess(deleted);
  },
);
