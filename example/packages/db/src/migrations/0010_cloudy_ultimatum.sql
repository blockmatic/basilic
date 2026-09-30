DROP INDEX "passkey_credentials_credential_id_idx";--> statement-breakpoint
DROP INDEX "totp_setup_user_id_idx";--> statement-breakpoint
DROP INDEX "totp_user_id_idx";--> statement-breakpoint
ALTER TABLE "passkey_credentials" ALTER COLUMN "counter" SET DATA TYPE integer USING counter::integer;--> statement-breakpoint
ALTER TABLE "passkey_callback" ADD COLUMN "callback_origin" text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX "passkey_challenges_expires_at_idx" ON "passkey_challenges" USING btree ("expires_at");