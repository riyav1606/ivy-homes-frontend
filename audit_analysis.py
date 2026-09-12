import json
from datetime import datetime, timezone, timedelta
from collections import Counter

with open("data/listings.json", "r", encoding="utf-8") as f:
    listings = json.load(f)

with open("data/rentals.json", "r", encoding="utf-8") as f:
    rentals = json.load(f)

with open("data/projects.json", "r", encoding="utf-8") as f:
    projects = json.load(f)

print(f"Loaded: {len(listings)} listings, {len(rentals)} rentals, {len(projects)} projects.")

# ==========================================
# 1. total_listing_records
# ==========================================
total_listing_records = len(listings)
print(f"\nQ1. total_listing_records: {total_listing_records}")

# ==========================================
# 3. active_listings
# ==========================================
active_listings = sum(1 for l in listings if l.get("is_live") is True)
inactive_listings = sum(1 for l in listings if l.get("is_live") is False)
print(f"Q3. active_listings: {active_listings} (inactive: {inactive_listings})")

# ==========================================
# 4. corrupt_listing_ids
# ==========================================
print("\n--- Auditing Corrupt Listings ---")
corrupt_reasons = {}

for l in listings:
    lid = l["listing_id"]
    reasons = []
    
    carpet = l.get("carpet_area", 0) or 0
    super_built = l.get("super_built_up_area", 0) or 0
    floor = l.get("floor", 0) or 0
    total_floors = l.get("total_floors", 0) or 0
    price = l.get("price", 0) or 0
    lat = l.get("latitude")
    lon = l.get("longitude")
    bedroom = l.get("bedroom", 0) or 0
    bathroom = l.get("bathroom", 0) or 0
    
    # 1. Carpet area > super built-up area
    if super_built > 0 and carpet > super_built:
        reasons.append(f"carpet ({carpet}) > super_built ({super_built})")
        
    # 2. Floor > total_floors
    if total_floors > 0 and floor > total_floors:
        reasons.append(f"floor ({floor}) > total_floors ({total_floors})")
        
    # 3. Price <= 0 or carpet <= 0
    if price <= 0:
        reasons.append(f"price <= 0 ({price})")
    if carpet <= 0:
        reasons.append(f"carpet <= 0 ({carpet})")
        
    # 4. Out of Mumbai bounding box (Lat: 18.8 - 19.4, Lon: 72.7 - 73.2)
    if lat is not None and lon is not None:
        if not (18.8 <= lat <= 19.4 and 72.7 <= lon <= 73.2):
            reasons.append(f"coordinates outside Mumbai: ({lat}, {lon})")
            
    # 5. Impossible bedroom
    if bedroom < 0:
        reasons.append(f"bedroom < 0 ({bedroom})")
        
    if reasons:
        corrupt_reasons[lid] = reasons

corrupt_listing_ids = sorted(list(corrupt_reasons.keys()))
print(f"Q4. corrupt_listing_ids count: {len(corrupt_listing_ids)}")
print("Sample corrupt records:")
for cid in corrupt_listing_ids[:15]:
    print(f"  {cid}: {corrupt_reasons[cid]}")

# ==========================================
# 9. fake_listing_ids
# ==========================================
print("\n--- Auditing Fake Listings ---")
phone_counts = Counter(l.get("posted_by_contact") for l in listings if l.get("posted_by_contact"))
print("Top phone number frequencies:")
for phone, count in phone_counts.most_common(10):
    print(f"  {phone}: {count} listings")

fake_reasons = {}
for l in listings:
    lid = l["listing_id"]
    phone = l.get("posted_by_contact") or ""
    desc = (l.get("description") or "").lower()
    reasons = []
    
    # Phone frequency > 15
    if phone_counts.get(phone, 0) > 15:
        reasons.append(f"tele-marketing phone frequency: {phone_counts[phone]}")
        
    # Dummy numbers
    if phone in ["+910000000000", "+919999999999", "+911234567890"]:
        reasons.append(f"placeholder phone: {phone}")
        
    # Scam / enquiry bait text
    if any(phrase in desc for phrase in ["call for best deal", "dummy listing", "test listing", "not for sale"]):
        reasons.append(f"bait text in description")
        
    if reasons and lid not in corrupt_reasons:
        fake_reasons[lid] = reasons

fake_listing_ids = sorted(list(fake_reasons.keys()))
print(f"Q9. fake_listing_ids count: {len(fake_listing_ids)}")
print("Sample fake listings:")
for fid in fake_listing_ids[:15]:
    print(f"  {fid}: {fake_reasons[fid]}")

# Check phone numbers of fake listings
fake_phones = Counter(l.get("posted_by_contact") for l in listings if l["listing_id"] in fake_reasons)
print("Fake listings by phone:", fake_phones)

# ==========================================
# 2. unique_properties
# ==========================================
print("\n--- Auditing Unique Properties ---")
# Signature variations
sig_with_latlon = set()
sig_without_latlon = set()
for l in listings:
    # rounding lat/lon to 4 decimal places (~11 meters)
    s1 = (
        (l.get("locality") or "").lower().strip(),
        (l.get("apartment_name") or "").lower().strip(),
        l.get("bedroom"),
        l.get("floor"),
        l.get("carpet_area"),
        round(l.get("latitude", 0) or 0, 4),
        round(l.get("longitude", 0) or 0, 4)
    )
    s2 = (
        (l.get("locality") or "").lower().strip(),
        (l.get("apartment_name") or "").lower().strip(),
        l.get("bedroom"),
        l.get("floor"),
        l.get("carpet_area")
    )
    sig_with_latlon.add(s1)
    sig_without_latlon.add(s2)

