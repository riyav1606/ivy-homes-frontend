import requests
import json
import os
import sys
import time

os.environ["NO_PROXY"] = "*"

BASE_URL = "https://solve.ivy.homes"
API_KEY = "YOUR_API_KEY"
PASSWORD = "xyz"

session = requests.Session()
session.trust_env = False

def login():
    login_resp = session.post(
        f"{BASE_URL}/auth/login",
        headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
        json={"email": "demo1@ivy.homes", "password": PASSWORD}
    )
    if login_resp.status_code != 200:
        print("Login failed:", login_resp.status_code, login_resp.text)
        sys.exit(1)
    token = login_resp.json()["access_token"]
    return {
        "X-API-Key": API_KEY,
        "Authorization": f"Bearer {token}"
    }

headers = login()
os.makedirs("data", exist_ok=True)

def fetch_all(endpoint, name):
    print(f"Fetching {endpoint}...")
    offset = 0
    limit = 50
    all_records = []
    total = None
    
    while True:
        try:
            resp = session.get(f"{BASE_URL}{endpoint}", headers=headers, params={"offset": offset, "limit": limit}, timeout=15)
        except Exception as e:
            print(f"Network error at offset {offset}: {e}, retrying...")
            time.sleep(1)
            continue
            
        if resp.status_code == 401:
            print("Token expired, re-logging in...")
            globals()["headers"] = login()
            continue
            
        if resp.status_code != 200:
            print(f"Error at offset {offset}: {resp.status_code} {resp.text}")
            break
            
        data = resp.json()
        if total is None:
            total = data.get("total", 0)
            print(f"  {endpoint} reported total: {total}")
            
        results = data.get("results", [])
        if not results:
            break
            
        all_records.extend(results)
        offset += len(results)
        
        if len(all_records) % 500 == 0 or len(all_records) >= total or not data.get("has_more", False):
            print(f"  Progress: {len(all_records)} / {total} (offset: {offset})")
            
        if not data.get("has_more", False) or len(all_records) >= total:
            break
            
    out_path = os.path.join("data", f"{name}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(all_records, f, indent=2)
    print(f"Saved {len(all_records)} records to {out_path}.\n")
    return all_records

listings = fetch_all("/v1/listings", "listings")
rentals = fetch_all("/v1/rentals", "rentals")
projects = fetch_all("/v1/projects", "projects")

print("All datasets downloaded successfully!")
