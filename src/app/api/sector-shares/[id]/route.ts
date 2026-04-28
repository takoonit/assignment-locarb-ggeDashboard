import type { NextRequest } from "next/server";
import {
  parseIdParam,
  parseJsonBody,
  updateSectorShareBodySchema,
} from "@/lib/schemas";
import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  deleteSectorShare,
  updateSectorShare,
} from "@/lib/services/emissions";

type IdRouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = withApiErrorHandling(
  async (request: NextRequest, context?: unknown) => {
    await requireAdmin();

    const { id } = await (context as IdRouteContext).params;
    const body = await parseJsonBody(updateSectorShareBodySchema, request);
    const sectorShare = await updateSectorShare(parseIdParam(id), body);

    return apiSuccess(sectorShare);
  },
);

export const DELETE = withApiErrorHandling(
  async (_request: NextRequest, context?: unknown) => {
    await requireAdmin();

    const { id } = await (context as IdRouteContext).params;
    const deleted = await deleteSectorShare(parseIdParam(id));

    return apiSuccess(deleted);
  },
);
