import { jsonSchema } from 'ai';
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, generateText } from 'ai';

export const getAIRankedList = async (openai_k, query, results) => {

    const openai = createOpenAI({
        apiKey: openai_k,
      });
    let model = openai.chat("gpt-4o-mini-2024-07-18", {structuredOutputs: true,});


    const itemsArray = results.map(item => {
        return JSON.stringify({
          item_name: item.item_name,
          category: item.category,
          sub_category: item.sub_category,
          item_address: item.item_address,
          keywords: item.keywords,
          description: item.description
        });
      });

    const itemNames = results.map(item => item.item_name);
    

    const schema = jsonSchema({
        type: "object",
        properties: {
            rankedArray: {
                type: "array",
                items: {
                    type: "string",
                },
                description: "Array of 20 item names ranked in order of relevance to the user's query."
            }
        },
        required: ["rankedArray"],
        additionalProperties: false,
      });
    
    const prompt = `Rank the following items based on their relevance to the user's query: \"${query}\". The items are provided as JSON strings. Consider the item's keywords, category, sub_category, and description. Provide a ranked array of item names in descending order of relevance. If no match is relevant, return an empty array.
    
    Items: ${itemsArray.join("\n")}`;
    
    const result = await generateObject({
        model,
        schemaName: 'ranked_items_list',
        schemaDescription: 'Rank ALL list of items based on their relevance to the given query. Return a ranked array of all item names',
        schema,
        prompt
      });
    
    const rankedArray = result.object.rankedArray;

    const rankedList = rankedArray.map(name =>
        results.find(item => item.item_name === name)
      ).filter(Boolean); 
    
    if (rankedList.length < 10) {
        const remainingItems = results.filter(item => !rankedArray.includes(item.item_name));
        const itemsToAdd = remainingItems.slice(0, 10 - rankedList.length);
        rankedList.push(...itemsToAdd);
    }
    
    return rankedList;
}