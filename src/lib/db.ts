import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

declare global {
  var _prisma: ReturnType<typeof createPrismaClient> | undefined;
}

export const db = globalThis._prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis._prisma = db;
}
