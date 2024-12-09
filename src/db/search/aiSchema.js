import { jsonSchema } from 'ai';

export const schema = jsonSchema({
    type: "object",
    properties: {
      categoryArray: {
        type: "array",
        items: {
          type: "string",
          enum: [
            'sightseeing_&_landmark',
            'arts_&_culture',
            'entertainment_&_nightlife',
            'dinning_&_culinary',
            'shopping',
            'outdoor_&_natural'
          ]
        },
        description: "Array of up to three main categories that best represent the place."
      },
      curatedCategoryArray: {
        type: "array",
        items: {
          type: "string",
        },
        description: "General categories describing the place (e.g., architecture, history, family-friendly, nightlife).",
      },
      keywords: {
        type: "array",
        items: { type: "string" },
        description: "Analyze the user's query and generate a diverse list of related keywords capturing activities, tags, themes, and preferences. Focus on unique NYC experiences, local culture, hidden gems, and non-touristy attractions. If no keywords can be extracted, return an empty array.",
      },
      listTitle: {
        type: "string",
        description: "Create a unique, witty, and concise min two-word or max three-word title based on the user's cafe preferences, such as ambience, vibes, amenities, or cuisine type. The title must be strictly limited to three words and should be quirky, playful, and engaging, without making any personal assumptions like romance or intimacy. Do not include neighborhood names. Ensure that each generated title is distinct, creative, and avoids repetition or predictable patterns. Examples don't stick to it Brunch o'Clock for brunch spots, Power Up Here for places with outlets, Sizzle and Sip for BBQ restaurants, Taco 'Bout Tasty for taco spots, Brew and Chew for gastropubs, Fry-Day Feast for fried food joints, Boba Bliss Buzz for bubble tea stores, Slice It Good for pizza places.. if the user's query is unrelated to cafe give a sarcastic title min two-word or max three-word title of if the user's query is 'Spicy indian food' title - Sippin' Chai [all these are example DONOT stick to the same words or title show your creativity]",
      },
      neighbourhoods: {
        type: "array",
        items: { 
          type: "string",
          enum: ["Bath Beach", "Battery Park City", "Bay Ridge", "Bedford-Stuyvesant", "Bensonhurst", "Bergen Beach", "Boerum Hill", "Borough Park", "Brighton Beach", "Brooklyn Heights", "Brownsville", "Bushwick", "Canarsie", "Carroll Gardens", "Central Park", "Chelsea", "Chinatown", "Civic Center", "Clinton Hill", "Cobble Hill", "Columbia St", "Coney Island", "Crown Heights", "Cypress Hills", "DUMBO", "Downtown Brooklyn", "Dyker Heights", "East Flatbush", "East Harlem", "East New York", "East Village", "Ellis Island", "Financial District", "Flatbush", "Flatiron District", "Flatlands", "Floyd Bennett Field", "Fort Greene", "Fort Hamilton", "Gerritsen Beach", "Governors Island", "Gowanus", "Gramercy", "Gravesend", "Green-Wood Cemetery", "Greenpoint", "Greenwich Village", "Hell's Kitchen", "Inwood", "Jamaica Bay", "Kensington", "Kips Bay", "Liberty Island", "Little Italy", "Lower East Side", "Manhattan Beach", "Marble Hill", "Marine Park", "Midtown", "Midwood", "Mill Basin", "Morningside Heights", "Murray Hill", "Navy Yard", "NoHo", "Nolita", "Park Slope", "Plum Beach", "Prospect Heights", "Prospect Park", "Prospect-Lefferts Gardens", "Randall's Island", "Red Hook", "Roosevelt Island", "Sea Gate", "Sheepshead Bay", "SoHo", "South Slope", "Stuyvesant Town", "Sunset Park", "Theater District", "Tribeca", "Two Bridges", "Upper East Side", "Upper West Side", "Vinegar Hill", "Washington Heights", "West Village", "Windsor Terrace", "East Williamsburg", "Hamilton Heights", "Williamsburg", "Harlem"]
        },
        description: "Array of matching possible neighbourhoods user requested from the query",
      },
    },
    required: ["categoryArray", "curatedCategoryArray", "keywords", "listTitle", "neighbourhoods"],
    additionalProperties: false,
  });