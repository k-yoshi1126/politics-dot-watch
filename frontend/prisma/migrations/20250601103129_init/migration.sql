-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "BillProgress" (
    "session" INTEGER NOT NULL,
    "submitSession" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "billType" VARCHAR(50),
    "billTitle" TEXT NOT NULL,
    "submitter" TEXT,
    "submitterParty" TEXT,
    "houseInitialReviewDate" DATE,
    "houseInitialCommitteeDate" DATE,
    "houseInitialCommittee" TEXT,
    "houseReviewDate" DATE,
    "houseCommitteeDate" DATE,
    "houseCommittee" TEXT,
    "houseCommitteeEndDate" DATE,
    "houseCommitteeResult" TEXT,
    "houseEndDate" DATE,
    "houseResult" TEXT,
    "housePartyAttitude" TEXT,
    "houseSupportingParties" TEXT,
    "houseOpposingParties" TEXT,
    "councilInitialReviewDate" DATE,
    "councilInitialCommitteeDate" DATE,
    "councilInitialCommittee" TEXT,
    "councilReviewDate" DATE,
    "councilCommitteeDate" DATE,
    "councilCommittee" TEXT,
    "councilCommitteeEndDate" DATE,
    "councilCommitteeResult" TEXT,
    "councilEndDate" DATE,
    "councilResult" TEXT,
    "enactmentDate" DATE,
    "lawNumber" VARCHAR(50),
    "submitters" TEXT,
    "supporters" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillProgress_pkey" PRIMARY KEY ("session","submitSession","number")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "uploaderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillContentInfoUrl" (
    "id" SERIAL NOT NULL,
    "submitSession" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillContentInfoUrl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "BillProgress_session_idx" ON "BillProgress"("session");

-- CreateIndex
CREATE INDEX "BillProgress_submitSession_idx" ON "BillProgress"("submitSession");

-- CreateIndex
CREATE INDEX "BillProgress_number_idx" ON "BillProgress"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "BillContentInfoUrl_submitSession_number_key" ON "BillContentInfoUrl"("submitSession", "number", "text");

-- AddForeignKey
ALTER TABLE "BillProgress" ADD CONSTRAINT "BillProgress_session_submitSession_number_fkey" FOREIGN KEY ("session", "submitSession", "number") REFERENCES "DietSessionInfo"("session", "submitSession", "number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
