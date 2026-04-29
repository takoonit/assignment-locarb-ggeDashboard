import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = () => readFileSync("prisma/schema.prisma", "utf8");
const config = () => readFileSync("prisma.config.ts", "utf8");
const migration = () =>
  readFileSync("prisma/migrations/20260428094500_init/migration.sql", "utf8");

describe("Prisma schema", () => {
  it("uses PostgreSQL and generates the Prisma client", () => {
    const content = schema();

    expect(content).toContain('provider = "prisma-client-js"');
    expect(content).toContain('provider = "postgresql"');
    expect(content).not.toContain('url      = env("DATABASE_URL")');
  });

  it("configures Prisma 7 migrations with DATABASE_URL", () => {
    const content = config();

    expect(content).toContain('schema: "prisma/schema.prisma"');
    expect(content).toContain('path: "prisma/migrations"');
    expect(content).toContain('url: env("DATABASE_URL")');
  });

  it("defines the locked domain models and role enum", () => {
    const content = schema();

    for (const model of [
      "model Country",
      "model AnnualEmission",
      "model SectorShare",
      "model User",
      "enum Role",
    ]) {
      expect(content).toContain(model);
    }

    expect(content).toContain("VIEWER");
    expect(content).toContain("ADMIN");
    expect(content).toContain("role  Role   @default(VIEWER)");
  });

  it("enforces country relationships, uniqueness, indexes, and cascades", () => {
    const content = schema();

    expect(content).toContain("code            String           @unique");
    expect(content).toContain("isRegion        Boolean          @default(false)");
    expect(content).toContain(
      "country   Country @relation(fields: [countryId], references: [id], onDelete: Cascade)",
    );
    expect(content).toContain(
      "country       Country @relation(fields: [countryId], references: [id], onDelete: Cascade)",
    );
    expect(content).toContain("@@unique([countryId, year])");
    expect(content).toContain("@@index([name])");
    expect(content).toContain("@@index([isRegion])");
    expect(content).toContain("@@index([year])");
    expect(content).toContain("@@index([countryId, year])");
  });

  it("preserves nullable gas and sector values", () => {
    const content = schema();

    for (const field of [
      "total     Float?",
      "co2       Float?",
      "ch4       Float?",
      "n2o       Float?",
      "hfc       Float?",
      "pfc       Float?",
      "sf6       Float?",
      "transport     Float?",
      "manufacturing Float?",
      "electricity   Float?",
      "buildings     Float?",
      "other         Float?",
    ]) {
      expect(content).toContain(field);
    }
  });

  it("includes the initial PostgreSQL migration", () => {
    const content = migration();

    expect(content).toContain('CREATE TABLE "Country"');
    expect(content).toContain('CREATE TABLE "AnnualEmission"');
    expect(content).toContain('CREATE TABLE "SectorShare"');
    expect(content).toContain('CREATE TABLE "User"');
    expect(content).toContain("ON DELETE CASCADE ON UPDATE CASCADE");
  });
});
