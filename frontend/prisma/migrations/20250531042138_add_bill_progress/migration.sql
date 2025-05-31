-- CreateTable
CREATE TABLE "BillProgress" (
    "session" INTEGER NOT NULL,
    "submitSession" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "billType" VARCHAR(50),
    "billTitle" TEXT NOT NULL,
    "submitter" TEXT,
    "submitterParty" TEXT,
    "houseInitialReviewDate" TIMESTAMP(3),
    "houseInitialCommittee" TEXT,
    "houseInitialCommitteeDate" TIMESTAMP(3),
    "houseReviewDate" TIMESTAMP(3),
    "houseCommittee" TEXT,
    "houseCommitteeDate" TIMESTAMP(3),
    "houseCommitteeResult" TEXT,
    "houseCommitteeEndDate" TIMESTAMP(3),
    "houseResult" TEXT,
    "houseEndDate" TIMESTAMP(3),
    "housePartyAttitude" TEXT,
    "houseSupportingParties" TEXT,
    "houseOpposingParties" TEXT,
    "councilInitialReviewDate" TIMESTAMP(3),
    "councilInitialCommittee" TEXT,
    "councilInitialCommitteeDate" TIMESTAMP(3),
    "councilReviewDate" TIMESTAMP(3),
    "councilCommittee" TEXT,
    "councilCommitteeDate" TIMESTAMP(3),
    "councilCommitteeResult" TEXT,
    "councilCommitteeEndDate" TIMESTAMP(3),
    "councilResult" TEXT,
    "councilEndDate" TIMESTAMP(3),
    "enactmentDate" TIMESTAMP(3),
    "lawNumber" VARCHAR(50),
    "submitters" TEXT,
    "supporters" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillProgress_pkey" PRIMARY KEY ("session","submitSession","number")
);

-- AddForeignKey
ALTER TABLE "BillProgress" ADD CONSTRAINT "BillProgress_session_submitSession_number_fkey" FOREIGN KEY ("session", "submitSession", "number") REFERENCES "DietSessionInfo"("session", "submitSession", "number") ON DELETE RESTRICT ON UPDATE CASCADE;
