-- AlterTable
ALTER TABLE "MeetingRecording" ALTER COLUMN "initialState" SET NOT NULL,
ALTER COLUMN "initialState" SET DEFAULT '',
ALTER COLUMN "initialState" SET DATA TYPE TEXT,
ALTER COLUMN "subsequentStates" SET NOT NULL,
ALTER COLUMN "subsequentStates" SET DEFAULT '',
ALTER COLUMN "subsequentStates" SET DATA TYPE TEXT;
