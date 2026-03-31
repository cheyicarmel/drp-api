-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "context" TEXT,
ADD COLUMN     "githubDisabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "images" TEXT;
