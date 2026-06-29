import json
import os

PROFILE_JSON = os.path.join(os.path.dirname(__file__), '..', 'data', 'profile.json')

def main():
    if not os.path.exists(PROFILE_JSON):
        print(f"Error: Profile database not found at {PROFILE_JSON}")
        return

    with open(PROFILE_JSON, 'r', encoding='utf-8') as f:
        profiles = json.load(f)

    new_cert = {
        "id": "associate-data-practitioner-google-cloud",
        "title": "Associate Data Practitioner Certification",
        "issuer": "Google Cloud",
        "code": "9a4b5db3b2ec4d17a5e2d6731098616d",
        "date": "Mar 2026",
        "credentialUrl": "https://www.credly.com/badges/9a4b5db3b2ec4d17a5e2d6731098616d",
        "badgeUrl": None,
        "featured": True,
        "priority": {
            "general": 1,
            "data-engineer": 1,
            "ai-engineer": 2,
            "ml-engineer": 2
        }
    }

    added_count = 0
    for mode in profiles:
        cert_list = profiles[mode].get('certifications', [])
        # Check if already exists
        if not any(c.get('id') == new_cert['id'] for c in cert_list):
            cert_list.insert(0, new_cert)
            profiles[mode]['certifications'] = cert_list
            added_count += 1

    with open(PROFILE_JSON, 'w', encoding='utf-8') as f:
        json.dump(profiles, f, indent=2, ensure_ascii=False)

    print(f"Successfully added certification to {added_count} profile modes!")

if __name__ == '__main__':
    main()
