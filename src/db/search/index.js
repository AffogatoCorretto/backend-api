import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { zipcode_latlongdata } from '../../constants';
import { getAIRankedList } from './aiIndexing';

export async function getRankedItems(openai_k, DATABASE_URL, userInput, userquery) {
  try {
    const sql = neon(DATABASE_URL);
    const db = drizzle(sql);

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
        // return `($${params.length - 2}, $${params.length - 1}, $${params.length})`;
        return `('${z.zipcode}', ${z.lat}, ${z.lon})`;
      })
      .join(', ');

    // Construct filters
    let filters = 'i.active_status = TRUE';

    if (categoryArray.length > 0) {
      params.push(categoryArray);
      filters += ` AND i.category = ANY(ARRAY[${categoryArray.map(c => `'${c}'`).join(", ")}])`;
    }

    if (ambienceArray.length > 0) {
      params.push(ambienceArray);
      filters += ` AND ia.ambience = ANY(ARRAY[${ambienceArray.map(c => `'${c}'`).join(", ")}])`;
    }

    if (vibesArray.length > 0) {
      params.push(vibesArray);
      filters += ` AND iv.vibe = ANY(ARRAY[${vibesArray.map(c => `'${c}'`).join(", ")}])`;
    }

    let keywordsarr = "";
    if (keywords.length > 0) {
      keywordsarr+=`ARRAY[${keywords.map(c => `'%${c}%'`).join(", ")}]`;
    }
    else{
        keywordsarr+=`ARRAY[]::text[]`
    }

    // Construct the SQL query
    const query = `
      WITH keyword_matches AS (
        SELECT 
            i.item_id,
            COUNT(*) AS keyword_match_count
        FROM 
            items AS i,
            UNNEST(i.keywords) AS ik(keyword)
        WHERE 
            ik.keyword ILIKE ANY (${keywordsarr})
        GROUP BY i.item_id
    ),
    target_zipcodes AS (
        SELECT * FROM (
            VALUES ${zipcodeValues}
        ) AS t(zipcode, lat, lon)
    ),
    distances AS (
        SELECT 
            i.item_id, 
            i.latitude, 
            i.longitude,
            MIN(
                (POINT(i.longitude, i.latitude) <-> POINT(t.lon, t.lat))
            ) AS distance 
        FROM 
            items AS i
        JOIN target_zipcodes AS t 
        ON TRUE 
        GROUP BY i.item_id, i.latitude, i.longitude
    ),
    image_aggregation AS (
        SELECT 
            i.item_id,
            ARRAY_AGG(iu.image_url ORDER BY iu.image_url ASC) AS images
        FROM 
            items AS i
        CROSS JOIN UNNEST(i.image_urls) AS iu(image_url)
        GROUP BY i.item_id
    )

    SELECT 
        i.item_id, 
        i.item_name, 
        i.latitude, 
        i.longitude, 
        i.category, 
        i.sub_category, 
        i.price_range, 
        i.item_address,
        i.item_zipcode,
        i.keywords,
        i.specialties, 
        i.description, 
        i.cultural_authenticity, 
        i.historical_significance,
        COALESCE(km.keyword_match_count, 0) AS keyword_match_count,
        COALESCE(r.average_rating, 0) AS rating,
        COALESCE(r.review_count, 0) AS rating_count,
        ARRAY_AGG(DISTINCT iv.vibe) AS vibes,
        ARRAY_AGG(DISTINCT ia.ambience) AS ambience,
        ia2.images,
        d.distance
    FROM 
        items AS i
    LEFT JOIN ratings AS r ON i.item_id = r.item_id
    LEFT JOIN item_keywords AS ik ON i.item_id = ik.item_id
    LEFT JOIN keywords AS k ON ik.keyword_id = k.keyword_id
    LEFT JOIN item_ambience AS ia ON i.item_id = ia.item_id
    LEFT JOIN item_vibes AS iv ON i.item_id = iv.item_id
    LEFT JOIN keyword_matches AS km ON i.item_id = km.item_id
    JOIN distances AS d ON i.item_id = d.item_id
    LEFT JOIN image_aggregation AS ia2 ON i.item_id = ia2.item_id
    WHERE 
        i.active_status = TRUE
        AND ${filters}
    GROUP BY 
        i.item_id, i.item_name, i.latitude, i.longitude, 
        i.category, i.sub_category, i.price_range, i.specialties, 
        i.description, i.cultural_authenticity, i.historical_significance, 
        km.keyword_match_count, r.average_rating, r.review_count, 
        ia2.images, d.distance
    ORDER BY 
        d.distance ASC, 
        km.keyword_match_count DESC, 
        r.average_rating DESC
    LIMIT 50;

    `;

    const results = await sql(query);

    const rankedList = await getAIRankedList(openai_k, userquery, results);

    return rankedList;
  } catch (error) {
    console.error('Error retrieving ranked items:', error);
    throw error;
  }
}
