ALTER TABLE "users" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleteScheduledFor" timestamp;