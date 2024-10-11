CREATE TABLE IF NOT EXISTS "users_categories" (
	"user_id" text NOT NULL,
	"category_id" integer NOT NULL,
	CONSTRAINT "users_categories_user_id_category_id_pk" PRIMARY KEY("user_id","category_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_categories" ADD CONSTRAINT "users_categories_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_categories" ADD CONSTRAINT "users_categories_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
