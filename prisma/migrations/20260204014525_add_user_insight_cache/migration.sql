-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastAnalysisAt" TIMESTAMPTZ,
ADD COLUMN     "lastAnalysisFrom" TEXT,
ADD COLUMN     "lastAnalysisResult" JSONB,
ADD COLUMN     "lastAnalysisTo" TEXT;
