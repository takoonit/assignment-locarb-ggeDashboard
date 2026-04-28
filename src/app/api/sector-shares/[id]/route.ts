import type { NextRequest } from "next/server";
import {
  parseIdParam,
  parseJsonBody,
  updateSectorShareBodySchema,
} from "@/lib/api-schemas";
import { apiResponse, withApiErrorHandling } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/require-admin";
import {
  deleteSectorShare,
  updateSectorShare,
} from "@/lib/services/emissions";

type IdRouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = withApiErrorHandling(
  async (request: NextRequest, context?: unknown) => {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await (context as IdRouteContext).params;
    const body = await parseJsonBody(updateSectorShareBodySchema, request);
    const sectorShare = await updateSectorShare(parseIdParam(id), body);

    return apiResponse(sectorShare);
  },
);

export const DELETE = withApiErrorHandling(
  async (_request: NextRequest, context?: unknown) => {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await (context as IdRouteContext).params;
    const deleted = await deleteSectorShare(parseIdParam(id));

    return apiResponse(deleted);
  },
);
