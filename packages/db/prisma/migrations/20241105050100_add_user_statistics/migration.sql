-- AlterTable
ALTER TABLE "users" ADD COLUMN "metadata" JSONB;

-- CreateTable
CREATE TABLE "user_statistics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "followingCount" INTEGER NOT NULL DEFAULT 0,
    "noteCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "collectCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_statistics_userId_key" ON "user_statistics"("userId");

-- CreateIndex
CREATE INDEX "user_statistics_followerCount_idx" ON "user_statistics"("followerCount");

-- CreateIndex
CREATE INDEX "user_statistics_noteCount_idx" ON "user_statistics"("noteCount");

-- AddForeignKey
ALTER TABLE "user_statistics" ADD CONSTRAINT "user_statistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
