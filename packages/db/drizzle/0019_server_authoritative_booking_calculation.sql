ALTER TABLE "bookings" ADD COLUMN "pricingVersion" text DEFAULT 'legacy' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "currency" text DEFAULT 'BDT' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "roomSubtotal" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "discountAmount" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "taxRate" numeric(5, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "taxAmount" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "commissionRate" numeric(5, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "amountDueNow" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "pricingBreakdown" jsonb;