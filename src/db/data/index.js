import { Hono } from 'hono';
import {
    items,
    events,
    itemAmbience,
    itemVibes,
    ratings,
    keywords,
    itemKeywords,
    reviews,
} from '../../schema';
import { eq, and } from "drizzle-orm";
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const databaseAPI = new Hono();

databaseAPI.post('/items', async (c) => {
  const body = await c.req.json();

  if (!body.itemName) {
    return c.json({ error: 'Missing itemName' }, 400);
  }

  try {
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    // Check if the item already exists
    const existingItem = await db
      .select()
      .from(items)
      .where(
        and(
          eq(items.itemName, body.itemName),
          eq(items.latitude, body.latitude),
          eq(items.longitude, body.longitude)
        )
      );

    if (existingItem.length > 0) {
      return c.json(
        { error: 'Item already exists', itemId: existingItem[0].itemId },
        409
      );
    }

    // Insert into 'items' table
    const [newItem] = await db
      .insert(items)
      .values({
        itemName: body.itemName,
        category: body.category,
        subCategory: body.subCategory,
        description: body.description,
        latitude: body.latitude,
        longitude: body.longitude,
        priceRange: body.priceRange,
        historicalSignificance: body.historicalSignificance || false,
        culturalAuthenticity: body.culturalAuthenticity,
        specialties: body.specialties || [],
        openingHours: body.openingHours || {},
        activeStatus: body.activeStatus ?? true,
        imageUrls: body.imageUrls || [],
        keywords: body.keywords || [],
      })
      .returning({ itemId: items.itemId });

    const itemId = newItem.itemId;

    // Insert into 'events' table if event data is provided
    if (body.event) {
      await db.insert(events).values({
        itemId: itemId,
        eventType: body.event.eventType,
        eventDate: body.event.eventDate,
        entryFee: body.event.entryFee,
      });
    }

    // Insert into 'itemAmbience' table
    if (body.ambience && Array.isArray(body.ambience) && body.ambience.length > 0) {
      const ambienceData = body.ambience.map((ambienceValue) => ({
        itemId: itemId,
        ambience: ambienceValue,
      }));
      await db.insert(itemAmbience).values(ambienceData);
    }

    // Insert into 'itemVibes' table
    if (body.vibes && Array.isArray(body.vibes) && body.vibes.length > 0) {
      const vibesData = body.vibes.map((vibeValue) => ({
        itemId: itemId,
        vibe: vibeValue,
      }));
      await db.insert(itemVibes).values(vibesData);
    }

    // Handle 'keywords' and insert into 'keywords' and 'itemKeywords' tables
    if (body.keywords && Array.isArray(body.keywords) && body.keywords.length > 0) {
      const keywordIds = [];
      for (const keyword of body.keywords) {
        // Check if the keyword already exists
        let [existingKeyword] = await db
          .select()
          .from(keywords)
          .where(eq(keywords.keyword, keyword));

        let keywordId;

        if (!existingKeyword) {
          // Insert the new keyword
          [existingKeyword] = await db
            .insert(keywords)
            .values({ keyword })
            .returning({ keywordId: keywords.keywordId });
          keywordId = existingKeyword.keywordId;
        } else {
          keywordId = existingKeyword.keywordId;
        }

        // Insert into the 'itemKeywords' table
        await db.insert(itemKeywords).values({
          itemId: itemId,
          keywordId: keywordId,
        });
      }
    }

    // Insert into 'ratings' table if rating data is provided
    if (body.rating) {
      await db.insert(ratings).values({
        itemId: itemId,
        averageRating: body.rating.averageRating,
        reviewCount: body.rating.reviewCount,
      });
    }

    // Insert 'reviews' data if provided
    if (body.reviews && Array.isArray(body.reviews) && body.reviews.length > 0) {
      const reviewsData = body.reviews.map((review) => ({
        itemId: itemId,
        userId: review.userId || null, // Assuming userId might be null
        reviewText: review.reviewText,
        reviewRating: review.reviewRating,
        reviewDate: review.reviewDate || new Date(),
      }));
      await db.insert(reviews).values(reviewsData);
    }

    // Return success response
    return c.json({ success: true, itemId });
  } catch (error) {
    console.error('Error inserting item and related data:', error);
    return c.json(
      { error: 'Failed to insert item and related data', details: error.message },
      500
    );
  }
});


  
export default databaseAPI;