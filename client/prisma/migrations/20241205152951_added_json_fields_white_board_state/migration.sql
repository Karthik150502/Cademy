/*
  Warnings:

  - The `subsequentStates` column on the `WhiteBoardState` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `initTialState` on the `WhiteBoardState` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "WhiteBoardState" DROP COLUMN "initTialState",
ADD COLUMN     "initTialState" JSONB NOT NULL,
DROP COLUMN "subsequentStates",
ADD COLUMN     "subsequentStates" JSONB;
