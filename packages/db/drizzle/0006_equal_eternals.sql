CREATE TYPE "public"."referral_status" AS ENUM('PENDING', 'COMPLETED', 'EXPIRED');--> statement-breakpoint
CREATE TABLE "referralCodes" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"code" text NOT NULL,
	"usageCount" integer DEFAULT 0 NOT NULL,
	"maxUses" integer,
	"referrerReward" numeric(10, 2) DEFAULT '100' NOT NULL,
	"referredReward" numeric(10, 2) DEFAULT '50' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp,
	CONSTRAINT "referralCodes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" text PRIMARY KEY NOT NULL,
	"referrerCodeId" text NOT NULL,
	"referredUserId" text NOT NULL,
	"bookingId" text,
	"status" "referral_status" DEFAULT 'PENDING' NOT NULL,
	"referrerReward" numeric(10, 2),
	"referredReward" numeric(10, 2),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "referralCodes" ADD CONSTRAINT "referralCodes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrerCodeId_referralCodes_id_fk" FOREIGN KEY ("referrerCodeId") REFERENCES "public"."referralCodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referredUserId_users_id_fk" FOREIGN KEY ("referredUserId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_bookingId_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;