-- RenameIndex
ALTER INDEX "BillContentInfoUrl_submitSession_number_key" RENAME TO "BillContentInfoUrl_submitSession_number_text_key";

-- CreateTable
CREATE TABLE "BillSubmitContent" (
    "id" SERIAL NOT NULL,
    "submitSession" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "supplementaryProvisions" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillSubmitContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillOutline" (
    "id" SERIAL NOT NULL,
    "submitSession" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "outline" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillOutline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillProposedAmendment" (
    "id" SERIAL NOT NULL,
    "submitSession" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "proposedAmendment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillProposedAmendment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillSubmitContent_submitSession_number_key" ON "BillSubmitContent"("submitSession", "number");

-- CreateIndex
CREATE UNIQUE INDEX "BillOutline_submitSession_number_key" ON "BillOutline"("submitSession", "number");

-- CreateIndex
CREATE UNIQUE INDEX "BillProposedAmendment_submitSession_number_key" ON "BillProposedAmendment"("submitSession", "number");
