import { jsonSchema } from 'ai';

export const schema = jsonSchema({
    type: "object",
    properties: {
      categoryArray: {
        type: "array",
        items: {
          type: "string",
        },
        description: "Array of matching possible cafe categories [I am only focusing on cafe for now, so only and strictly return cafes, bakery, pastries (basicially stuff you get in a cafes like sandwich, croissant etc) etc related categories for now] mostly keywords from the query. Even the QUERY is related to restaurants ignore restaurant related categories",
      },
      curatedCategoryArray: {
        type: "array",
        items: {
          type: "string",
          enum: ['afternoon_tea', 'big_groups', 'birthdays', 'breakfast', 'brunch', 'byob', 'casual_dinners', 'cheap_eats', 'classic_establishment', 'coffee_and_a_light_bite', 'corporate_cards', 'dancing', 'date_nights', 'day_drinking', 'dining_solo', 'dinner_with_the_parents', 'dogs', 'drinking_great_beer', 'drinking_great_cocktails', 'drinking_great_mocktails', 'drinking_great_wine', 'drinks_and_a_light_bite', 'eating_at_the_bar', 'feeling_hot', 'fine_dining', 'first_dates', 'getting_work_done', 'gluten_free_options', 'halal', 'happy_hours', 'impressing_out_of_towners', 'keeping_it_kind_of_healthy', 'kids', 'kosher', 'late_nights', 'live_music', 'lunch', 'night_on_the_town', 'pastries', 'people_watching', 'pre_theater', 'private_dining', 'see_and_be_seen', 'serious_takeout_operation', 'sitting_outside', 'special_occasions', 'unique_dining_experiences', 'vegans', 'vegetarians', 'walk_ins', 'wasting_your_time_and_money', 'watching_sports', 'artisanal_coffee', 'hybrid_workspace_cafe', 'deconstructed_desserts', 'artisanal_pastries', 'artisanal_ice_creams', 'decadent_cakes', 'conveyor_belt_food', 'hyperlocal_cuisines', 'al_fresco_dining'],
        },
        description: "Create an array of matching curated categories based on the context of the user's query. Analyze the intent, such as identifying the type of café the user is looking for (e.g., casual lunch spots, dessert cafés)",
      },
      keywords: {
        type: "array",
        items: { type: "string" },
        description: "Analyze the following query and generate a diverse list of related keywords that capture food items, tags, requirements, ambience, and preferences without duplicating information from existing categories. Focus on the intent and specific food items mentioned as well as other related terms and variations.",
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