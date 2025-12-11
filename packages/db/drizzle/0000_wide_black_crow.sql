CREATE TABLE "accounts" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp,
	"image" text,
	"phone" text,
	"role" text DEFAULT 'TRAVELER' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationTokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationTokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "activityLog" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"actorId" text,
	"hotelId" text,
	"bookingId" text,
	"description" text NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"hotelId" text NOT NULL,
	"userId" text,
	"roomId" text NOT NULL,
	"checkIn" date NOT NULL,
	"checkOut" date NOT NULL,
	"numberOfNights" integer DEFAULT 1 NOT NULL,
	"guestCount" integer DEFAULT 1 NOT NULL,
	"guestName" text NOT NULL,
	"guestPhone" text NOT NULL,
	"guestEmail" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"paymentStatus" text DEFAULT 'PENDING' NOT NULL,
	"totalAmount" numeric(10, 2) NOT NULL,
	"commissionAmount" numeric(10, 2) NOT NULL,
	"netAmount" numeric(10, 2) NOT NULL,
	"paymentMethod" text,
	"paymentReference" text,
	"notes" text,
	"qrCode" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hotels" (
	"id" text PRIMARY KEY NOT NULL,
	"ownerId" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"amenities" jsonb DEFAULT '[]'::jsonb,
	"photos" jsonb DEFAULT '[]'::jsonb,
	"coverImage" text,
	"rating" numeric(2, 1) DEFAULT '0',
	"reviewCount" integer DEFAULT 0 NOT NULL,
	"payAtHotelEnabled" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"commissionRate" numeric(5, 2) DEFAULT '12.00' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text DEFAULT 'PERCENTAGE' NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"hotelId" text,
	"minBookingAmount" numeric(10, 2),
	"maxDiscountAmount" numeric(10, 2),
	"maxUses" integer,
	"currentUses" integer DEFAULT 0 NOT NULL,
	"validFrom" date,
	"validTo" date,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promotions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "roomInventory" (
	"id" text PRIMARY KEY NOT NULL,
	"roomId" text NOT NULL,
	"date" date NOT NULL,
	"status" text DEFAULT 'AVAILABLE' NOT NULL,
	"price" numeric(10, 2),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"hotelId" text NOT NULL,
	"roomNumber" text NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'DOUBLE' NOT NULL,
	"description" text,
	"basePrice" numeric(10, 2) NOT NULL,
	"maxGuests" integer DEFAULT 2 NOT NULL,
	"amenities" jsonb DEFAULT '[]'::jsonb,
	"photos" jsonb DEFAULT '[]'::jsonb,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activityLog" ADD CONSTRAINT "activityLog_actorId_users_id_fk" FOREIGN KEY ("actorId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activityLog" ADD CONSTRAINT "activityLog_hotelId_hotels_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activityLog" ADD CONSTRAINT "activityLog_bookingId_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_hotelId_hotels_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_roomId_rooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotels" ADD CONSTRAINT "hotels_ownerId_users_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_hotelId_hotels_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roomInventory" ADD CONSTRAINT "roomInventory_roomId_rooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_hotelId_hotels_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;