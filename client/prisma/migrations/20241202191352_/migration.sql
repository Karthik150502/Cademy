/*
  Warnings:

  - A unique constraint covering the columns `[roomId,id]` on the table `RoomMember` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RoomMember_roomId_id_key" ON "RoomMember"("roomId", "id");
