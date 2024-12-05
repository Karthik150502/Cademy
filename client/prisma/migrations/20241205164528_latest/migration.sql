-- AlterTable
ALTER TABLE "MeetingRecording" ALTER COLUMN "initialState" SET DEFAULT ARRAY[]::JSONB[],
ALTER COLUMN "subsequentStates" SET DEFAULT ARRAY[]::JSONB[];
