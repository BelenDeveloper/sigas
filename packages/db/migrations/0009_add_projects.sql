CREATE SEQUENCE "public"."project_code_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "project_approval_checklist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"step_number" integer NOT NULL,
	"step_description" text NOT NULL,
	"channel" text,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"completed_by" uuid,
	"notes" text,
	CONSTRAINT "project_approval_checklist_project_id_step_number_unique" UNIQUE("project_id","step_number")
);
--> statement-breakpoint
CREATE TABLE "project_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"stage" text,
	"name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text,
	"uploaded_by" uuid NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"stage" text,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"payment_method" text NOT NULL,
	"receipt_url" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_logistics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"assigned_logistics_user" uuid,
	"logistics_notes" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_logistics_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "project_logistics_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"stage" text NOT NULL,
	"description" text NOT NULL,
	"assigned_to" uuid,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"completed_by" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_payments_received" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"payment_number" integer NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"payment_method" text NOT NULL,
	"account_destination" text,
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text,
	"created_by" uuid NOT NULL,
	CONSTRAINT "project_payments_received_project_id_payment_number_unique" UNIQUE("project_id","payment_number")
);
--> statement-breakpoint
CREATE TABLE "project_stage_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"stage" text NOT NULL,
	"changed_by" uuid NOT NULL,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"company_id" uuid,
	"client_id" uuid,
	"is_private" boolean DEFAULT false NOT NULL,
	"stage" text DEFAULT 'quotation' NOT NULL,
	"description" text,
	"total_value" numeric(12, 2),
	"currency" text DEFAULT 'BOB' NOT NULL,
	"first_payment_amount" numeric(12, 2),
	"second_payment_amount" numeric(12, 2),
	"start_date" date,
	"estimated_end" date,
	"end_date" date,
	"cancellation_reason" text,
	"notes" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "project_approval_checklist" ADD CONSTRAINT "project_approval_checklist_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_approval_checklist" ADD CONSTRAINT "project_approval_checklist_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_expenses" ADD CONSTRAINT "project_expenses_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_expenses" ADD CONSTRAINT "project_expenses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_logistics" ADD CONSTRAINT "project_logistics_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_logistics" ADD CONSTRAINT "project_logistics_assigned_logistics_user_users_id_fk" FOREIGN KEY ("assigned_logistics_user") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_logistics_tasks" ADD CONSTRAINT "project_logistics_tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_logistics_tasks" ADD CONSTRAINT "project_logistics_tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_logistics_tasks" ADD CONSTRAINT "project_logistics_tasks_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_payments_received" ADD CONSTRAINT "project_payments_received_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_payments_received" ADD CONSTRAINT "project_payments_received_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_stage_history" ADD CONSTRAINT "project_stage_history_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_stage_history" ADD CONSTRAINT "project_stage_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_approval_checklist_project_id_idx" ON "project_approval_checklist" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_documents_project_id_idx" ON "project_documents" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_expenses_project_id_idx" ON "project_expenses" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_logistics_tasks_project_id_idx" ON "project_logistics_tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_payments_received_project_id_idx" ON "project_payments_received" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_stage_history_project_id_idx" ON "project_stage_history" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "projects_company_id_idx" ON "projects" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "projects_client_id_idx" ON "projects" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "projects_stage_idx" ON "projects" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "projects_category_idx" ON "projects" USING btree ("category");