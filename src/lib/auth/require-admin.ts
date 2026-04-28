import { auth } from "@/lib/auth/config";
import { ApiError } from "@/lib/api/error";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    throw new ApiError("UNAUTHENTICATED", {}, 401);
  }

  if ((session.user as { role?: string })?.role !== "ADMIN") {
    throw new ApiError("FORBIDDEN", {}, 403);
  }

  return session;
}
