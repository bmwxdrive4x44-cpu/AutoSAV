ALTER TABLE "Offer" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Offer" ADD COLUMN IF NOT EXISTS "deletionReason" TEXT;

ALTER TABLE "ProductRequest" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "ProductRequest" ADD COLUMN IF NOT EXISTS "deletionReason" TEXT;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isBlocked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "blockedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "blockReason" TEXT;

CREATE TABLE IF NOT EXISTS "Dispute" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "reason" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'OPEN',
        "resolution" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "requestId" TEXT NOT NULL,
        "reportedById" TEXT NOT NULL,
        "adminId" TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS "Dispute_requestId_key" ON "Dispute"("requestId");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Dispute_requestId_fkey') THEN
        ALTER TABLE "Dispute"
            ADD CONSTRAINT "Dispute_requestId_fkey"
            FOREIGN KEY ("requestId") REFERENCES "ProductRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Dispute_reportedById_fkey') THEN
        ALTER TABLE "Dispute"
            ADD CONSTRAINT "Dispute_reportedById_fkey"
            FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Dispute_adminId_fkey') THEN
        ALTER TABLE "Dispute"
            ADD CONSTRAINT "Dispute_adminId_fkey"
            FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
