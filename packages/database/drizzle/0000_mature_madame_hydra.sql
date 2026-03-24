CREATE TABLE IF NOT EXISTS "merchant" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"clerk_id" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "merchant_slug_unique" UNIQUE("slug"),
	CONSTRAINT "merchant_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "waba" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_id" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text,
	"provider_app_id" text,
	"business_portfolio_id" text,
	"coexist_enabled" boolean DEFAULT false NOT NULL,
	"onboarding_method" text,
	"name" text,
	"status" text DEFAULT 'active' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "waba_phone_number" (
	"id" text PRIMARY KEY NOT NULL,
	"waba_id" text NOT NULL,
	"merchant_id" text NOT NULL,
	"provider_phone_number_id" text,
	"phone_number" text NOT NULL,
	"display_name" text,
	"status" text DEFAULT 'active' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "waba_credential" (
	"id" text PRIMARY KEY NOT NULL,
	"waba_id" text NOT NULL,
	"provider" text NOT NULL,
	"type" text NOT NULL,
	"value" text,
	"metadata" text,
	"expires_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "waba_webhook" (
	"id" text PRIMARY KEY NOT NULL,
	"waba_id" text NOT NULL,
	"url" text NOT NULL,
	"secret" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "waba_template" (
	"id" text PRIMARY KEY NOT NULL,
	"waba_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"language" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"provider_template_id" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email" (
	"id" text PRIMARY KEY NOT NULL,
	"resend_id" text NOT NULL,
	"direction" text NOT NULL,
	"from" text NOT NULL,
	"to" jsonb NOT NULL,
	"cc" jsonb,
	"bcc" jsonb,
	"reply_to" jsonb,
	"subject" text NOT NULL,
	"text" text,
	"html" text,
	"headers" jsonb,
	"last_event" text,
	"scheduled_at" timestamp,
	"resend_created_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_resend_id_unique" UNIQUE("resend_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_attachment" (
	"id" text PRIMARY KEY NOT NULL,
	"email_id" text NOT NULL,
	"resend_attachment_id" text,
	"filename" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "waba" ADD CONSTRAINT "waba_merchant_id_merchant_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "merchant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "waba_phone_number" ADD CONSTRAINT "waba_phone_number_waba_id_waba_id_fk" FOREIGN KEY ("waba_id") REFERENCES "waba"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "waba_phone_number" ADD CONSTRAINT "waba_phone_number_merchant_id_merchant_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "merchant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "waba_credential" ADD CONSTRAINT "waba_credential_waba_id_waba_id_fk" FOREIGN KEY ("waba_id") REFERENCES "waba"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "waba_webhook" ADD CONSTRAINT "waba_webhook_waba_id_waba_id_fk" FOREIGN KEY ("waba_id") REFERENCES "waba"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "waba_template" ADD CONSTRAINT "waba_template_waba_id_waba_id_fk" FOREIGN KEY ("waba_id") REFERENCES "waba"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_attachment" ADD CONSTRAINT "email_attachment_email_id_email_id_fk" FOREIGN KEY ("email_id") REFERENCES "email"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
