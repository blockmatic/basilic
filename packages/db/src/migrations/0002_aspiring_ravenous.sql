CREATE TABLE "web3_nonce" (
	"id" text PRIMARY KEY NOT NULL,
	"chain" text NOT NULL,
	"address" text NOT NULL,
	"nonce" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "web3_nonce_chain_address_idx" ON "web3_nonce" USING btree ("chain","address");--> statement-breakpoint
CREATE INDEX "web3_nonce_expires_at_idx" ON "web3_nonce" USING btree ("expires_at");