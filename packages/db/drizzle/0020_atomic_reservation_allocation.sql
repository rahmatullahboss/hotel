ALTER TABLE "bookings" ADD CONSTRAINT "bookings_valid_stay" CHECK ("bookings"."checkIn" < "bookings"."checkOut");--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS "btree_gist";
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_room_stay_no_overlap" EXCLUDE USING gist (
  "roomId" WITH =,
  daterange("checkIn", "checkOut", '[)') WITH &&
) WHERE ("status" <> 'CANCELLED');
