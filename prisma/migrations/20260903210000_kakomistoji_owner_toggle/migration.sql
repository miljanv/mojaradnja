-- KakoMiStoji: owner-side visibility switch, independent of the admin grant.

ALTER TABLE "Shop"
  ADD COLUMN IF NOT EXISTS "kmsPublicEnabled" BOOLEAN NOT NULL DEFAULT true;
