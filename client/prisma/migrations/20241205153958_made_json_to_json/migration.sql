/*
  Warnings:

  - The `initTialState` column on the `WhiteBoardState` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `subsequentStates` column on the `WhiteBoardState` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "WhiteBoardState" DROP COLUMN "initTialState",
ADD COLUMN     "initTialState" JSONB[],
DROP COLUMN "subsequentStates",
ADD COLUMN     "subsequentStates" JSONB[];
