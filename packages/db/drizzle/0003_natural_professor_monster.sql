CREATE TABLE "seasonalRules" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"startDate" date NOT NULL,
	"endDate" date NOT NULL,
	"multiplier" numeric(4, 2) NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
