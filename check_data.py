import json

with open("data/listings.json", "r", encoding="utf-8") as f:
    listings = json.load(f)

with open("data/rentals.json", "r", encoding="utf-8") as f:
    rentals = json.load(f)

with open("data/projects.json", "r", encoding="utf-8") as f:
    projects = json.load(f)

print("Listings raw count:", len(listings))
listing_ids = [l["listing_id"] for l in listings]
unique_lids = set(listing_ids)
print("Unique listing_ids:", len(unique_lids))

print("\nRentals raw count:", len(rentals))
rental_ids = [r["listing_id"] for r in rentals]
print("Unique rental_ids:", len(set(rental_ids)))

print("\nProjects raw count:", len(projects))
project_ids = [p["project_id"] for p in projects]
print("Unique project_ids:", len(set(project_ids)))

# Check what happened on page 94
print("\nLast 50 listings IDs:")
print(listing_ids[-50:])
