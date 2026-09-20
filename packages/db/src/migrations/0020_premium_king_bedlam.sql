CREATE TABLE "coin_markets" (
	"id" text PRIMARY KEY NOT NULL,
	"symbol" varchar(32) NOT NULL,
	"name" text NOT NULL,
	"image_url" text,
	"price_usd" double precision NOT NULL,
	"change24h" double precision DEFAULT 0 NOT NULL,
	"volume_usd" double precision DEFAULT 0 NOT NULL,
	"market_cap_usd" double precision DEFAULT 0 NOT NULL,
	"rank" integer DEFAULT 0 NOT NULL,
	"fetched_at" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coin_sync" (
	"id" text PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"fetched_at" timestamp,
	"last_error" text,
	"last_status" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coin_watches" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"gecko_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "coin_watches" ADD CONSTRAINT "coin_watches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coin_watches" ADD CONSTRAINT "coin_watches_gecko_id_coin_markets_id_fk" FOREIGN KEY ("gecko_id") REFERENCES "public"."coin_markets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coin_markets_rank_idx" ON "coin_markets" USING btree ("rank");--> statement-breakpoint
CREATE INDEX "coin_markets_symbol_idx" ON "coin_markets" USING btree ("symbol");--> statement-breakpoint
CREATE UNIQUE INDEX "coin_watches_user_gecko_unique" ON "coin_watches" USING btree ("user_id","gecko_id");--> statement-breakpoint
CREATE INDEX "coin_watches_user_id_idx" ON "coin_watches" USING btree ("user_id");