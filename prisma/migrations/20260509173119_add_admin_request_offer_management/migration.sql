-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Offer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "price" REAL NOT NULL,
    "estimatedDeliveryDays" INTEGER NOT NULL,
    "deletedAt" DATETIME,
    "deletionReason" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isSuspicious" BOOLEAN NOT NULL DEFAULT false,
    "suspiciousReason" TEXT,
    "isReportedAsAbuse" BOOLEAN NOT NULL DEFAULT false,
    "abuseReason" TEXT,
    "abuseReportedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "agentBuyerId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    CONSTRAINT "Offer_agentBuyerId_fkey" FOREIGN KEY ("agentBuyerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Offer_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ProductRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Offer" ("agentBuyerId", "createdAt", "deletedAt", "deletionReason", "estimatedDeliveryDays", "id", "message", "price", "requestId", "status", "updatedAt") SELECT "agentBuyerId", "createdAt", "deletedAt", "deletionReason", "estimatedDeliveryDays", "id", "message", "price", "requestId", "status", "updatedAt" FROM "Offer";
DROP TABLE "Offer";
ALTER TABLE "new_Offer" RENAME TO "Offer";
CREATE TABLE "new_ProductRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "budget" REAL NOT NULL,
    "countryToBuyFrom" TEXT NOT NULL,
    "images" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'REQUEST_CREATED',
    "deletedAt" DATETIME,
    "deletionReason" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isSuspicious" BOOLEAN NOT NULL DEFAULT false,
    "suspiciousReason" TEXT,
    "markedAsScam" BOOLEAN NOT NULL DEFAULT false,
    "scamReason" TEXT,
    "scamMarkedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "clientId" TEXT NOT NULL,
    "acceptedOfferId" TEXT,
    CONSTRAINT "ProductRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductRequest_acceptedOfferId_fkey" FOREIGN KEY ("acceptedOfferId") REFERENCES "Offer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ProductRequest" ("acceptedOfferId", "budget", "category", "clientId", "countryToBuyFrom", "createdAt", "deletedAt", "deletionReason", "description", "id", "images", "status", "title", "updatedAt") SELECT "acceptedOfferId", "budget", "category", "clientId", "countryToBuyFrom", "createdAt", "deletedAt", "deletionReason", "description", "id", "images", "status", "title", "updatedAt" FROM "ProductRequest";
DROP TABLE "ProductRequest";
ALTER TABLE "new_ProductRequest" RENAME TO "ProductRequest";
CREATE UNIQUE INDEX "ProductRequest_acceptedOfferId_key" ON "ProductRequest"("acceptedOfferId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
