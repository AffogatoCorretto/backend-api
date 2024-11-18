import { Hono } from 'hono';
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, generateText } from 'ai';
import { authMiddleware } from './middleware';
import { z } from "zod";
import databaseAPI from './db/data';
import specialsAPI from './db/search/search';
import { schema } from './db/search/aiSchema';
import neighborhoodZipcodes from './constants/zipcodes';
import { getRankedItems } from './db/search';

const app = new Hono();

app.use('*', authMiddleware);

app.get('/', (c) => {
  return c.json({ success: 'Affogato service running!' }, 200);
})

app.post('/search', async (c) => {
  const body = await c.req.json();
  if (!body.query) {
    return c.json({ error: 'Missing parameter' }, 400);
  }
  const query = body.query;
  var model;

  if(body.model == "gemini"){
    const gemini = createGoogleGenerativeAI({
      apiKey: c.env.GEMINI_API_KEY,
    });
    model = gemini.chat("gemini-1.5-flash-001",{structuredOutputs: true,});
  }
  else{
    // OpenAI
    const openai = createOpenAI({
      apiKey: c.env.OPENAI_API_KEY,
    });
    model = openai.chat("gpt-4o-mini-2024-07-18", {structuredOutputs: true,});
  }

  const result = await generateObject({
    model: model,
    schemaName: 'restaurant_search_analysis',
    schemaDescription: 'Analyze user queries related to finding restaurants and return a structured response.',
    schema: schema,
    prompt: `Analyze the user's query: ${query} to generate specific categories, keywords, curated categories, title, and neighborhoods based on the intent of finding a cafe, bakery, or similar venue, only give most relevant max 3`,
  });

  const data = result.object;

  console.log(data)

  const combinedZipcodes = data.neighbourhoods.reduce((accumulator, neighborhood) => {
    const zipcodes = neighborhoodZipcodes[neighborhood]?.zipcodes || [];
    zipcodes.forEach(zip => {
      if (!accumulator.includes(zip)) {
        accumulator.push(zip);
      }
    });
    return accumulator;
  }, []);

  const userInput = {
    categoryArray: data.categoryArray || ["Cafe"],
    keywords: data.keywords || ["Coffee Shop"],
    zipcodes: combinedZipcodes || [10018, 10004, 10005],
    isOpenFilter: body.isOpenFilter ?? false,
    ambienceArray: body.ambienceArray || [],
    vibesArray: body.vibesArray || [],
    priceRangeArray: body.priceRangeArray || [],
  };

  const rankedSpecials = await getRankedItems(c.env.DATABASE_URL, userInput);
  
  return  c.json({result: rankedSpecials, status_code: 200});
})

app.route("/WBkI9gfCUk", databaseAPI);
app.route("/",specialsAPI);

export default app;
