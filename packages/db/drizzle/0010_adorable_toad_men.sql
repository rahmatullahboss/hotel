CREATE TABLE "savedHotels" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"hotelId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "savedHotels" ADD CONSTRAINT "savedHotels_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "savedHotels" ADD CONSTRAINT "savedHotels_hotelId_hotels_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_hotel_saved_unique" ON "savedHotels" USING btree ("userId","hotelId");