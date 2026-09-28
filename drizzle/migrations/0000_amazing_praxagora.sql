CREATE TYPE "public"."role" AS ENUM('employee', 'admin');--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar NOT NULL,
	"role" "role" DEFAULT 'employee' NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
