CREATE TABLE "payoutRequests" (
	"id" text PRIMARY KEY NOT NULL,
	"hotelId" text NOT NULL,
	"requestedBy" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"paymentMethod" text NOT NULL,
	"accountNumber" text NOT NULL,
	"accountName" text,
	"transactionReference" text,
	"rejectionReason" text,
	"processedBy" text,
	"processedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"bookingId" text NOT NULL,
	"hotelId" text NOT NULL,
	"userId" text NOT NULL,
	"rating" integer NOT NULL,
	"title" text,
	"content" text,
	"photos" jsonb DEFAULT '[]'::jsonb,
	"cleanlinessRating" integer,
	"serviceRating" integer,
	"valueRating" integer,
	"locationRating" integer,
	"hotelResponse" text,
	"hotelRespondedAt" timestamp,
	"isVisible" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_bookingId_unique" UNIQUE("bookingId")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "expiresAt" timestamp;--> statement-breakpoint
ALTER TABLE "payoutRequests" ADD CONSTRAINT "payoutRequests_hotelId_hotels_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payoutRequests" ADD CONSTRAINT "payoutRequests_requestedBy_users_id_fk" FOREIGN KEY ("requestedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payoutRequests" ADD CONSTRAINT "payoutRequests_processedBy_users_id_fk" FOREIGN KEY ("processedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_bookingId_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_hotelId_hotels_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;