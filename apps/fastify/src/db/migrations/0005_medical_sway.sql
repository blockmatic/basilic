ALTER TABLE "api_keys" ALTER COLUMN "last_used_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "last_used_at" DROP NOT NULL;