ALTER TABLE "projects" DROP CONSTRAINT "projects_client_id_clients_id_fk";--> statement-breakpoint
DROP INDEX "projects_client_id_idx";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "client_id";--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "client_name" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "client_phone" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "client_address" text;
