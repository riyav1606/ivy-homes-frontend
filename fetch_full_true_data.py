import requests
import json
import os
import sys
import time

os.environ["NO_PROXY"] = "*"

BASE_URL = "https://solve.ivy.homes"
API_KEY = "IVY26-99BAF92DE5A1"
PASSWORD = "acb9e1f812"

session = requests.Session()
session.trust_env = False

def login():
    login_resp = session.post(
        f"{BASE_URL}/auth/login",
        headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
        json={"email": "demo1@ivy.homes", "password": PASSWORD}
    )
    token = login_resp.json()["access_token"]
    return {"X-API-Key": API_KEY, "Authorization": f"Bearer {token}"}

headers = login()

def fetch_until_has_more_false(endpoint, name):
    print(f"\n==========================================")
    print(f"Fetching {endpoint} until has_more is False...")
    offset = 0
    limit = 50
    all_records = []
    seen_ids = set()
    initial_total = None
    
    while True:
        try:
            resp = session.get(f"{BASE_URL}{endpoint}", headers=headers, params={"offset": offset, "limit": limit}, timeout=15)
        except Exception as e:
            print(f"Network error at offset {offset}: {e}, retrying...")
            time.sleep(1)
            continue
            
        if resp.status_code == 401:
            print("Refreshing token...")
            globals()["headers"] = login()
            continue
            
        if resp.status_code != 200:
            print(f"Error {resp.status_code} at offset {offset}: {resp.text}")
            break
            
        data = resp.json()
        if initial_total is None:
            initial_total = data.get("total")
            print(f"Initial reported total: {initial_total}")
            
        results = data.get("results", [])
        if not results:
            print(f"No results at offset {offset}. Breaking.")
            break
            
        for item in results:
            iid = item.get("listing_id") or item.get("project_id")
            if iid in seen_ids:
                print(f"WARNING: duplicate ID seen at offset {offset}: {iid}")
            seen_ids.add(iid)
            all_records.append(item)
            
        offset += len(results)
        has_more = data.get("has_more", False)
        
        if len(all_records) % 500 == 0 or not has_more:
            print(f"  Progress: {len(all_records)} fetched (offset {offset}, has_more={has_more})")
            
        if not has_more:
            print(f"Finished {endpoint}: has_more is False at offset {offset}!")
            break
            
    print(f"Reported total was: {initial_total}")
    print(f"Actual retrievable records count: {len(all_records)}")
    print(f"Unique IDs: {len(seen_ids)}")
    
    out_path = os.path.join("data", f"{name}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(all_records, f, indent=2)
    print(f"Saved complete dataset to {out_path}.\n")
    return all_records

projects = fetch_until_has_more_false("/v1/projects", "projects")
rentals = fetch_until_has_more_false("/v1/rentals", "rentals")
listings = fetch_until_has_more_false("/v1/listings", "listings")
