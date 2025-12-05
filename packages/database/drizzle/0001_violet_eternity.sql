CREATE TABLE IF NOT EXISTS "store" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"waba_id" text,
	"phone_number_id" text,
	"access_token" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "store_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "store_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "store_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "store_id" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "category" ADD CONSTRAINT "category_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product" ADD CONSTRAINT "product_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "merchant" DROP COLUMN IF EXISTS "waba_id";--> statement-breakpoint
ALTER TABLE "merchant" DROP COLUMN IF EXISTS "phone_number_id";--> statement-breakpoint
ALTER TABLE "merchant" DROP COLUMN IF EXISTS "access_token";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "store" ADD CONSTRAINT "store_merchant_id_merchant_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "merchant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
