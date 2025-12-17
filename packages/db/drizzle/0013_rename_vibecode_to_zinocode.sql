ALTER TABLE "hotels" RENAME COLUMN "vibeCode" TO "zinoCode";--> statement-breakpoint
DROP INDEX IF EXISTS "hotels_vibeCode_unique";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "hotels_zinoCode_unique" ON "hotels" USING btree ("zinoCode");
