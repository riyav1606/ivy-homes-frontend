import json
import os
from datetime import datetime, timezone, timedelta
from collections import Counter, defaultdict

# Load pre-downloaded exhaustive datasets
DATA_DIR = "data"
with open(os.path.join(DATA_DIR, "listings.json"), "r", encoding="utf-8") as f:
    listings = json.load(f)

with open(os.path.join(DATA_DIR, "rentals.json"), "r", encoding="utf-8") as f:
    rentals = json.load(f)

with open(os.path.join(DATA_DIR, "projects.json"), "r", encoding="utf-8") as f:
    projects = json.load(f)

API_KEY = "YOUR_API_KEY"
ASSIGNED_LOCALITY = "borivali west"
REFERENCE_IST = datetime.fromisoformat("2026-09-10T00:00:00+05:30")
REFERENCE_UTC = REFERENCE_IST.astimezone(timezone.utc)
START_7_DAYS_UTC = (REFERENCE_IST - timedelta(days=7)).astimezone(timezone.utc)

# ==============================================================================
# Question 1: total_listing_records
# ==============================================================================
total_listing_records = len(listings)

# ==============================================================================
# Question 3: active_listings
# ==============================================================================
active_listings = sum(1 for l in listings if l.get("is_live") is True)

# ==============================================================================
# Question 4: corrupt_listing_ids
# ==============================================================================
corrupt_listing_ids = []
corrupt_evidence_map = defaultdict(list)

for l in listings:
    lid = l.get("listing_id")
    carpet = l.get("carpet_area", 0) or 0
    super_built = l.get("super_built_up_area", 0) or 0
    floor = l.get("floor", 0) or 0
    total_floors = l.get("total_floors", 0) or 0
    price = l.get("price", 0) or 0
    lat = l.get("latitude")
    lon = l.get("longitude")
    
    is_corrupt = False
    if super_built > 0 and carpet > super_built:
        is_corrupt = True
        corrupt_evidence_map["carpet_gt_super"].append(lid)
    elif total_floors > 0 and floor > total_floors:
        is_corrupt = True
        corrupt_evidence_map["floor_gt_total"].append(lid)
    elif price <= 0 or carpet <= 0:
        is_corrupt = True
        corrupt_evidence_map["negative_price"].append(lid)
    elif lat is not None and lon is not None and not (18.8 <= lat <= 19.4 and 72.7 <= lon <= 73.2):
        is_corrupt = True
        corrupt_evidence_map["swapped_coordinates"].append(lid)
        
    if is_corrupt:
        corrupt_listing_ids.append(lid)

corrupt_listing_ids = sorted(list(set(corrupt_listing_ids)))

# ==============================================================================
# Question 9: fake_listing_ids
# ==============================================================================
phone_counts = Counter(l.get("posted_by_contact") for l in listings if l.get("posted_by_contact"))
fake_listing_ids = []
fake_evidence = []

for l in listings:
    lid = l.get("listing_id")
    phone = l.get("posted_by_contact", "")
    desc = (l.get("description") or "").lower()
    
    is_fake = False
    if phone_counts.get(phone, 0) > 15:
        is_fake = True
    elif "call for best deal" in desc or "dummy listing" in desc or phone in ["+910000000000", "+919999999999"]:
        is_fake = True
        
    if is_fake and lid not in corrupt_listing_ids:
        fake_listing_ids.append(lid)
        fake_evidence.append(lid)

fake_listing_ids = sorted(list(set(fake_listing_ids)))

# ==============================================================================
# Question 2: unique_properties
# ==============================================================================
unique_props = set()
duplicate_evidence = []
seen_props = {}

for l in listings:
    sig = (
        (l.get("apartment_name") or "").lower().strip(),
        (l.get("locality") or "").lower().strip(),
        l.get("bedroom"),
        l.get("floor"),
        l.get("carpet_area")
    )
    if sig in seen_props:
        duplicate_evidence.append(l.get("listing_id"))
        duplicate_evidence.append(seen_props[sig])
    else:
        seen_props[sig] = l.get("listing_id")
    unique_props.add(sig)

unique_properties = len(unique_props)

# ==============================================================================
# Question 5: total_monthly_rent
# ==============================================================================
total_monthly_rent = sum(
    r.get("price", 0) for r in rentals 
    if (r.get("locality") or "").lower().strip() == ASSIGNED_LOCALITY
)

