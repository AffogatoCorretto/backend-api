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
    schemaName: 'experience_discovery_analysis',
    schemaDescription: 'Analyze user queries related to discovering unique NYC experiences (such as hidden restaurants, famous hiking trails, local events, and non-touristy hidden gems) and return a structured response.',
    schema: schema,
    prompt: `Analyze the user's query: ${query} to generate specific categories, keywords, curated categories, title, and neighborhoods. The focus is on discovering unique and possibly hidden experiences in NYC—this may include lesser-known restaurants, famous hiking trails, local events, and non-touristy hidden gems. If sufficient details cannot be extracted, return empty arrays or strings as appropriate. Provide only the most relevant items (up to three) for each category.`
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
    categoryArray: data.categoryArray || ['dinning_&_culinary','arts_&_culture'],
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
