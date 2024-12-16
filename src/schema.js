import { 
    pgTable, 
    serial, 
    integer, 
    varchar, 
    text, 
    boolean, 
    doublePrecision, 
    json, 
    timestamp, 
    primaryKey, 
    pgEnum 
  } from 'drizzle-orm/pg-core';
  
  // Enum Definitions
  export const priceRangeEnum = pgEnum('price_range_enum', ['Inexpensive', 'Moderate', 'Expensive', 'Very Expensive']);
  export const culturalAuthenticityEnum = pgEnum('cultural_authenticity_enum', ['Not Authentic', 'Somewhat Authentic', 'Authentic', 'Highly Authentic']);
  export const ambienceEnum = pgEnum('ambience_enum', [
    'Cozy', 'Vibrant', 'Rustic', 'Modern', 'Romantic', 'Chic', 'Vintage', 'Elegant', 
    'Casual', 'Industrial', 'Beachy', 'Bohemian', 'Garden', 'Traditional', 'Festive', 
    'Minimalist', 'Urban', 'Artistic', 'Luxurious', 'Quirky', 'Serene'
  ]);
  export const vibesEnum = pgEnum('vibes_enum', ['Romantic', 'Family-Friendly', 'Lively', 'Quiet', 'Trendy', 'Chill', 'Upscale']);
  
  // Core Tables
  export const items = pgTable('items', {
    itemId: serial('item_id').primaryKey(),
    itemName: varchar('item_name').notNull(),
    category: varchar('category').notNull(),
    subCategory: varchar('sub_category'),
    description: text('description'),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    priceRange: priceRangeEnum('price_range'),
    itemAddress: text('item_address'), 
    itemZipcode: varchar('item_zipcode', { length: 10 }),
    historicalSignificance: boolean('historical_significance'),
    culturalAuthenticity: culturalAuthenticityEnum('cultural_authenticity'),
    specialties: varchar('specialties').array(),
    openingHours: json('opening_hours'),
    activeStatus: boolean('active_status').notNull().default(true),
    imageUrls: varchar('image_urls').array(),
    keywords: varchar('keywords').array(),
  });
  
  // Events Table
  export const events = pgTable('events', {
    eventId: serial('event_id').primaryKey(),
    itemId: integer('item_id').notNull().references(() => items.itemId, { onDelete: 'cascade' }),
    eventType: varchar('event_type'),
    eventDate: timestamp('event_date'),
    entryFee: integer('entry_fee'),
  });
  
  // Ratings Table
  export const ratings = pgTable('ratings', {
    ratingId: serial('rating_id').primaryKey(),
    itemId: integer('item_id').notNull().references(() => items.itemId, { onDelete: 'cascade' }),
    averageRating: doublePrecision('average_rating'),
    reviewCount: integer('review_count'),
  });
  
  // Ambience & Vibes Table
  export const itemAmbience = pgTable('item_ambience', {
    itemId: integer('item_id').notNull().references(() => items.itemId, { onDelete: 'cascade' }),
    ambience: ambienceEnum('ambience'),
  }, (table) => ({
    pk: primaryKey(table.itemId, table.ambience),
  }));
  
  export const itemVibes = pgTable('item_vibes', {
    itemId: integer('item_id').notNull().references(() => items.itemId, { onDelete: 'cascade' }),
    vibe: vibesEnum('vibe'),
  }, (table) => ({
    pk: primaryKey(table.itemId, table.vibe),
  }));
  
  // Users Table
  export const users = pgTable('users', {
    userId: serial('user_id').primaryKey(),
    userName: varchar('user_name'),
    userEmail: varchar('user_email').unique(),
    preferences: json('preferences'),
  });
  
  // Reviews Table
  export const reviews = pgTable('reviews', {
    reviewId: serial('review_id').primaryKey(),
    itemId: integer('item_id').notNull().references(() => items.itemId, { onDelete: 'cascade' }),
    userId: integer('user_id').references(() => users.userId, { onDelete: 'set null' }),
    reviewText: text('review_text'),
    reviewRating: integer('review_rating'),
    reviewDate: timestamp('review_date').defaultNow(),
  });
  
  // Keywords Table
  export const keywords = pgTable('keywords', {
    keywordId: serial('keyword_id').primaryKey(),
    keyword: varchar('keyword').notNull().unique(),
  });
  
  // Item_Keywords Table
  export const itemKeywords = pgTable('item_keywords', {
    itemId: integer('item_id').notNull().references(() => items.itemId, { onDelete: 'cascade' }),
    keywordId: integer('keyword_id').notNull().references(() => keywords.keywordId, { onDelete: 'cascade' }),
  }, (table) => ({
    pk: primaryKey(table.itemId, table.keywordId),
  }));
  