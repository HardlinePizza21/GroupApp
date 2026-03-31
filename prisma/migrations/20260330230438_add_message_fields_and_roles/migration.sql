-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "fileType" TEXT,
ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'SENT',
ALTER COLUMN "content" DROP NOT NULL;
