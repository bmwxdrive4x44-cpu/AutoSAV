DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Offer' AND column_name = 'intermediaryId'
  ) THEN
    ALTER TABLE "Offer" RENAME COLUMN "intermediaryId" TO "agentBuyerId";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Shipment' AND column_name = 'intermediaryId'
  ) THEN
    ALTER TABLE "Shipment" RENAME COLUMN "intermediaryId" TO "agentBuyerId";
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "Shipment_requestId_key" ON "Shipment"("requestId");

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Offer_intermediaryId_fkey') THEN
    ALTER TABLE "Offer" RENAME CONSTRAINT "Offer_intermediaryId_fkey" TO "Offer_agentBuyerId_fkey";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Shipment_intermediaryId_fkey') THEN
    ALTER TABLE "Shipment" RENAME CONSTRAINT "Shipment_intermediaryId_fkey" TO "Shipment_agentBuyerId_fkey";
  END IF;
END $$;
