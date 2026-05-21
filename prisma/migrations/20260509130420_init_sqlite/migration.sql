CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "phone" TEXT,
        "role" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Offer" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "price" DOUBLE PRECISION NOT NULL,
        "estimatedDeliveryDays" INTEGER NOT NULL,
        "message" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "intermediaryId" TEXT NOT NULL,
        "requestId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "ProductRequest" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "budget" DOUBLE PRECISION NOT NULL,
        "countryToBuyFrom" TEXT NOT NULL,
        "images" TEXT NOT NULL DEFAULT '',
        "status" TEXT NOT NULL DEFAULT 'REQUEST_CREATED',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "clientId" TEXT NOT NULL,
        "acceptedOfferId" TEXT
);

CREATE TABLE IF NOT EXISTS "Shipment" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "trackingNumber" TEXT,
        "carrier" TEXT,
        "shippedAt" TIMESTAMP(3),
        "deliveredAt" TIMESTAMP(3),
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "requestId" TEXT NOT NULL,
        "intermediaryId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Transaction" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "amount" DOUBLE PRECISION NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "paymentMethod" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "requestId" TEXT NOT NULL,
        "clientId" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "ProductRequest_acceptedOfferId_key" ON "ProductRequest"("acceptedOfferId");
CREATE UNIQUE INDEX IF NOT EXISTS "Shipment_requestId_key" ON "Shipment"("requestId");
CREATE UNIQUE INDEX IF NOT EXISTS "Transaction_requestId_key" ON "Transaction"("requestId");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Offer_intermediaryId_fkey') THEN
        ALTER TABLE "Offer"
            ADD CONSTRAINT "Offer_intermediaryId_fkey"
            FOREIGN KEY ("intermediaryId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Offer_requestId_fkey') THEN
        ALTER TABLE "Offer"
            ADD CONSTRAINT "Offer_requestId_fkey"
            FOREIGN KEY ("requestId") REFERENCES "ProductRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductRequest_clientId_fkey') THEN
        ALTER TABLE "ProductRequest"
            ADD CONSTRAINT "ProductRequest_clientId_fkey"
            FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductRequest_acceptedOfferId_fkey') THEN
        ALTER TABLE "ProductRequest"
            ADD CONSTRAINT "ProductRequest_acceptedOfferId_fkey"
            FOREIGN KEY ("acceptedOfferId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Shipment_requestId_fkey') THEN
        ALTER TABLE "Shipment"
            ADD CONSTRAINT "Shipment_requestId_fkey"
            FOREIGN KEY ("requestId") REFERENCES "ProductRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Shipment_intermediaryId_fkey') THEN
        ALTER TABLE "Shipment"
            ADD CONSTRAINT "Shipment_intermediaryId_fkey"
            FOREIGN KEY ("intermediaryId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_requestId_fkey') THEN
        ALTER TABLE "Transaction"
            ADD CONSTRAINT "Transaction_requestId_fkey"
            FOREIGN KEY ("requestId") REFERENCES "ProductRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_clientId_fkey') THEN
        ALTER TABLE "Transaction"
            ADD CONSTRAINT "Transaction_clientId_fkey"
            FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
