-- 既存のテーブルをバックアップ
CREATE TABLE "DietSessionInfo_backup" AS SELECT * FROM "DietSessionInfo";

-- 既存のテーブルを削除
DROP TABLE "DietSessionInfo";

-- 新しいテーブルを作成
CREATE TABLE "DietSessionInfo" (
    session INTEGER NOT NULL,
    "submitSession" INTEGER NOT NULL,
    number INTEGER NOT NULL,
    title VARCHAR NOT NULL,
    status VARCHAR,
    "progressUrl" VARCHAR,
    "contentUrl" VARCHAR,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (session, "submitSession", number)
);

-- バックアップからデータを移行
INSERT INTO "DietSessionInfo" (
    session, "submitSession", number, title, status, "progressUrl", "contentUrl", "createdAt", "updatedAt"
)
SELECT 
    session, "submitSession", number, title, status, "progressUrl", "contentUrl", "createdAt", "updatedAt"
FROM "DietSessionInfo_backup";

-- バックアップテーブルを削除
DROP TABLE "DietSessionInfo_backup"; 