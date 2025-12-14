CREATE TYPE "public"."badge_category" AS ENUM('BOOKING', 'LOYALTY', 'SPENDING', 'STREAK', 'EXPLORER', 'REVIEWER', 'REFERRAL', 'SPECIAL');--> statement-breakpoint
CREATE TABLE "badges" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"nameBn" text,
	"description" text NOT NULL,
	"descriptionBn" text,
	"category" "badge_category" NOT NULL,
	"icon" text NOT NULL,
	"requirement" integer DEFAULT 1 NOT NULL,
	"points" integer DEFAULT 10 NOT NULL,
	"isSecret" boolean DEFAULT false NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "badges_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "bookingStreaks" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"totalBookings" integer DEFAULT 0 NOT NULL,
	"monthlyBookings" integer DEFAULT 0 NOT NULL,
	"lastBookingMonth" text,
	"consecutiveMonths" integer DEFAULT 0 NOT NULL,
	"citiesVisited" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookingStreaks_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "loginStreaks" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"currentStreak" integer DEFAULT 0 NOT NULL,
	"longestStreak" integer DEFAULT 0 NOT NULL,
	"lastLoginDate" date,
	"totalLoginDays" integer DEFAULT 0 NOT NULL,
	"lastRewardStreak" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loginStreaks_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "userBadges" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"badgeId" text NOT NULL,
	"earnedAt" timestamp DEFAULT now() NOT NULL,
	"notified" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookingStreaks" ADD CONSTRAINT "bookingStreaks_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loginStreaks" ADD CONSTRAINT "loginStreaks_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userBadges" ADD CONSTRAINT "userBadges_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userBadges" ADD CONSTRAINT "userBadges_badgeId_badges_id_fk" FOREIGN KEY ("badgeId") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;