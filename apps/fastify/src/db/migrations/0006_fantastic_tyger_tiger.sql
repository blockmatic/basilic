CREATE TABLE "web3_callback" (
	"id" text PRIMARY KEY NOT NULL,
	"code_hash" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "web3_callback_code_hash_idx" ON "web3_callback" USING btree ("code_hash");--> statement-breakpoint
CREATE INDEX "web3_callback_expires_at_idx" ON "web3_callback" USING btree ("expires_at");