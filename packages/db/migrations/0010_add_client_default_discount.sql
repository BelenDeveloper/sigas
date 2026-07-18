ALTER TABLE "clients" ADD COLUMN "default_discount_type" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "default_discount_value" numeric(12, 2);