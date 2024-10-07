import { Hono } from 'hono';
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, generateText } from 'ai';
import { authMiddleware } from './middleware';
import { z } from "zod";

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
    schema: z.object({
      includesPeopleCount: z.boolean(),       
      includesNeighborhood: z.boolean(),       
      missingInfo: z.string(),     
      peopleCount: z.number(),     
      neighborhoods: z.array(z.string()),  
    }),
    prompt: `Analyze the following user restaurant search query: "${query}". Provide a structured response with whether the query includes a number of people and a neighborhood. If either is missing, return the missing information.`,
  });
  
  return c.json({result: result.object, status_code: 200});
})

export default app;
