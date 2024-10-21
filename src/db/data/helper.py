import requests
import pandas as pd
import json

def format_restaurant_data(row):
    """Format the data according to the API's expected structure."""
    # Load JSON fields safely
    coordinates = json.loads(row["rest_coordinates"]) if pd.notna(row["rest_coordinates"]) else [None, None]
    categories = json.loads(row["rest_categories"]) if pd.notna(row["rest_categories"]) else []
    image_urls = json.loads(row["rest_images"]) if pd.notna(row["rest_images"]) else []
    opening_hours = json.loads(row["rest_hours"]) if pd.notna(row["rest_hours"]) else {}
    specialties = json.loads(row["rest_fav_dish"]) if pd.notna(row["rest_fav_dish"]) else []
    reviews = json.loads(row["rest_reviews"]) if pd.notna(row["rest_reviews"]) else []

    formatted_data = {
        # Fields for the 'items' table
        "itemName": row["rest_name"],
        "category": categories[0] if categories else None,
        "subCategory": categories[1] if len(categories) > 1 else None,
        "description": row.get("rest_description", ""),
        "latitude": coordinates[0],
        "longitude": coordinates[1],
        "priceRange": "Moderate",
        "historicalSignificance": False,  # Default value; adjust if data is available
        "culturalAuthenticity": None,     # Adjust if data is available
        "specialties": specialties,
        "openingHours": opening_hours,
        "activeStatus": True,
        "imageUrls": image_urls,
        "keywords": categories,  # Using categories as keywords

        # Fields for the 'ratings' table
        "rating": {
            "averageRating": float(row["rest_ratings"]) if pd.notna(row["rest_ratings"]) else None,
            "reviewCount": int(row["rest_reviews_count"]) if pd.notna(row["rest_reviews_count"]) else None,
        },

        # 'reviews' data
        "reviews": reviews,

        # 'ambience' and 'vibes' (if available)
        "ambience": [],  # Populate if you have data
        "vibes": [],     # Populate if you have data

        # Additional fields (if required)
        "address": row["rest_address"] if pd.notna(row["rest_address"]) else None,
        "zipcode": int(row["rest_zipcode"]) if pd.notna(row["rest_zipcode"]) else None,
        "website": row["rest_website"] if pd.notna(row["rest_website"]) else None,
        "orderLink": row["rest_menu_link"] if pd.notna(row["rest_menu_link"]) else None,
    }

    return formatted_data

def send_restaurant_data(restaurant_data):
    """Send formatted restaurant data to the API."""
    api_url = "http://localhost:8787/WBkI9gfCUk/items"
    bearer_token = 'srg8oaa74l4Ia3Imal4INo0AOXH76mWl'

    headers = {
        'Authorization': f'Bearer {bearer_token}',
        'Content-Type': 'application/json'
    }

    response = requests.post(api_url, headers=headers, json=restaurant_data)

    if response.status_code == 200:
        print("Data successfully sent:", response.json())
    else:
        print(f"Error {response.status_code}: {response.text}")

if __name__ == "__main__":
    # Load and filter the data
    OUTPUT_FILE = "src/db/data/cafes_data_filtered_cloudflare.csv"
    df = pd.read_csv(OUTPUT_FILE)

    # Remove rows with missing images
    df = df[~(pd.isna(df['rest_images']) | (df['rest_images'] == ''))]

    # Iterate through each row and send data
    for idx, row in df.iterrows():
        formatted_data = format_restaurant_data(row)
        print(f"Sending data for: {formatted_data['itemName']}")
        send_restaurant_data(formatted_data)
