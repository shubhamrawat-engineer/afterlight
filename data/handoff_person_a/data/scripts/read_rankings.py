import csv

with open("data/raw/candidate_pair_ranking.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    rows = list(reader)

for i in range(5):
    r = rows[i]
    print(f"\nRank {r['rank']}: status={r['overall_status']}, det={r['detector']}")
    print(f"  Earlier: {r['earlier_obs_id']} ({r['earlier_date_utc']})")
    print(f"  Later:   {r['later_obs_id']} ({r['later_date_utc']})")
    print(f"  Earlier URL: {r['earlier_access_url']}")
    print(f"  Later URL:   {r['later_access_url']}")
