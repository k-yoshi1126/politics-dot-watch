/*
  Warnings:

  - A unique constraint covering the columns `[submitSession,number]` on the table `DietSessionInfo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "BillAISummary" (
    "id" SERIAL NOT NULL,
    "submitSession" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "titleSummary" TEXT NOT NULL,
    "shortSummary" TEXT NOT NULL,
    "longSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillAISummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BillAISummary_submitSession_idx" ON "BillAISummary"("submitSession");

-- CreateIndex
CREATE INDEX "BillAISummary_number_idx" ON "BillAISummary"("number");

-- CreateIndex
CREATE UNIQUE INDEX "BillAISummary_submitSession_number_key" ON "BillAISummary"("submitSession", "number");

-- CreateIndex
CREATE UNIQUE INDEX "DietSessionInfo_submitSession_number_key" ON "DietSessionInfo"("submitSession", "number");

-- AddForeignKey
ALTER TABLE "BillAISummary" ADD CONSTRAINT "BillAISummary_submitSession_number_fkey" FOREIGN KEY ("submitSession", "number") REFERENCES "DietSessionInfo"("submitSession", "number") ON DELETE RESTRICT ON UPDATE CASCADE;
