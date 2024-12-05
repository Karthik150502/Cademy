-- CreateTable
CREATE TABLE "WhiteBoardState" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "initTialState" TEXT NOT NULL,
    "subsequentStates" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhiteBoardState_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WhiteBoardState" ADD CONSTRAINT "WhiteBoardState_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
