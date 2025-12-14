CREATE TYPE "public"."corporate_status" AS ENUM('PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "corporateAccounts" (
	"id" text PRIMARY KEY NOT NULL,
	"companyName" text NOT NULL,
	"companyNameBn" text,
	"registrationNumber" text,
	"industry" text,
	"companySize" text,
	"website" text,
	"contactName" text NOT NULL,
	"contactEmail" text NOT NULL,
	"contactPhone" text NOT NULL,
	"contactDesignation" text,
	"address" text,
	"city" text,
	"billingEmail" text,
	"billingCycle" text DEFAULT 'PREPAID',
	"creditLimit" numeric(10, 2) DEFAULT '0',
	"currentBalance" numeric(10, 2) DEFAULT '0',
	"discountPercentage" numeric(5, 2) DEFAULT '0',
	"status" "corporate_status" DEFAULT 'PENDING' NOT NULL,
	"approvedBy" text,
	"approvedAt" timestamp,
	"rejectionReason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "corporateAccounts_contactEmail_unique" UNIQUE("contactEmail")
);
--> statement-breakpoint
CREATE TABLE "corporateBookings" (
	"id" text PRIMARY KEY NOT NULL,
	"corporateAccountId" text NOT NULL,
	"hotelId" text NOT NULL,
	"bookedBy" text NOT NULL,
	"approvedBy" text,
	"bookingReference" text NOT NULL,
	"checkIn" text NOT NULL,
	"checkOut" text NOT NULL,
	"roomCount" integer NOT NULL,
	"guestsPerRoom" integer DEFAULT 2 NOT NULL,
	"specialRequests" text,
	"baseAmount" numeric(10, 2) NOT NULL,
	"discountAmount" numeric(10, 2) DEFAULT '0',
	"totalAmount" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'PENDING_APPROVAL' NOT NULL,
	"paymentStatus" text DEFAULT 'PENDING' NOT NULL,
	"invoiceNumber" text,
	"invoicedAt" timestamp,
	"paidAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "corporateBookings_bookingReference_unique" UNIQUE("bookingReference")
);
--> statement-breakpoint
CREATE TABLE "corporateInvoices" (
	"id" text PRIMARY KEY NOT NULL,
	"corporateAccountId" text NOT NULL,
	"invoiceNumber" text NOT NULL,
	"periodStart" text NOT NULL,
	"periodEnd" text NOT NULL,
	"totalAmount" numeric(10, 2) NOT NULL,
	"taxAmount" numeric(10, 2) DEFAULT '0',
	"grandTotal" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"dueDate" text NOT NULL,
	"paidAt" timestamp,
	"paymentReference" text,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "corporateInvoices_invoiceNumber_unique" UNIQUE("invoiceNumber")
);
--> statement-breakpoint
CREATE TABLE "corporateUsers" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"corporateAccountId" text NOT NULL,
	"role" text DEFAULT 'EMPLOYEE' NOT NULL,
	"department" text,
	"employeeId" text,
	"canApproveBookings" boolean DEFAULT false NOT NULL,
	"monthlyLimit" numeric(10, 2),
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "corporateAccounts" ADD CONSTRAINT "corporateAccounts_approvedBy_users_id_fk" FOREIGN KEY ("approvedBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporateBookings" ADD CONSTRAINT "corporateBookings_corporateAccountId_corporateAccounts_id_fk" FOREIGN KEY ("corporateAccountId") REFERENCES "public"."corporateAccounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporateBookings" ADD CONSTRAINT "corporateBookings_hotelId_hotels_id_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporateBookings" ADD CONSTRAINT "corporateBookings_bookedBy_users_id_fk" FOREIGN KEY ("bookedBy") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporateBookings" ADD CONSTRAINT "corporateBookings_approvedBy_users_id_fk" FOREIGN KEY ("approvedBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporateInvoices" ADD CONSTRAINT "corporateInvoices_corporateAccountId_corporateAccounts_id_fk" FOREIGN KEY ("corporateAccountId") REFERENCES "public"."corporateAccounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporateUsers" ADD CONSTRAINT "corporateUsers_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporateUsers" ADD CONSTRAINT "corporateUsers_corporateAccountId_corporateAccounts_id_fk" FOREIGN KEY ("corporateAccountId") REFERENCES "public"."corporateAccounts"("id") ON DELETE cascade ON UPDATE no action;