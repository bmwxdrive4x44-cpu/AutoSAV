CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");

ALTER TABLE "ProductRequest" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

INSERT INTO "Category" ("id", "name", "slug", "icon", "createdAt")
VALUES ('legacy-other', 'Other', 'other', NULL, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ProductRequest' AND column_name = 'category'
  ) THEN
    INSERT INTO "Category" ("id", "name", "slug", "icon", "createdAt")
    SELECT DISTINCT
      'legacy-' || md5("category"),
      "category",
      regexp_replace(lower("category"), '[^a-z0-9]+', '-', 'g'),
      NULL,
      CURRENT_TIMESTAMP
    FROM "ProductRequest"
    WHERE "category" IS NOT NULL AND trim("category") <> ''
    ON CONFLICT ("id") DO NOTHING;

    UPDATE "ProductRequest" pr
    SET "categoryId" = 'legacy-' || md5(pr."category")
    WHERE pr."categoryId" IS NULL
      AND pr."category" IS NOT NULL
      AND trim(pr."category") <> '';
  END IF;
END $$;

UPDATE "ProductRequest"
SET "categoryId" = 'legacy-other'
WHERE "categoryId" IS NULL;

ALTER TABLE "ProductRequest" ALTER COLUMN "categoryId" SET NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductRequest_categoryId_fkey') THEN
    ALTER TABLE "ProductRequest"
      ADD CONSTRAINT "ProductRequest_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "ProductRequest" DROP COLUMN IF EXISTS "category";
