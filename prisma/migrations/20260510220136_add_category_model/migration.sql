/*
  Warnings:

  - You are about to drop the column `category` on the `ProductRequest` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `ProductRequest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
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
    "categoryId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "acceptedOfferId" TEXT,
    CONSTRAINT "ProductRequest_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductRequest_acceptedOfferId_fkey" FOREIGN KEY ("acceptedOfferId") REFERENCES "Offer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ProductRequest" ("acceptedOfferId", "budget", "clientId", "countryToBuyFrom", "createdAt", "deletedAt", "deletionReason", "description", "id", "images", "isFeatured", "isSuspicious", "markedAsScam", "scamMarkedAt", "scamReason", "status", "suspiciousReason", "title", "updatedAt") SELECT "acceptedOfferId", "budget", "clientId", "countryToBuyFrom", "createdAt", "deletedAt", "deletionReason", "description", "id", "images", "isFeatured", "isSuspicious", "markedAsScam", "scamMarkedAt", "scamReason", "status", "suspiciousReason", "title", "updatedAt" FROM "ProductRequest";
DROP TABLE "ProductRequest";
ALTER TABLE "new_ProductRequest" RENAME TO "ProductRequest";
CREATE UNIQUE INDEX "ProductRequest_acceptedOfferId_key" ON "ProductRequest"("acceptedOfferId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
