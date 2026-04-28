import { getServerSession } from "next-auth/next";
import type { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { apiError } from "@/lib/api-utils";

export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return apiError("UNAUTHENTICATED", {}, 401);
  }

  if ((session.user as { role?: string })?.role !== "ADMIN") {
    return apiError("FORBIDDEN", {}, 403);
  }

  return null;
}
