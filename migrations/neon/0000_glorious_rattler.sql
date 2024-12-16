DO $$ BEGIN
 CREATE TYPE "public"."ambience_enum" AS ENUM('Cozy', 'Vibrant', 'Rustic', 'Modern', 'Romantic', 'Chic', 'Vintage', 'Elegant', 'Casual', 'Industrial', 'Beachy', 'Bohemian', 'Garden', 'Traditional', 'Festive', 'Minimalist', 'Urban', 'Artistic', 'Luxurious', 'Quirky', 'Serene');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."cultural_authenticity_enum" AS ENUM('Not Authentic', 'Somewhat Authentic', 'Authentic', 'Highly Authentic');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."price_range_enum" AS ENUM('Inexpensive', 'Moderate', 'Expensive', 'Very Expensive');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."vibes_enum" AS ENUM('Romantic', 'Family-Friendly', 'Lively', 'Quiet', 'Trendy', 'Chill', 'Upscale');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"event_id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"event_type" varchar,
	"event_date" timestamp,
	"entry_fee" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "item_ambience" (
	"item_id" integer NOT NULL,
	"ambience" "ambience_enum",
	CONSTRAINT "item_ambience_item_id_ambience_pk" PRIMARY KEY("item_id","ambience")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "item_keywords" (
	"item_id" integer NOT NULL,
	"keyword_id" integer NOT NULL,
	CONSTRAINT "item_keywords_item_id_keyword_id_pk" PRIMARY KEY("item_id","keyword_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "item_vibes" (
	"item_id" integer NOT NULL,
	"vibe" "vibes_enum",
	CONSTRAINT "item_vibes_item_id_vibe_pk" PRIMARY KEY("item_id","vibe")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "items" (
	"item_id" serial PRIMARY KEY NOT NULL,
	"item_name" varchar NOT NULL,
	"category" varchar NOT NULL,
	"sub_category" varchar,
	"description" text,
	"latitude" double precision,
	"longitude" double precision,
	"price_range" "price_range_enum",
	"item_address" text,
	"item_zipcode" varchar(10),
	"historical_significance" boolean,
	"cultural_authenticity" "cultural_authenticity_enum",
	"specialties" varchar[],
	"opening_hours" json,
	"active_status" boolean DEFAULT true NOT NULL,
	"image_urls" varchar[],
	"keywords" varchar[]
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "keywords" (
	"keyword_id" serial PRIMARY KEY NOT NULL,
	"keyword" varchar NOT NULL,
	CONSTRAINT "keywords_keyword_unique" UNIQUE("keyword")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ratings" (
	"rating_id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"average_rating" double precision,
	"review_count" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reviews" (
	"review_id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"user_id" integer,
	"review_text" text,
	"review_rating" integer,
	"review_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"user_name" varchar,
	"user_email" varchar,
	"preferences" json,
	CONSTRAINT "users_user_email_unique" UNIQUE("user_email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_item_id_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("item_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "item_ambience" ADD CONSTRAINT "item_ambience_item_id_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("item_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "item_keywords" ADD CONSTRAINT "item_keywords_item_id_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("item_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "item_keywords" ADD CONSTRAINT "item_keywords_keyword_id_keywords_keyword_id_fk" FOREIGN KEY ("keyword_id") REFERENCES "public"."keywords"("keyword_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "item_vibes" ADD CONSTRAINT "item_vibes_item_id_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("item_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ratings" ADD CONSTRAINT "ratings_item_id_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("item_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_item_id_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("item_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
