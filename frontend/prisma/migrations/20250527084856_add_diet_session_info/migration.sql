-- CreateTable
CREATE TABLE "DietSessionInfo" (
    "session" INTEGER NOT NULL,
    "submitSession" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "progressUrl" TEXT NOT NULL,
    "contentUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DietSessionInfo_pkey" PRIMARY KEY ("session","submitSession","number")
);
