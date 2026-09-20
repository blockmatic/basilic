CREATE TABLE "passkey_challenges" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"challenge" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passkey_credentials" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"credential_id" text NOT NULL,
	"public_key" text NOT NULL,
	"counter" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "passkey_credentials_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
CREATE TABLE "totp_setup" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"secret_encrypted" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "totp_setup_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "totp" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"secret_encrypted" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "totp_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "passkey_challenges" ADD CONSTRAINT "passkey_challenges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passkey_credentials" ADD CONSTRAINT "passkey_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "totp_setup" ADD CONSTRAINT "totp_setup_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "totp" ADD CONSTRAINT "totp_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "passkey_challenges_user_id_idx" ON "passkey_challenges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "passkey_credentials_user_id_idx" ON "passkey_credentials" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "passkey_credentials_credential_id_idx" ON "passkey_credentials" USING btree ("credential_id");--> statement-breakpoint
CREATE INDEX "totp_setup_user_id_idx" ON "totp_setup" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "totp_user_id_idx" ON "totp" USING btree ("user_id");