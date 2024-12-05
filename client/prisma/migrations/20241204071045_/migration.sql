/*
  Warnings:

  - A unique constraint covering the columns `[roomId,userId]` on the table `RoomMember` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "RoomMember_roomId_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "RoomMember_roomId_userId_key" ON "RoomMember"("roomId", "userId");
