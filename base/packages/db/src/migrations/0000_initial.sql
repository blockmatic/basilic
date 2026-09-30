CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "account_provider_account_unique" UNIQUE("provider_id","account_id")
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"hash" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"last_used_at" timestamp,
	"name" text NOT NULL,
	"prefix" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "api_keys_prefix_unique" UNIQUE("prefix")
);
--> statement-breakpoint
CREATE TABLE "auth_attempts" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"failed_attempts" integer DEFAULT 0 NOT NULL,
	"first_failure_at" timestamp,
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"locked_until" timestamp,
	"type" text DEFAULT 'magic_link' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passkey_auth_challenges" (
	"challenge" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passkey_callback" (
	"access_token" text NOT NULL,
	"callback_origin" text DEFAULT '' NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"refresh_token" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passkey_challenges" (
	"challenge" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passkey_credentials" (
	"counter" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"credential_backed_up" boolean,
	"credential_device_type" text,
	"credential_id" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"public_key" text NOT NULL,
	"transports" jsonb,
	"user_id" text NOT NULL,
	CONSTRAINT "passkey_credentials_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"current_jti" text,
	"device_fingerprint" text,
	"device_label" text,
	"expires_at" timestamp NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"ip_address" text,
	"location" text,
	"previous_token" text,
	"rotated_at" timestamp,
	"sign_in_method" text,
	"token" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "totp_setup" (
	"expires_at" timestamp NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"secret_encrypted" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "totp_setup_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "totp" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"secret_encrypted" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "totp_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"email" varchar(255),
	"email_verified" boolean DEFAULT false NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"image" text,
	"name" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"username" varchar(48),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"consumed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"meta" jsonb,
	"token_plain" text,
	"type" text DEFAULT 'magic_link' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passkey_challenges" ADD CONSTRAINT "passkey_challenges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passkey_credentials" ADD CONSTRAINT "passkey_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "totp_setup" ADD CONSTRAINT "totp_setup_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "totp" ADD CONSTRAINT "totp_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_account_id_idx" ON "account" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "api_keys_prefix_idx" ON "api_keys" USING btree ("prefix");--> statement-breakpoint
CREATE INDEX "api_keys_user_id_idx" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_attempts_key_type_idx" ON "auth_attempts" USING btree ("key","type");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_attempts_key_type_unique" ON "auth_attempts" USING btree ("key","type");--> statement-breakpoint
CREATE INDEX "passkey_auth_challenges_session_id_idx" ON "passkey_auth_challenges" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "passkey_auth_challenges_expires_at_idx" ON "passkey_auth_challenges" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "passkey_callback_code_hash_idx" ON "passkey_callback" USING btree ("code_hash");--> statement-breakpoint
CREATE INDEX "passkey_callback_expires_at_idx" ON "passkey_callback" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "passkey_challenges_user_id_idx" ON "passkey_challenges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "passkey_challenges_expires_at_idx" ON "passkey_challenges" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "passkey_credentials_user_id_idx" ON "passkey_credentials" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_idx" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "sessions_user_id_device_fingerprint_idx" ON "sessions" USING btree ("user_id","device_fingerprint");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verification_expires_at_idx" ON "verification" USING btree ("expires_at");