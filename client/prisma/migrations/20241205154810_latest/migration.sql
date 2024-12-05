/*
  Warnings:

  - You are about to drop the column `initTialState` on the `WhiteBoardState` table. All the data in the column will be lost.
  - Added the required column `initialState` to the `WhiteBoardState` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WhiteBoardState" DROP COLUMN "initTialState",
ADD COLUMN     "initialState" TEXT NOT NULL;
