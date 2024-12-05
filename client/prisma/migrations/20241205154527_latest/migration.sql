-- AlterTable
ALTER TABLE "WhiteBoardState" ALTER COLUMN "initTialState" SET NOT NULL,
ALTER COLUMN "initTialState" SET DATA TYPE TEXT,
ALTER COLUMN "subsequentStates" DROP NOT NULL,
ALTER COLUMN "subsequentStates" SET DATA TYPE TEXT;
