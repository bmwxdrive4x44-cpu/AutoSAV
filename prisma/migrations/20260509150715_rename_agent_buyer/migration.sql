/*
  Warnings:

  - You are about to drop the column `intermediaryId` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `intermediaryId` on the `Shipment` table. All the data in the column will be lost.
  - Added the required column `agentBuyerId` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `agentBuyerId` to the `Shipment` table without a default value. This is not possible if the table is not empty.

*/
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "agentBuyerId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    CONSTRAINT "Offer_agentBuyerId_fkey" FOREIGN KEY ("agentBuyerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Offer_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ProductRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Offer" ("createdAt", "deletedAt", "deletionReason", "estimatedDeliveryDays", "id", "message", "price", "requestId", "status", "updatedAt") SELECT "createdAt", "deletedAt", "deletionReason", "estimatedDeliveryDays", "id", "message", "price", "requestId", "status", "updatedAt" FROM "Offer";
DROP TABLE "Offer";
ALTER TABLE "new_Offer" RENAME TO "Offer";
CREATE TABLE "new_Shipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackingNumber" TEXT,
    "carrier" TEXT,
    "shippedAt" DATETIME,
    "deliveredAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "requestId" TEXT NOT NULL,
    "agentBuyerId" TEXT NOT NULL,
    CONSTRAINT "Shipment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ProductRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Shipment_agentBuyerId_fkey" FOREIGN KEY ("agentBuyerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Shipment" ("carrier", "createdAt", "deliveredAt", "id", "notes", "requestId", "shippedAt", "trackingNumber", "updatedAt") SELECT "carrier", "createdAt", "deliveredAt", "id", "notes", "requestId", "shippedAt", "trackingNumber", "updatedAt" FROM "Shipment";
DROP TABLE "Shipment";
ALTER TABLE "new_Shipment" RENAME TO "Shipment";
CREATE UNIQUE INDEX "Shipment_requestId_key" ON "Shipment"("requestId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
