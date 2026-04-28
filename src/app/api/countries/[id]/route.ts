import type { NextRequest } from "next/server";
import {
  parseIdParam,
  parseJsonBody,
  updateCountryBodySchema,
} from "@/lib/api-schemas";
import { apiResponse, withApiErrorHandling } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/require-admin";
import { deleteCountry, updateCountry } from "@/lib/services/emissions";

type IdRouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = withApiErrorHandling(
  async (request: NextRequest, context?: unknown) => {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await (context as IdRouteContext).params;
    const body = await parseJsonBody(updateCountryBodySchema, request);
    const country = await updateCountry(parseIdParam(id), body);

    return apiResponse(country);
  },
);

export const DELETE = withApiErrorHandling(
  async (_request: NextRequest, context?: unknown) => {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await (context as IdRouteContext).params;
    const deleted = await deleteCountry(parseIdParam(id));

    return apiResponse(deleted);
  },
);
