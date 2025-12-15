ALTER TABLE "pushSubscriptions" ALTER COLUMN "endpoint" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pushSubscriptions" ALTER COLUMN "p256dh" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pushSubscriptions" ALTER COLUMN "auth" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pushSubscriptions" ADD COLUMN "platform" text DEFAULT 'web' NOT NULL;--> statement-breakpoint
ALTER TABLE "pushSubscriptions" ADD COLUMN "expoPushToken" text;