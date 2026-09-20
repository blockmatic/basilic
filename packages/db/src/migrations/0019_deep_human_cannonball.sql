ALTER TABLE "sessions" ADD COLUMN "previous_token" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "current_jti" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "rotated_at" timestamp;