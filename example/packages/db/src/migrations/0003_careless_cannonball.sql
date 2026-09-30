ALTER TABLE "sessions" ADD COLUMN "wallet_chain" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "wallet_address" text;--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN "type" text DEFAULT 'magic_link' NOT NULL;