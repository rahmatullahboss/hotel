CREATE TABLE "hotelMetrics" (
	"id" text PRIMARY KEY NOT NULL,
	"hotelId" text NOT NULL,
	"totalBookings" integer DEFAULT 0 NOT NULL,
	"totalCancellations" integer DEFAULT 0 NOT NULL,
	"totalWalkIns" integer DEFAULT 0 NOT NULL,
	"cancellationRate" numeric(5, 2) DEFAULT '0',
	"redFlags" integer DEFAULT 0 NOT NULL,
	"lastRedFlagDate" timestamp,
	"searchRankPenalty" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hotelMetrics_hotelId_unique" UNIQUE("hotelId")
);
--> statement-breakpoint
CREATE TABLE "loyaltyPoints" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"lifetimePoints" integer DEFAULT 0 NOT NULL,
	"tier" text DEFAULT 'BRONZE' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loyaltyPoints_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "walletTransactions" (
	"id" text PRIMARY KEY NOT NULL,
	"walletId" text NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"reason" text NOT NULL,
	"bookingId" text,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"balance" numeric(10, 2) DEFAULT '0' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wallets_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "trustScore" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "lateCancellationCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "payAtHotelAllowed" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "bookingSource" text DEFAULT 'PLATFORM' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "commissionStatus" text DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "bookingFee" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "bookingFeeStatus" text DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "cancellationReason" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "cancelledAt" timestamp;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "refundAmount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "guestIdPhoto" text;--> statement-breakpoint
ALTER TABLE "hotelMetrics" ADD CONSTRAINT "hotelMetrics_hotelId_hotels_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyaltyPoints" ADD CONSTRAINT "loyaltyPoints_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walletTransactions" ADD CONSTRAINT "walletTransactions_walletId_wallets_id_fk" FOREIGN KEY ("walletId") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walletTransactions" ADD CONSTRAINT "walletTransactions_bookingId_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;