CREATE TABLE "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"symbol" varchar(32) NOT NULL,
	"name" text NOT NULL,
	"image_url" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset_markets" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"provider" text NOT NULL,
	"symbol" varchar(32) NOT NULL,
	"quote" varchar(16) NOT NULL,
	CONSTRAINT "asset_markets_provider_symbol_unique" UNIQUE("provider","symbol")
);
--> statement-breakpoint
CREATE TABLE "asset_networks" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"chain_caip2" text NOT NULL,
	"contract_address" text,
	"decimals" integer,
	"is_native" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset_providers" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"provider" text NOT NULL,
	"provider_id" text NOT NULL,
	CONSTRAINT "asset_providers_provider_id_unique" UNIQUE("provider","provider_id")
);
--> statement-breakpoint
ALTER TABLE "coin_watches" DROP CONSTRAINT "coin_watches_gecko_id_coin_markets_id_fk";
--> statement-breakpoint
DROP INDEX "coin_watches_user_gecko_unique";--> statement-breakpoint
ALTER TABLE "coin_markets" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "coin_sync" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "coin_markets" CASCADE;--> statement-breakpoint
DROP TABLE "coin_sync" CASCADE;--> statement-breakpoint
ALTER TABLE "coin_watches" ADD COLUMN "asset_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "asset_markets" ADD CONSTRAINT "asset_markets_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_networks" ADD CONSTRAINT "asset_networks_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_providers" ADD CONSTRAINT "asset_providers_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_markets_asset_id_idx" ON "asset_markets" USING btree ("asset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "asset_networks_chain_contract_unique" ON "asset_networks" USING btree ("chain_caip2","contract_address") WHERE "asset_networks"."contract_address" is not null;--> statement-breakpoint
CREATE INDEX "asset_networks_asset_id_idx" ON "asset_networks" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "asset_providers_asset_id_idx" ON "asset_providers" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "assets_symbol_idx" ON "assets" USING btree ("symbol");--> statement-breakpoint
ALTER TABLE "coin_watches" ADD CONSTRAINT "coin_watches_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "coin_watches_user_asset_unique" ON "coin_watches" USING btree ("user_id","asset_id");--> statement-breakpoint
ALTER TABLE "coin_watches" DROP COLUMN "gecko_id";
