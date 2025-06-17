-- DropForeignKey
ALTER TABLE "BillAISummary" DROP CONSTRAINT "BillAISummary_submitSession_number_fkey";

-- DropIndex
DROP INDEX "DietSessionInfo_submitSession_number_key";

-- AddForeignKey
ALTER TABLE "BillAISummary" ADD CONSTRAINT "BillAISummary_BillSubmitContent" FOREIGN KEY ("submitSession", "number") REFERENCES "BillSubmitContent"("submitSession", "number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillAISummary" ADD CONSTRAINT "BillAISummary_BillOutline" FOREIGN KEY ("submitSession", "number") REFERENCES "BillOutline"("submitSession", "number") ON DELETE RESTRICT ON UPDATE CASCADE;
