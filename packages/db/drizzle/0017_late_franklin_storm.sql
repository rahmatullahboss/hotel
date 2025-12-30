CREATE TYPE "public"."maintenance_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."maintenance_status" AS ENUM('OPEN', 'IN_PROGRESS', 'PENDING_PARTS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."maintenance_type" AS ENUM('PLUMBING', 'ELECTRICAL', 'HVAC', 'FURNITURE', 'CLEANING', 'APPLIANCE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."preventive_frequency" AS ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');--> statement-breakpoint
CREATE TYPE "public"."preventive_scope" AS ENUM('ALL_ROOMS', 'SPECIFIC_ROOMS', 'COMMON_AREAS');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('PENDING', 'SENT', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('PRE_ARRIVAL', 'WELCOME', 'POST_STAY', 'CUSTOM');--> statement-breakpoint
CREATE TYPE "public"."yield_rule_type" AS ENUM('OCCUPANCY_THRESHOLD', 'ADVANCE_BOOKING', 'DAY_OF_WEEK', 'SEASONAL');--> statement-breakpoint
CREATE TABLE "maintenance_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"hotel_id" text NOT NULL,
	"room_number" text,
	"location" text NOT NULL,
	"type" "maintenance_type" NOT NULL,
	"priority" "maintenance_priority" DEFAULT 'MEDIUM' NOT NULL,
	"status" "maintenance_status" DEFAULT 'OPEN' NOT NULL,
	"description" text NOT NULL,
	"reported_by" text NOT NULL,
	"reported_by_user_id" text,
	"assigned_to" text,
	"assigned_vendor_id" text,
	"estimated_cost" integer,
	"actual_cost" integer,
	"photos" jsonb,
	"notes" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preventive_maintenance_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"schedule_id" text NOT NULL,
	"completed_by" text NOT NULL,
	"completed_by_user_id" text,
	"checklist_results" jsonb,
	"notes" text,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preventive_maintenance_schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"hotel_id" text NOT NULL,
	"name" text NOT NULL,
	"frequency" "preventive_frequency" NOT NULL,
	"scope" "preventive_scope" NOT NULL,
	"description" text,
	"checklist" jsonb NOT NULL,
	"specific_rooms" jsonb,
	"is_active" boolean DEFAULT true,
	"last_completed_at" timestamp,
	"next_due_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" text PRIMARY KEY NOT NULL,
	"hotel_id" text NOT NULL,
	"name" text NOT NULL,
	"categories" jsonb NOT NULL,
	"contact_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"address" text,
	"rating" integer DEFAULT 0,
	"total_jobs" integer DEFAULT 0,
	"is_preferred" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guest_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"hotel_id" text NOT NULL,
	"booking_id" text,
	"guest_name" text NOT NULL,
	"guest_email" text,
	"guest_phone" text,
	"type" "message_type" NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"status" "message_status" DEFAULT 'PENDING' NOT NULL,
	"sent_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"hotel_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "message_type" NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"send_timing" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messaging_automation_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"hotel_id" text NOT NULL,
	"pre_arrival_enabled" boolean DEFAULT true,
	"pre_arrival_hours" integer DEFAULT 24,
	"welcome_message_enabled" boolean DEFAULT true,
	"post_stay_enabled" boolean DEFAULT true,
	"post_stay_hours" integer DEFAULT 2,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "messaging_automation_settings_hotel_id_unique" UNIQUE("hotel_id")
);
--> statement-breakpoint
CREATE TABLE "demand_forecasts" (
	"id" text PRIMARY KEY NOT NULL,
	"hotel_id" text NOT NULL,
	"date" text NOT NULL,
	"predicted_occupancy" integer NOT NULL,
	"predicted_demand" text NOT NULL,
	"suggested_price_multiplier" real NOT NULL,
	"events" jsonb,
	"confidence" integer NOT NULL,
	"computed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_history" (
	"id" text PRIMARY KEY NOT NULL,
	"hotel_id" text NOT NULL,
	"room_type_id" text,
	"date" text NOT NULL,
	"base_price" integer NOT NULL,
	"adjusted_price" integer NOT NULL,
	"applied_rules" jsonb,
	"source" text DEFAULT 'MANUAL',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"hotel_id" text NOT NULL,
	"name" text NOT NULL,
	"report_type" text NOT NULL,
	"frequency" text NOT NULL,
	"format" text DEFAULT 'PDF',
	"recipients" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_sent_at" timestamp,
	"next_scheduled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "yield_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"hotel_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "yield_rule_type" NOT NULL,
	"condition" jsonb NOT NULL,
	"action" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"priority" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_reported_by_user_id_users_id_fk" FOREIGN KEY ("reported_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_assigned_vendor_id_vendors_id_fk" FOREIGN KEY ("assigned_vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preventive_maintenance_logs" ADD CONSTRAINT "preventive_maintenance_logs_schedule_id_preventive_maintenance_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."preventive_maintenance_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preventive_maintenance_logs" ADD CONSTRAINT "preventive_maintenance_logs_completed_by_user_id_users_id_fk" FOREIGN KEY ("completed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preventive_maintenance_schedules" ADD CONSTRAINT "preventive_maintenance_schedules_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_messages" ADD CONSTRAINT "guest_messages_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_messages" ADD CONSTRAINT "guest_messages_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messaging_automation_settings" ADD CONSTRAINT "messaging_automation_settings_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_forecasts" ADD CONSTRAINT "demand_forecasts_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_reports" ADD CONSTRAINT "scheduled_reports_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "yield_rules" ADD CONSTRAINT "yield_rules_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;