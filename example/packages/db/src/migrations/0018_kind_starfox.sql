ALTER TABLE "sessions" ADD COLUMN "sign_in_method" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "device_label" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "device_fingerprint" text;--> statement-breakpoint
CREATE INDEX "sessions_user_id_device_fingerprint_idx" ON "sessions" USING btree ("user_id","device_fingerprint");