ALTER TABLE "bookings" ADD COLUMN "walletAmountUsed" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "hotels" ADD COLUMN "vibeCode" text;--> statement-breakpoint
ALTER TABLE "hotels" ADD COLUMN "category" text DEFAULT 'CLASSIC' NOT NULL;--> statement-breakpoint
ALTER TABLE "hotels" ADD CONSTRAINT "hotels_vibeCode_unique" UNIQUE("vibeCode");