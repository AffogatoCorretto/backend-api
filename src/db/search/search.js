import { Hono } from 'hono';
import { getRankedItems } from '.';

const specialsAPI = new Hono();

specialsAPI.post('/specials', async (c) => {
  try {
    const body = await c.req.json();

    const userInput = {
        categoryArray: body.categoryArray || ['dinning_&_culinary','arts_&_culture'],
        keywords: body.keywords || [],
        zipcodes: body.zipcodes || [10018, 10004, 10005],
        isOpenFilter: body.isOpenFilter ?? false,
        ambienceArray: body.ambienceArray || [],
        vibesArray: body.vibesArray || [],
        priceRangeArray: body.priceRangeArray || [],
    };

    const rankedSpecials = await getRankedItems(c.env.OPENAI_API_KEY, c.env.DATABASE_URL, userInput, JSON.stringify(userInput));
    return c.json({result: rankedSpecials, status_code: 200});

  } catch (error) {
    console.error('Error in restaurant ranking API:', error);
    return c.json({ error: 'Failed to retrieve ranked restaurants' }, 500);
  }
});

export default specialsAPI;