import pandas as pd
import folium

OUTPUT_DIR = "src/analytics/"

df = pd.read_csv(OUTPUT_DIR+"data.csv")

map_center = [df["latitude"].mean(), df["longitude"].mean()]
m = folium.Map(location=map_center, zoom_start=15)

def generate_popup(row):
    html_content = f"""
    <b>{row['item_name']}</b><br>
    <b>Category:</b> {row['category']}<br>
    <b>Sub-category:</b> {row['sub_category']}<br>
    <b>Price Range:</b> {row['price_range']}<br>
    <b>Rating:</b> {row['rating']} ({row['rating_count']} reviews)<br>
    <b>Specialties:</b> {row['specialties']}<br>
    <b>Description:</b> {row['description']}<br>
    <b>Cultural Authenticity:</b> {row['cultural_authenticity']}<br>
    <b>Historical Significance:</b> {row['historical_significance']}<br>
    <b>Vibes:</b> {row['vibes']}<br>
    <b>Ambience:</b> {row['ambience']}<br>
    <b>Distance:</b> {row['distance']} miles<br>
    """
    images = row["images"].strip("{}").split(",")
    for image_url in images:
        html_content += f'<img src="{image_url.strip()}" width="200"><br>'
    return html_content

for _, row in df.iterrows():
    popup_content = generate_popup(row)
    folium.Marker(
        location=[row["latitude"], row["longitude"]],
        popup=folium.Popup(popup_content, max_width=300),
        tooltip=row["item_name"],
    ).add_to(m)

m.save(OUTPUT_DIR+"restaurant_map.html")
print("Map saved as 'restaurant_map.html'. Open it in your browser to view.")