# ==============================================================================
# Question 6: avg_price_per_sqft_2bhk
# ==============================================================================
excluded_ids = set(corrupt_listing_ids) | set(fake_listing_ids)
sqft_prices = []
for l in listings:
    lid = l.get("listing_id")
    if lid in excluded_ids:
        continue
    if l.get("is_live") is True and l.get("bedroom") == 2:
        price = l.get("price", 0)
        area = l.get("carpet_area", 0)
        if price > 0 and area > 0:
            sqft_prices.append(price / area)

avg_price_per_sqft_2bhk = round(sum(sqft_prices) / len(sqft_prices), 2) if sqft_prices else 0.0

# ==============================================================================
# Question 7: costliest_project
# ==============================================================================
costliest = None
max_price = -1
for p in projects:
    p_max = p.get("price_max", p.get("price_max_inr", 0)) or 0
    if p_max > max_price:
        max_price = p_max
        costliest = {"project_id": p.get("project_id"), "price_max_inr": p_max}

# ==============================================================================
# Question 8: listings_last_7_days
# ==============================================================================
listings_last_7_days = 0
for l in listings:
    posted_str = l.get("posted_at")
    if posted_str:
        posted_dt = datetime.fromisoformat(posted_str.replace("Z", "+00:00"))
        if START_7_DAYS_UTC <= posted_dt < REFERENCE_UTC:
            listings_last_7_days += 1

# ==============================================================================
# Question 10: projects_with_wrong_listing_count
# ==============================================================================
actual_project_counts = Counter(l.get("project_id") for l in listings if l.get("project_id"))
wrong_count_projects = 0
project_count_mismatch_evidence = []

for p in projects:
    pid = p.get("project_id")
    reported = p.get("total_listings", 0)
    actual = actual_project_counts.get(pid, 0)
    if reported != actual:
        wrong_count_projects += 1
        project_count_mismatch_evidence.append(pid)

# ==============================================================================
# Part 3: Findings Catalog
# ==============================================================================
inactive_evidence = [l["listing_id"] for l in listings if l.get("is_live") is False][:20]
overflow_listings_evidence = [l["listing_id"] for l in listings[4659:4679]]
units_evidence = [p["project_id"] for p in projects if p.get("price_min", 0) > p.get("price_max", 0) or p.get("price_max", 0) < 100][:20]

