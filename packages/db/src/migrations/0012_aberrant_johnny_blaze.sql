ALTER TABLE "users" ADD COLUMN "username" varchar(48);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");