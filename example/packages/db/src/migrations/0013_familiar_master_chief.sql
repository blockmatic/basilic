CREATE TABLE "auth_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"type" text DEFAULT 'magic_link' NOT NULL,
	"failed_attempts" integer DEFAULT 0 NOT NULL,
	"first_failure_at" timestamp,
	"locked_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "auth_attempts_key_type_idx" ON "auth_attempts" USING btree ("key","type");