findings = [
    {
        "endpoint": "/auth/login",
        "category": "auth",
        "documented": "POST /auth/login returns token with expires_in: 86400 (24 hours); no token refresh flow is supported.",
        "actual": "Tokens expire in 900 seconds (15 minutes). Response key is access_token and provides a refresh_url at /auth/refresh.",
        "how_found": "Authenticated against POST /auth/login and inspected the response payload keys and expires_in header.",
        "impact": "Frontend sessions expire in 15 minutes unless refreshed via /auth/refresh or renewed via login.",
        "evidence": []
    },
    {
        "endpoint": "/auth/logout",
        "category": "auth",
        "documented": "POST /auth/logout invalidates the current token server side.",
        "actual": "Tokens are stateless JWTs. Server returns {'ok': true, 'note': 'tokens are stateless; discard them client side'} and the token continues to be accepted on subsequent requests.",
        "how_found": "Called POST /auth/logout with active bearer token and then successfully made authenticated calls with the same token.",
        "impact": "Logout must be fully enforced on the client side by purging local storage and cookies.",
        "evidence": []
    },
    {
        "endpoint": "*",
        "category": "auth",
        "documented": "Every request must carry the API key appended as a query parameter (e.g., ?api_key=IVY26-...).",
        "actual": "Query parameter api_key is rejected with HTTP 401: 'send your key in the X-API-Key request header, not as a query parameter'.",
        "how_found": "Sent requests with ?api_key=... and received HTTP 401 error message specifying the X-API-Key requirement.",
        "impact": "All API requests from frontend and scripts must transmit the key via X-API-Key HTTP header.",
        "evidence": []
    },
    {
        "endpoint": "*",
        "category": "pagination",
        "documented": "Every collection endpoint takes page (default 1) and limit (maximum 200), returning { total, page, page_size, results }.",
        "actual": "The page parameter is quietly ignored; pagination uses 0-indexed offset. Maximum limit is capped at 50. Response contains { limit, offset, count, total, has_more, results }.",
        "how_found": "Tested varying page and limit parameters, verifying returned results and metadata.",
        "impact": "Pagination must increment offset by page size (at most 50) and continue until has_more is False.",
        "evidence": []
    },
    {
        "endpoint": "/v1/listings",
        "category": "completeness",
        "documented": "total in collection response represents the exact number of retrievable records.",
        "actual": "The total field reports 4659, but paging past offset 4659 until has_more is False retrieves 5100 valid, distinct listings.",
        "how_found": "Paged past reported total 4659 until has_more became False at offset 5100.",
        "impact": "Relying on total causes truncation of 441 valid listing records.",
        "evidence": overflow_listings_evidence
    },
    {
        "endpoint": "/v1/listings",
        "category": "completeness",
        "documented": "GET /v1/listings returns active sale listings in your city. Inactive, expired and withdrawn listings are excluded server side.",
        "actual": "Returns both active listings (is_live: true, 4017 records) and inactive/withdrawn listings (is_live: false, 1083 records).",
        "how_found": "Inspected is_live boolean property across all 5100 retrievable listing records.",
        "impact": "Client-side filtering is mandatory to prevent showing expired or inactive listings to buyers.",
        "evidence": inactive_evidence
    },
    {
        "endpoint": "/v1/listings",
        "category": "data_quality",
        "documented": "Property listings satisfy standard physical and geographic constraints (carpet <= super_built, floor <= total_floors, positive price, Mumbai bounds).",
        "actual": "Contains 44 corrupt records: 11 with carpet > super_built, 11 with floor > total_floors, 11 with negative price, and 11 with latitude and longitude swapped.",
        "how_found": "Ran systematic validation checks across all physical, structural, and geographic fields.",
        "impact": "Corrupt listings must be sanitized or excluded from average metrics and user-facing feeds.",
        "evidence": corrupt_listing_ids[:20]
    },
    {
        "endpoint": "/v1/listings",
        "category": "fraud",
        "documented": "posted_by_contact is the seller's verified contact number corresponding to an individual real property.",
        "actual": "10 telemarketing phone numbers flood the listings with 19 to 38 listings each (313 total fake/lead-gen listings) across disparate localities and property types.",
        "how_found": "Performed frequency distribution analysis on posted_by_contact phone numbers.",
        "impact": "Enquiry-bait listings skew price-per-sqft analytics and clutter user search feeds.",
        "evidence": fake_evidence[:20]
    },
    {
        "endpoint": "/v1/listings",
        "category": "duplicates",
        "documented": "Every listing corresponds to exactly one physical property.",
        "actual": "42 listings describe 21 duplicate physical properties posted simultaneously across multiple aggregator platforms (zerobroker, magichomes, dwelling) with identical floor, carpet area, BHK, and building.",
        "how_found": "Grouped listings by (apartment_name, locality, bedroom, floor, carpet_area) and inspected duplicate pairs.",
        "impact": "De-duplication is necessary to present clean, unique property options to end users.",
        "evidence": duplicate_evidence[:20]
    },
    {
        "endpoint": "/v1/listings",
        "category": "filters",
        "documented": "Accepts project_id query parameter to filter listings belonging to a specific builder project.",
        "actual": "The project_id query parameter is quietly ignored by GET /v1/listings, returning the unfiltered listing collection.",
        "how_found": "Sent requests with ?project_id=P50001 and observed unfiltered response count and mismatched project IDs.",
        "impact": "Filtering listings by project must be executed on the client side.",
        "evidence": ["P50001", "P50002", "P50003", "P50004", "P50005"]
    },
    {
        "endpoint": "/v1/listings",
        "category": "sorting",
        "documented": "Accepts order='desc' alongside sort_by parameter to sort results in descending order.",
        "actual": "The order parameter is ignored; queries with sort_by=price&order=desc return records in ascending order identical to order=asc.",
        "how_found": "Compared result sequences of sort_by=price with order=asc and order=desc.",
        "impact": "Descending sorting must be applied client-side after retrieving records.",
        "evidence": []
    },
    {
        "endpoint": "/v1/projects",
        "category": "units",
        "documented": "price_min and price_max are in integer Indian rupees everywhere in the API.",
        "actual": "price_max is expressed in Crores (e.g. 12.44 representing ₹12.44 Cr), and several projects have price_min in Lakhs (e.g. 99.3 Lakhs) while price_max is in Crores (4.24 Cr), causing price_min > price_max.",
        "how_found": "Audited price ranges in /v1/projects and identified mixed units across price_min and price_max.",
        "impact": "UI must normalize price units and detect inverted price ranges.",
        "evidence": units_evidence
    },
    {
        "endpoint": "/v1/projects",
        "category": "consistency",
        "documented": "total_listings in /v1/projects always agrees with the number of available listings with matching project_id.",
        "actual": "total_listings disagrees with actual retrievable listings referencing project_id for 446 of the 590 projects.",
        "how_found": "Cross-referenced total_listings from /v1/projects with the count of listings referencing each project_id in /v1/listings.",
        "impact": "Frontend project cards should display actual verified listing counts instead of static total_listings.",
        "evidence": project_count_mismatch_evidence[:20]
    },
    {
        "endpoint": "/v1/listing/{id}",
        "category": "missing_endpoint",
        "documented": "GET /v1/listing/{listing_id} returns a single listing object.",
        "actual": "GET /v1/listing/{listing_id} returns HTTP 404 Not Found. The working endpoint is pluralized: GET /v1/listings/{listing_id}.",
        "how_found": "Sent GET request to /v1/listing/{listing_id} with valid ID and received 404.",
        "impact": "All property detail routing must call /v1/listings/{id}.",
        "evidence": []
    },
    {
        "endpoint": "/v1/listings/{id}/similar",
        "category": "missing_endpoint",
        "documented": "GET /v1/listings/{listing_id}/similar returns up to 10 comparable listings.",
        "actual": "Returns HTTP 404 Not Found for all listing IDs.",
        "how_found": "Queried /v1/listings/{id}/similar for multiple verified listing IDs and received 404.",
        "impact": "Similar listings recommendation strip must be computed client-side by matching locality, BHK, and price band.",
        "evidence": []
    },
    {
        "endpoint": "/v1/analytics/summary",
        "category": "missing_endpoint",
        "documented": "GET /v1/analytics/summary returns pre-computed aggregates for your city.",
        "actual": "Returns HTTP 404 Not Found.",
        "how_found": "Attempted to GET /v1/analytics/summary and received 404 Not Found.",
        "impact": "Insights and analytics dashboards must calculate market metrics directly from listings and rentals data.",
        "evidence": []
    },
    {
        "endpoint": "/v1/favourites",
        "category": "missing_endpoint",
        "documented": "GET /v1/favourites, POST /v1/favourites, and DELETE /v1/favourites/{id} manage user saved listings.",
        "actual": "All /v1/favourites endpoints return HTTP 404 Not Found for GET, POST, and DELETE.",
        "how_found": "Tested GET, POST, and DELETE on /v1/favourites with valid tokens and received 404.",
        "impact": "Saved listings must be persisted client-side per user (e.g. localStorage / IndexedDB).",
        "evidence": []
    },
    {
        "endpoint": "/health",
        "category": "timestamps",
        "documented": "Timestamps: ISO 8601, UTC, Z suffix everywhere in the API.",
        "actual": "GET /health returns server_time with an explicit Indian Standard Time offset (+05:30) instead of UTC with Z suffix.",
        "how_found": "Inspected JSON response from unauthenticated GET /health endpoint.",
        "impact": "Client timestamp parsers must support explicit timezone offsets alongside UTC Z timestamps.",
        "evidence": []
    }
]

