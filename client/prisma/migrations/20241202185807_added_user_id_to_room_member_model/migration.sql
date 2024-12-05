/*
  Warnings:

  - Added the required column `userId` to the `RoomMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RoomMember" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RoomMember" ADD CONSTRAINT "RoomMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
