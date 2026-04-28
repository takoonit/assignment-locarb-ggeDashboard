-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('VIEWER', 'ADMIN');

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isRegion" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnualEmission" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "total" DOUBLE PRECISION,
    "co2" DOUBLE PRECISION,
    "ch4" DOUBLE PRECISION,
    "n2o" DOUBLE PRECISION,
    "hfc" DOUBLE PRECISION,
    "pfc" DOUBLE PRECISION,
    "sf6" DOUBLE PRECISION,

    CONSTRAINT "AnnualEmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectorShare" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "transport" DOUBLE PRECISION,
    "manufacturing" DOUBLE PRECISION,
    "electricity" DOUBLE PRECISION,
    "buildings" DOUBLE PRECISION,
    "other" DOUBLE PRECISION,

    CONSTRAINT "SectorShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE INDEX "Country_name_idx" ON "Country"("name");

-- CreateIndex
CREATE INDEX "Country_isRegion_idx" ON "Country"("isRegion");

-- CreateIndex
CREATE INDEX "AnnualEmission_year_idx" ON "AnnualEmission"("year");

-- CreateIndex
CREATE INDEX "AnnualEmission_countryId_year_idx" ON "AnnualEmission"("countryId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "AnnualEmission_countryId_year_key" ON "AnnualEmission"("countryId", "year");

-- CreateIndex
CREATE INDEX "SectorShare_year_idx" ON "SectorShare"("year");

-- CreateIndex
CREATE INDEX "SectorShare_countryId_year_idx" ON "SectorShare"("countryId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "SectorShare_countryId_year_key" ON "SectorShare"("countryId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "AnnualEmission" ADD CONSTRAINT "AnnualEmission_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectorShare" ADD CONSTRAINT "SectorShare_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;
