ALTER TABLE "passkey_credentials" ADD COLUMN "transports" jsonb;--> statement-breakpoint
ALTER TABLE "passkey_credentials" ADD COLUMN "credential_device_type" text;--> statement-breakpoint
ALTER TABLE "passkey_credentials" ADD COLUMN "credential_backed_up" boolean;