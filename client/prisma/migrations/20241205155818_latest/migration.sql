/*
  Warnings:

  - Made the column `subsequentStates` on table `WhiteBoardState` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "WhiteBoardState" ALTER COLUMN "subsequentStates" SET NOT NULL,
ALTER COLUMN "subsequentStates" SET DEFAULT '[]',
ALTER COLUMN "initialState" SET DEFAULT '[]';
