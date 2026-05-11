-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "agentValidationStatus" TEXT NOT NULL DEFAULT 'NOT_APPLICABLE',
    "agentValidationNote" TEXT,
    "agentReviewedAt" DATETIME,
    "emailVerifiedAt" DATETIME,
    "phoneVerifiedAt" DATETIME,
    "kycStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "kycNotes" TEXT,
    "kycReviewedAt" DATETIME,
    "trustScore" INTEGER NOT NULL DEFAULT 0,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockedAt" DATETIME,
    "blockReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("agentReviewedAt", "agentValidationNote", "agentValidationStatus", "blockReason", "blockedAt", "createdAt", "email", "emailVerifiedAt", "id", "isBlocked", "kycNotes", "kycReviewedAt", "kycStatus", "name", "password", "phone", "phoneVerifiedAt", "role", "trustScore", "updatedAt") SELECT "agentReviewedAt", "agentValidationNote", "agentValidationStatus", "blockReason", "blockedAt", "createdAt", "email", "emailVerifiedAt", "id", "isBlocked", "kycNotes", "kycReviewedAt", "kycStatus", "name", "password", "phone", "phoneVerifiedAt", "role", "trustScore", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
