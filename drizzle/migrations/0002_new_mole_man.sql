CREATE TYPE "public"."idea_status" AS ENUM('new', 'under_review', 'planned', 'done');--> statement-breakpoint
CREATE TABLE "idea" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" "idea_status" DEFAULT 'new' NOT NULL,
	"submitter_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "idea" ADD CONSTRAINT "idea_submitter_id_user_id_fk" FOREIGN KEY ("submitter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idea_submitter_id_idx" ON "idea" USING btree ("submitter_id");