print(f"Unique properties (with lat/lon 4 dec): {len(sig_with_latlon)}")
print(f"Unique properties (without lat/lon): {len(sig_without_latlon)}")

unique_properties = len(sig_with_latlon)

# ==========================================
# 5. total_monthly_rent
# ==========================================
print("\n--- Auditing Rentals ---")
localities = Counter((r.get("locality") or "").lower().strip() for r in rentals)
print("Rentals localities top 10:")
for loc, cnt in localities.most_common(10):
    print(f"  {loc}: {cnt}")

assigned_loc = "borivali west"
borivali_rentals = [r for r in rentals if (r.get("locality") or "").lower().strip() == assigned_loc]
print(f"Rentals in '{assigned_loc}': {len(borivali_rentals)}")
total_monthly_rent = sum(r.get("price", 0) for r in borivali_rentals)
print(f"Q5. total_monthly_rent: {total_monthly_rent}")
if borivali_rentals:
    prices = [r.get("price", 0) for r in borivali_rentals]
    print(f"  Min rent: {min(prices)}, Max rent: {max(prices)}, Avg: {sum(prices)/len(prices):.2f}")

# ==========================================
# 6. avg_price_per_sqft_2bhk
# ==========================================
print("\n--- Auditing 2BHK Price / Sqft ---")
excluded_ids = set(corrupt_listing_ids) | set(fake_listing_ids)
sqft_prices = []
for l in listings:
    lid = l["listing_id"]
    if lid in excluded_ids:
        continue
    if l.get("is_live") is True and l.get("bedroom") == 2:
        price = l.get("price", 0)
        carpet = l.get("carpet_area", 0)
        if price > 0 and carpet > 0:
            sqft_prices.append(price / carpet)

avg_price_per_sqft_2bhk = round(sum(sqft_prices) / len(sqft_prices), 2) if sqft_prices else 0.0
print(f"Q6. avg_price_per_sqft_2bhk: {avg_price_per_sqft_2bhk} (over {len(sqft_prices)} listings)")

# ==========================================
# 7. costliest_project
# ==========================================
print("\n--- Auditing Projects ---")
costliest = None
max_price = -1
for p in projects:
    p_max = p.get("price_max_inr", p.get("price_max", 0)) or 0
    if p_max > max_price:
        max_price = p_max
        costliest = {
            "project_id": p.get("project_id"),
            "price_max_inr": p_max
        }

print(f"Q7. costliest_project: {costliest}")
for p in projects:
    if p.get("project_id") == costliest["project_id"]:
        print("  Full details:", p)

# ==========================================
# 8. listings_last_7_days
# ==========================================
print("\n--- Auditing Timestamps for Last 7 Days ---")
# REFERENCE = 2026-09-10T00:00:00+05:30
# Reference in UTC: 2026-09-09T18:30:00Z
# Start 7 days before in UTC: 2026-09-02T18:30:00Z
ref_dt_ist = datetime.fromisoformat("2026-09-10T00:00:00+05:30")
start_7d_ist = ref_dt_ist - timedelta(days=7)

ref_utc = ref_dt_ist.astimezone(timezone.utc)
start_7d_utc = start_7d_ist.astimezone(timezone.utc)

print(f"Reference IST: {ref_dt_ist}, UTC: {ref_utc}")
print(f"Start 7D IST:  {start_7d_ist}, UTC: {start_7d_utc}")

listings_last_7_days = 0
for l in listings:
    p_str = l.get("posted_at")
    if p_str:
        dt = datetime.fromisoformat(p_str.replace("Z", "+00:00"))
        if start_7d_utc <= dt < ref_utc:
            listings_last_7_days += 1

print(f"Q8. listings_last_7_days: {listings_last_7_days}")

# ==========================================
# 10. projects_with_wrong_listing_count
# ==========================================
print("\n--- Auditing Project Listing Counts ---")
actual_project_counts = Counter(l.get("project_id") for l in listings if l.get("project_id"))
actual_live_project_counts = Counter(l.get("project_id") for l in listings if l.get("project_id") and l.get("is_live"))

wrong_all = 0
wrong_live = 0
discrepancies = []

for p in projects:
    pid = p.get("project_id")
    reported = p.get("total_listings", 0)
    actual_all = actual_project_counts.get(pid, 0)
    actual_l = actual_live_project_counts.get(pid, 0)
    if reported != actual_all:
        wrong_all += 1
        discrepancies.append((pid, reported, actual_all, actual_l))
    if reported != actual_l:
        wrong_live += 1

print(f"Q10. projects_with_wrong_listing_count (against all listings with project_id): {wrong_all}")
print(f"     projects_with_wrong_listing_count (against live listings with project_id): {wrong_live}")
print(f"Total projects in database: {len(projects)}")
print(f"Sample project discrepancies (pid, reported, actual_all, actual_live):")
for d in discrepancies[:10]:
    print(f"  {d}")
