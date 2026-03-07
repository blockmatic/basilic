CREATE TABLE "passkey_auth_challenges" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"challenge" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passkey_callback" (
	"id" text PRIMARY KEY NOT NULL,
	"code_hash" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX "passkey_auth_challenges_session_id_idx" ON "passkey_auth_challenges" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "passkey_auth_challenges_expires_at_idx" ON "passkey_auth_challenges" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "passkey_callback_code_hash_idx" ON "passkey_callback" USING btree ("code_hash");--> statement-breakpoint
CREATE INDEX "passkey_callback_expires_at_idx" ON "passkey_callback" USING btree ("expires_at");