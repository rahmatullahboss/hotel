CREATE TABLE "channelConnections" (
	"id" text PRIMARY KEY NOT NULL,
	"hotelId" text NOT NULL,
	"channelType" text NOT NULL,
	"externalPropertyId" text,
	"apiCredentials" jsonb,
	"isActive" boolean DEFAULT false NOT NULL,
	"lastSyncAt" timestamp,
	"syncStatus" text DEFAULT 'IDLE',
	"syncError" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "channelRoomMappings" (
	"id" text PRIMARY KEY NOT NULL,
	"channelConnectionId" text NOT NULL,
	"localRoomId" text NOT NULL,
	"externalRoomTypeId" text NOT NULL,
	"externalRatePlanId" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "syncLogs" (
	"id" text PRIMARY KEY NOT NULL,
	"channelConnectionId" text NOT NULL,
	"operation" text NOT NULL,
	"status" text NOT NULL,
	"requestPayload" jsonb,
	"responsePayload" jsonb,
	"errorMessage" text,
	"affectedRooms" jsonb,
	"bookingsCreated" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "externalBookingId" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "channelConnectionId" text;--> statement-breakpoint
ALTER TABLE "channelConnections" ADD CONSTRAINT "channelConnections_hotelId_hotels_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channelRoomMappings" ADD CONSTRAINT "channelRoomMappings_channelConnectionId_channelConnections_id_fk" FOREIGN KEY ("channelConnectionId") REFERENCES "public"."channelConnections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channelRoomMappings" ADD CONSTRAINT "channelRoomMappings_localRoomId_rooms_id_fk" FOREIGN KEY ("localRoomId") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "syncLogs" ADD CONSTRAINT "syncLogs_channelConnectionId_channelConnections_id_fk" FOREIGN KEY ("channelConnectionId") REFERENCES "public"."channelConnections"("id") ON DELETE cascade ON UPDATE no action;