CREATE TYPE "public"."housekeepingPriority" AS ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."housekeepingTaskStatus" AS ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."housekeepingTaskType" AS ENUM('CHECKOUT_CLEAN', 'STAY_OVER', 'INSPECTION', 'MAINTENANCE', 'TURNDOWN', 'DEEP_CLEAN');--> statement-breakpoint
CREATE TYPE "public"."roomCleaningStatus" AS ENUM('CLEAN', 'DIRTY', 'INSPECTED', 'OUT_OF_ORDER');--> statement-breakpoint
CREATE TYPE "public"."claimStatus" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'PAID');--> statement-breakpoint
CREATE TYPE "public"."incentiveProgramStatus" AS ENUM('ACTIVE', 'UPCOMING', 'EXPIRED', 'PAUSED');--> statement-breakpoint
CREATE TYPE "public"."incentiveType" AS ENUM('BOOKING_COUNT', 'REVENUE_TARGET', 'OCCUPANCY_RATE', 'RATING_IMPROVEMENT', 'FIRST_MILESTONE', 'STREAK', 'SEASONAL_BONUS');--> statement-breakpoint
CREATE TYPE "public"."competitorSource" AS ENUM('MANUAL', 'OTA_SCRAPE', 'API');--> statement-breakpoint
CREATE TYPE "public"."pricePosition" AS ENUM('LOWEST', 'BELOW_AVERAGE', 'AVERAGE', 'ABOVE_AVERAGE', 'HIGHEST');--> statement-breakpoint
CREATE TABLE "notificationPreferences" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"newBooking" boolean DEFAULT true NOT NULL,
	"cancellation" boolean DEFAULT true NOT NULL,
	"checkInReminder" boolean DEFAULT true NOT NULL,
	"paymentReceived" boolean DEFAULT true NOT NULL,
	"lowInventory" boolean DEFAULT true NOT NULL,
	"bookingConfirmation" boolean DEFAULT true NOT NULL,
	"checkInInstructions" boolean DEFAULT true NOT NULL,
	"promotions" boolean DEFAULT true NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notificationPreferences_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "pushSubscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"deviceName" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hotelStaff" (
	"id" text PRIMARY KEY NOT NULL,
	"hotelId" text NOT NULL,
	"userId" text NOT NULL,
	"role" text NOT NULL,
	"invitedBy" text,
	"invitedAt" timestamp DEFAULT now() NOT NULL,
	"acceptedAt" timestamp,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "housekeepingChecklists" (
	"id" text PRIMARY KEY NOT NULL,
	"hotelId" text NOT NULL,
	"taskType" "housekeepingTaskType" NOT NULL,
	"itemOrder" integer NOT NULL,
	"itemText" text NOT NULL,
	"isRequired" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "housekeepingLogs" (
	"id" text PRIMARY KEY NOT NULL,
	"taskId" text NOT NULL,
	"action" text NOT NULL,
	"performedBy" text NOT NULL,
	"previousStatus" text,
	"newStatus" text,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "housekeepingTasks" (
	"id" text PRIMARY KEY NOT NULL,
	"hotelId" text NOT NULL,
	"roomId" text NOT NULL,
	"type" "housekeepingTaskType" NOT NULL,
	"status" "housekeepingTaskStatus" DEFAULT 'PENDING' NOT NULL,
	"priority" "housekeepingPriority" DEFAULT 'NORMAL' NOT NULL,
	"assignedTo" text,
	"assignedAt" timestamp,
	"scheduledFor" timestamp,
	"startedAt" timestamp,
	"completedAt" timestamp,
	"verifiedBy" text,
	"verifiedAt" timestamp,
	"notes" text,
	"guestRequest" boolean DEFAULT false NOT NULL,
	"checklistCompleted" boolean DEFAULT false NOT NULL,
	"createdBy" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roomCleaningStatuses" (
	"id" text PRIMARY KEY NOT NULL,
	"roomId" text NOT NULL,
	"status" "roomCleaningStatus" DEFAULT 'CLEAN' NOT NULL,
	"lastCleanedAt" timestamp,
	"lastCleanedBy" text,
	"lastInspectedAt" timestamp,
	"lastInspectedBy" text,
	"notes" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roomCleaningStatuses_roomId_unique" UNIQUE("roomId")
);
--> statement-breakpoint
CREATE TABLE "hotelIncentives" (
	"id" text PRIMARY KEY NOT NULL,
	"hotelId" text NOT NULL,
	"programId" text NOT NULL,
	"currentProgress" integer DEFAULT 0 NOT NULL,
	"progressPercentage" numeric(5, 2) DEFAULT '0' NOT NULL,
	"isCompleted" boolean DEFAULT false NOT NULL,
	"completedAt" timestamp,
	"claimStatus" "claimStatus",
	"claimedAt" timestamp,
	"paidAt" timestamp,
	"payoutAmount" numeric(10, 2),
	"lastProgressUpdate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incentiveHistory" (
	"id" text PRIMARY KEY NOT NULL,
	"hotelIncentiveId" text NOT NULL,
	"action" text NOT NULL,
	"previousProgress" integer,
	"newProgress" integer,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incentivePrograms" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "incentiveType" NOT NULL,
	"status" "incentiveProgramStatus" DEFAULT 'ACTIVE' NOT NULL,
	"targetValue" integer NOT NULL,
	"targetUnit" text NOT NULL,
	"rewardAmount" numeric(10, 2) NOT NULL,
	"rewardType" text DEFAULT 'CASH' NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"minHotelRating" numeric(2, 1),
	"requiredTier" text,
	"isRecurring" boolean DEFAULT false NOT NULL,
	"badgeIcon" text,
	"badgeColor" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitorHotels" (
	"id" text PRIMARY KEY NOT NULL,
	"hotelId" text NOT NULL,
	"name" text NOT NULL,
	"source" "competitorSource" DEFAULT 'MANUAL' NOT NULL,
	"externalId" text,
	"externalUrl" text,
	"address" text,
	"distance" numeric(5, 2),
	"starRating" integer,
	"avgRating" numeric(2, 1),
	"reviewCount" integer,
	"isActive" text DEFAULT 'true' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitorRates" (
	"id" text PRIMARY KEY NOT NULL,
	"competitorId" text NOT NULL,
	"checkInDate" timestamp NOT NULL,
	"roomType" text,
	"rate" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'BDT' NOT NULL,
	"source" text,
	"fetchedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "priceRecommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"hotelId" text NOT NULL,
	"date" timestamp NOT NULL,
	"roomType" text,
	"currentPrice" numeric(10, 2) NOT NULL,
	"recommendedPrice" numeric(10, 2) NOT NULL,
	"minCompetitorPrice" numeric(10, 2),
	"maxCompetitorPrice" numeric(10, 2),
	"avgCompetitorPrice" numeric(10, 2),
	"pricePosition" "pricePosition",
	"confidence" numeric(3, 2),
	"reasoning" text,
	"isApplied" text DEFAULT 'false' NOT NULL,
	"appliedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "systemSettings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"updatedBy" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supportTickets" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"hotelId" text,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"category" text DEFAULT 'OTHER' NOT NULL,
	"priority" text DEFAULT 'MEDIUM' NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"assignedTo" text,
	"resolution" text,
	"resolvedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticketReplies" (
	"id" text PRIMARY KEY NOT NULL,
	"ticketId" text NOT NULL,
	"userId" text NOT NULL,
	"message" text NOT NULL,
	"isStaffReply" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"nameBn" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"descriptionBn" text,
	"metaTitle" text,
	"metaDescription" text,
	"coverImage" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"hotelCount" integer DEFAULT 0 NOT NULL,
	"isPopular" boolean DEFAULT false NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "notificationPreferences" ADD CONSTRAINT "notificationPreferences_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pushSubscriptions" ADD CONSTRAINT "pushSubscriptions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotelStaff" ADD CONSTRAINT "hotelStaff_hotelId_hotels_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotelStaff" ADD CONSTRAINT "hotelStaff_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotelStaff" ADD CONSTRAINT "hotelStaff_invitedBy_users_id_fk" FOREIGN KEY ("invitedBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "housekeepingChecklists" ADD CONSTRAINT "housekeepingChecklists_hotelId_hotels_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "housekeepingLogs" ADD CONSTRAINT "housekeepingLogs_taskId_housekeepingTasks_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."housekeepingTasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "housekeepingLogs" ADD CONSTRAINT "housekeepingLogs_performedBy_users_id_fk" FOREIGN KEY ("performedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "housekeepingTasks" ADD CONSTRAINT "housekeepingTasks_hotelId_hotels_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "housekeepingTasks" ADD CONSTRAINT "housekeepingTasks_roomId_rooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "housekeepingTasks" ADD CONSTRAINT "housekeepingTasks_assignedTo_users_id_fk" FOREIGN KEY ("assignedTo") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "housekeepingTasks" ADD CONSTRAINT "housekeepingTasks_verifiedBy_users_id_fk" FOREIGN KEY ("verifiedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "housekeepingTasks" ADD CONSTRAINT "housekeepingTasks_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roomCleaningStatuses" ADD CONSTRAINT "roomCleaningStatuses_roomId_rooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roomCleaningStatuses" ADD CONSTRAINT "roomCleaningStatuses_lastCleanedBy_users_id_fk" FOREIGN KEY ("lastCleanedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roomCleaningStatuses" ADD CONSTRAINT "roomCleaningStatuses_lastInspectedBy_users_id_fk" FOREIGN KEY ("lastInspectedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotelIncentives" ADD CONSTRAINT "hotelIncentives_hotelId_hotels_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotelIncentives" ADD CONSTRAINT "hotelIncentives_programId_incentivePrograms_id_fk" FOREIGN KEY ("programId") REFERENCES "public"."incentivePrograms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incentiveHistory" ADD CONSTRAINT "incentiveHistory_hotelIncentiveId_hotelIncentives_id_fk" FOREIGN KEY ("hotelIncentiveId") REFERENCES "public"."hotelIncentives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitorHotels" ADD CONSTRAINT "competitorHotels_hotelId_hotels_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitorRates" ADD CONSTRAINT "competitorRates_competitorId_competitorHotels_id_fk" FOREIGN KEY ("competitorId") REFERENCES "public"."competitorHotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "priceRecommendations" ADD CONSTRAINT "priceRecommendations_hotelId_hotels_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supportTickets" ADD CONSTRAINT "supportTickets_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supportTickets" ADD CONSTRAINT "supportTickets_hotelId_hotels_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supportTickets" ADD CONSTRAINT "supportTickets_assignedTo_users_id_fk" FOREIGN KEY ("assignedTo") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticketReplies" ADD CONSTRAINT "ticketReplies_ticketId_supportTickets_id_fk" FOREIGN KEY ("ticketId") REFERENCES "public"."supportTickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticketReplies" ADD CONSTRAINT "ticketReplies_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "hotel_user_unique" ON "hotelStaff" USING btree ("hotelId","userId");--> statement-breakpoint
CREATE UNIQUE INDEX "room_date_unique" ON "roomInventory" USING btree ("roomId","date");