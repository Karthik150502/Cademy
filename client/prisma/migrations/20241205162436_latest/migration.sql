/*
  Warnings:

  - You are about to drop the column `whiteboardStateId` on the `MeetingRecording` table. All the data in the column will be lost.
  - You are about to drop the `WhiteBoardState` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MeetingRecording" DROP CONSTRAINT "MeetingRecording_whiteboardStateId_fkey";

-- AlterTable
ALTER TABLE "MeetingRecording" DROP COLUMN "whiteboardStateId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "initialState" JSONB[],
ADD COLUMN     "subsequentStates" JSONB[];

-- DropTable
DROP TABLE "WhiteBoardState";
