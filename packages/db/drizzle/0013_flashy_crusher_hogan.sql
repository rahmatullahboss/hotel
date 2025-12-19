CREATE SEQUENCE "public"."hotel_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "shiftHandoverReports" (
	"id" text PRIMARY KEY NOT NULL,
	"hotelId" text NOT NULL,
	"fromStaffId" text NOT NULL,
	"toStaffId" text,
	"pendingTasks" jsonb DEFAULT '[]'::jsonb,
	"completedTasks" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"checkInsHandled" text DEFAULT '0',
	"checkOutsHandled" text DEFAULT '0',
	"walkInsRecorded" text DEFAULT '0',
	"issuesReported" text DEFAULT '0',
	"handoverTime" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staffAttendance" (
	"id" text PRIMARY KEY NOT NULL,
	"hotelId" text NOT NULL,
	"staffId" text NOT NULL,
	"shiftId" text,
	"clockInTime" timestamp NOT NULL,
	"clockOutTime" timestamp,
	"clockInNote" text,
	"clockOutNote" text,
	"totalHoursWorked" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staffShifts" (
	"id" text PRIMARY KEY NOT NULL,
	"hotelId" text NOT NULL,
	"staffId" text NOT NULL,
	"shiftDate" date NOT NULL,
	"startTime" time NOT NULL,
	"endTime" time NOT NULL,
	"status" text DEFAULT 'SCHEDULED' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hotels" DROP CONSTRAINT "hotels_vibeCode_unique";--> statement-breakpoint
ALTER TABLE "hotels" ADD COLUMN "serialNumber" integer DEFAULT nextval('hotel_id_seq');--> statement-breakpoint
ALTER TABLE "hotels" ADD COLUMN "zinuCode" text;--> statement-breakpoint
ALTER TABLE "shiftHandoverReports" ADD CONSTRAINT "shiftHandoverReports_hotelId_hotels_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shiftHandoverReports" ADD CONSTRAINT "shiftHandoverReports_fromStaffId_hotelStaff_id_fk" FOREIGN KEY ("fromStaffId") REFERENCES "public"."hotelStaff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shiftHandoverReports" ADD CONSTRAINT "shiftHandoverReports_toStaffId_hotelStaff_id_fk" FOREIGN KEY ("toStaffId") REFERENCES "public"."hotelStaff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staffAttendance" ADD CONSTRAINT "staffAttendance_hotelId_hotels_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staffAttendance" ADD CONSTRAINT "staffAttendance_staffId_hotelStaff_id_fk" FOREIGN KEY ("staffId") REFERENCES "public"."hotelStaff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staffAttendance" ADD CONSTRAINT "staffAttendance_shiftId_staffShifts_id_fk" FOREIGN KEY ("shiftId") REFERENCES "public"."staffShifts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staffShifts" ADD CONSTRAINT "staffShifts_hotelId_hotels_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staffShifts" ADD CONSTRAINT "staffShifts_staffId_hotelStaff_id_fk" FOREIGN KEY ("staffId") REFERENCES "public"."hotelStaff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "staff_shift_date_unique" ON "staffShifts" USING btree ("staffId","shiftDate");--> statement-breakpoint
ALTER TABLE "hotels" DROP COLUMN "vibeCode";--> statement-breakpoint
ALTER TABLE "hotels" ADD CONSTRAINT "hotels_zinuCode_unique" UNIQUE("zinuCode");