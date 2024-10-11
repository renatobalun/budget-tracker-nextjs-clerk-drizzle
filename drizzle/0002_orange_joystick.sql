ALTER TABLE "user_messages" RENAME TO "users";--> statement-breakpoint
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_user_id_user_messages_user_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "user_messages_currency_id_currency_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "currency_id" SET DEFAULT 0;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_currency_id_currency_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currency"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
