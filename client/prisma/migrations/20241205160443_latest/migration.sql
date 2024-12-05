/*
  Warnings:

  - Made the column `whiteboardStateId` on table `MeetingRecording` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "MeetingRecording" DROP CONSTRAINT "MeetingRecording_whiteboardStateId_fkey";

-- AlterTable
ALTER TABLE "MeetingRecording" ALTER COLUMN "whiteboardStateId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "MeetingRecording" ADD CONSTRAINT "MeetingRecording_whiteboardStateId_fkey" FOREIGN KEY ("whiteboardStateId") REFERENCES "WhiteBoardState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
