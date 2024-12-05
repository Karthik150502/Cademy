/*
  Warnings:

  - You are about to drop the column `roomId` on the `WhiteBoardState` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "WhiteBoardState" DROP CONSTRAINT "WhiteBoardState_roomId_fkey";

-- AlterTable
ALTER TABLE "WhiteBoardState" DROP COLUMN "roomId";

-- CreateTable
CREATE TABLE "MeetingRecording" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "whiteboardStateId" TEXT,

    CONSTRAINT "MeetingRecording_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MeetingRecording" ADD CONSTRAINT "MeetingRecording_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingRecording" ADD CONSTRAINT "MeetingRecording_whiteboardStateId_fkey" FOREIGN KEY ("whiteboardStateId") REFERENCES "WhiteBoardState"("id") ON DELETE SET NULL ON UPDATE CASCADE;
