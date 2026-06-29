import json
import os

PROFILE_JSON = os.path.join(os.path.dirname(__file__), '..', 'data', 'profile.json')

def main():
    if not os.path.exists(PROFILE_JSON):
        print(f"Error: Profile database not found at {PROFILE_JSON}")
        return

    with open(PROFILE_JSON, 'r', encoding='utf-8') as f:
        profiles = json.load(f)

    # Updates map
    updates = {
        "ai-102-azure-ai-solutions": {
            "credentialUrl": "https://learn.microsoft.com/api/credentials/share/en-us/AdarshSingh2049/79DE2DEF41234156?sharingId=8D4E75A61B7B7717",
            "date": "Mar 2026"
        },
        "az-900-azure-fundamentals": {
            "credentialUrl": "https://learn.microsoft.com/api/credentials/share/en-us/AdarshSingh2049/CF6A9CFE5207BE7E?sharingId=8D4E75A61B7B7717",
            "date": "Feb 2026"
        },
        "ai-900-azure-ai-fundamentals": {
            "credentialUrl": "https://learn.microsoft.com/api/credentials/share/en-us/AdarshSingh2049/7DAAC3F8980CED77?sharingId=8D4E75A61B7B7717",
            "date": "Nov 2025"
        }
    }

    updated_count = 0
    for mode in profiles:
        for cert in profiles[mode].get('certifications', []):
            cert_id = cert.get('id')
            if cert_id in updates:
                cert['credentialUrl'] = updates[cert_id]['credentialUrl']
                cert['date'] = updates[cert_id]['date']
                updated_count += 1

    with open(PROFILE_JSON, 'w', encoding='utf-8') as f:
        json.dump(profiles, f, indent=2, ensure_ascii=False)

    print(f"Successfully updated {updated_count} Microsoft credentials across all profile modes!")

if __name__ == '__main__':
    main()