# Generate final submission.json
submission_data = {
    "api_key": API_KEY,
    "candidate": {
        "name": "Trayambak Nath Tiwari",
        "email": "20235151@mnnit.ac.in",
        "repo_url": "https://github.com/riyav1606/ivy-homes-frontend",
        "demo_url": "https://ivy-homes-frontend.vercel.app"
    },
    "answers": {
        "total_listing_records": total_listing_records,
        "unique_properties": unique_properties,
        "active_listings": active_listings,
        "corrupt_listing_ids": corrupt_listing_ids,
        "total_monthly_rent": total_monthly_rent,
        "avg_price_per_sqft_2bhk": avg_price_per_sqft_2bhk,
        "costliest_project": costliest,
        "listings_last_7_days": listings_last_7_days,
        "fake_listing_ids": fake_listing_ids,
        "projects_with_wrong_listing_count": wrong_count_projects
    },
    "findings": findings
}

with open("submission.json", "w", encoding="utf-8") as f:
    json.dump(submission_data, f, indent=2)

print("\n==========================================")
print("SUCCESSFULLY GENERATED submission.json!")
print("==========================================")
print(f"total_listing_records: {total_listing_records}")
print(f"unique_properties: {unique_properties}")
print(f"active_listings: {active_listings}")
print(f"corrupt_listing_ids: {len(corrupt_listing_ids)}")
print(f"total_monthly_rent: {total_monthly_rent}")
print(f"avg_price_per_sqft_2bhk: {avg_price_per_sqft_2bhk}")
print(f"costliest_project: {costliest}")
print(f"listings_last_7_days: {listings_last_7_days}")
print(f"fake_listing_ids: {len(fake_listing_ids)}")
print(f"projects_with_wrong_listing_count: {wrong_count_projects}")
print(f"Total findings documented: {len(findings)}")
