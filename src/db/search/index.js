import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { zipcode_latlongdata } from '../constants/constants';
import { sql } from 'drizzle-orm';

export async function getRankedItems(DATABASE_URL, userInput) {
  try {
    const sqlClient = neon(DATABASE_URL);
    const db = drizzle(sqlClient);

    const {
      categoryArray = [],
      keywords = [],
      zipcodes = [],
      isOpenFilter = false,
      ambienceArray = [],
      vibesArray = [],
      priceRangeArray = [],
    } = userInput;

    // Prepare target zip codes with latitude and longitude
    const targetZipcodes = zipcodes
      .filter((zipcode) => zipcode_latlongdata[String(zipcode)])
      .map((zipcode) => ({
        zipcode: String(zipcode),
        lat: zipcode_latlongdata[String(zipcode)].latitude,
        lon: zipcode_latlongdata[String(zipcode)].longitude,
      }));

    const params = [];

    // Prepare CTE for zip codes
    const zipcodeValues = targetZipcodes
      .map((z, idx) => {
        params.push(z.zipcode, z.lat, z.lon);
        return `($${params.length - 2}, $${params.length - 1}, $${params.length})`;
      })
      .join(', ');

    // Construct filters
    let filters = 'i.active_status = TRUE';

    if (categoryArray.length > 0) {
      params.push(categoryArray);
      filters += ` AND i.category = ANY($${params.length})`;
    }

    if (priceRangeArray.length > 0) {
      params.push(priceRangeArray);
      filters += ` AND i.price_range = ANY($${params.length})`;
    }

    if (isOpenFilter) {
      filters += ` AND (
        (i.opening_hours->to_char(current_date, 'FMDay'))->>'closed' != 'true' 
        AND (i.opening_hours->to_char(current_date, 'FMDay')) IS NOT NULL 
        AND current_time BETWEEN 
          (i.opening_hours->to_char(current_date, 'FMDay')->>'open')::time 
          AND (i.opening_hours->to_char(current_date, 'FMDay')->>'close')::time
      )`;
    }

    if (ambienceArray.length > 0) {
      params.push(ambienceArray);
      filters += ` AND ia.ambience = ANY($${params.length})`;
    }

    if (vibesArray.length > 0) {
      params.push(vibesArray);
      filters += ` AND iv.vibe = ANY($${params.length})`;
    }

    if (keywords.length > 0) {
      params.push(keywords);
      filters += ` AND k.keyword = ANY($${params.length})`;
    }

    // Construct the SQL query
    const query = `
      WITH target_zipcodes AS (
        SELECT * FROM (
          VALUES ${zipcodeValues}
        ) AS t(zipcode, lat, lon)
      ),
      distances AS (
        SELECT 
          i.item_id, 
          i.latitude, 
          i.longitude,
          MIN(POINT(i.longitude, i.latitude) <-> POINT(t.lon::float, t.lat::float)) AS distance
        FROM 
          items AS i
        JOIN target_zipcodes AS t ON TRUE
        GROUP BY i.item_id, i.latitude, i.longitude
      )
      SELECT 
        i.item_id,
        i.item_name,
        i.category,
        i.sub_category,
        i.description,
        i.latitude,
        i.longitude,
        i.price_range,
        i.opening_hours,
        i.image_urls,
        COALESCE(r.average_rating, 0) AS average_rating,
        COALESCE(r.review_count, 0) AS review_count,
        d.distance,
        ARRAY_AGG(DISTINCT k.keyword) AS keywords,
        ARRAY_AGG(DISTINCT ia.ambience) AS ambience,
        ARRAY_AGG(DISTINCT iv.vibe) AS vibes
      FROM 
        items AS i
      LEFT JOIN ratings AS r ON i.item_id = r.item_id
      LEFT JOIN item_keywords AS ik ON i.item_id = ik.item_id
      LEFT JOIN keywords AS k ON ik.keyword_id = k.keyword_id
      LEFT JOIN item_ambience AS ia ON i.item_id = ia.item_id
      LEFT JOIN item_vibes AS iv ON i.item_id = iv.item_id
      JOIN distances AS d ON i.item_id = d.item_id
      WHERE ${filters}
      GROUP BY 
        i.item_id, i.item_name, i.category, i.sub_category, i.description, 
        i.latitude, i.longitude, i.price_range, i.opening_hours, i.image_urls,
        r.average_rating, r.review_count, d.distance
      ORDER BY 
        d.distance ASC,
        r.average_rating DESC
      LIMIT 10;
    `;

    const results = await sqlClient.query(query, params);

    return results.rows;
  } catch (error) {
    console.error('Error retrieving ranked items:', error);
    throw error;
  }
}
