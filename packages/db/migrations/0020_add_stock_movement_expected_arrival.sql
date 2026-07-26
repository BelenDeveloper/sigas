ALTER TABLE "stock_movements" ADD COLUMN "expected_arrival_date" date;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD COLUMN "status" text DEFAULT 'completed' NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD COLUMN "received_at" timestamp with time zone;