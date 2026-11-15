import requests
import certifi
import json

session = requests.Session()
session.verify = certifi.where()

print("--- 1. JPL HORIZONS API ---")
horizons_url = "https://ssd.jpl.nasa.gov/api/horizons.api"
params = {
    "format": "json",
    "COMMAND": "599",
    "EPHEM_TYPE": "OBSERVER",
    "CENTER": "500@399",
    "START_TIME": "2026-11-14",
    "STOP_TIME": "2026-11-15",
    "STEP_SIZE": "1d",
    "QUANTITIES": "1,9,20"
}
r = session.get(horizons_url, params=params, timeout=15)
print("Horizons Status:", r.status_code)
h_data = r.json()
print("Horizons signature:", h_data.get("signature"))
print("Horizons result snippet:\n", h_data.get("result", "")[:600])

print("\n--- 2. CDS SESAME & SIMBAD TAP ---")
# CDS Sesame name resolver
sesame_url = "https://cds.unistra.fr/cgi-bin/nph-sesame/-oA/SNVA"
for star in ["Vega", "Luhman 16"]:
    r_star = session.get(f"{sesame_url}?{star}", timeout=15)
    print(f"Sesame {star}: Status {r_star.status_code}, snippet: {r_star.text[:200].strip()}")

print("\n--- 3. GAIA ESA TAP ---")
gaia_url = "https://gea.esac.esa.int/tap-server/tap/sync"
query = "SELECT TOP 1 source_id, ra, dec, phot_g_mean_mag, parallax, pmra, pmdec FROM gaiadr3.gaia_source WHERE has_mcmc_gspphot = 'True'"
r_gaia = session.get(gaia_url, params={"REQUEST": "doQuery", "LANG": "ADQL", "FORMAT": "json", "QUERY": query}, timeout=15)
print("Gaia Status:", r_gaia.status_code)
if r_gaia.status_code == 200:
    print("Gaia snippet:", r_gaia.text[:300])

print("\n--- 4. CNEOS SENTRY APIS ---")
r_sentry = session.get("https://ssd-api.jpl.nasa.gov/sentry.api", params={"des": "99942"}, timeout=15)
print("Sentry Apophis Status:", r_sentry.status_code)
print("Sentry Apophis sample:", r_sentry.text[:300])

print("\n--- 5. CNEOS CAD APIS ---")
r_cad = session.get("https://ssd-api.jpl.nasa.gov/cad.api", params={"des": "99942", "limit": "3"}, timeout=15)
print("CAD Apophis Status:", r_cad.status_code)
print("CAD Apophis sample:", r_cad.text[:300])
