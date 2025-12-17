ALTER TABLE "hotels" RENAME COLUMN "vibeCode" TO "zinuCode";--> statement-breakpoint
DROP INDEX IF EXISTS "hotels_vibeCode_unique";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "hotels_zinuCode_unique" ON "hotels" USING btree ("zinuCode");
