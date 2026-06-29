import json
import os

PROFILE_JSON = os.path.join(os.path.dirname(__file__), '..', 'data', 'profile.json')

def main():
    if not os.path.exists(PROFILE_JSON):
        print(f"Error: Profile database not found at {PROFILE_JSON}")
        return

    with open(PROFILE_JSON, 'r', encoding='utf-8') as f:
        profiles = json.load(f)

    # Master list of all certifications from Credly
    certs_data = [
        {
            "id": "aws-certified-ai-practitioner",
            "title": "AWS Certified AI Practitioner",
            "issuer": "Amazon Web Services",
            "code": None,
            "date": "Mar 2026",
            "credentialUrl": "https://www.credly.com/badges/c178772b-f8b4-4744-9f36-29e86e6fee3b",
            "badgeUrl": None,
            "featured": True,
            "priority": {
                "general": 2,
                "data-engineer": 3,
                "ai-engineer": 1,
                "ml-engineer": 2
            }
        },
        {
            "id": "associate-data-practitioner-google-cloud",
            "title": "Associate Data Practitioner Certification",
            "issuer": "Google Cloud",
            "code": "9a4b5db3b2ec4d17a5e2d6731098616d",
            "date": "Mar 2026",
            "credentialUrl": "https://www.credly.com/badges/3dfaa7cd-d9f7-492f-adfe-91907b346c8c",
            "badgeUrl": None,
            "featured": True,
            "priority": {
                "general": 1,
                "data-engineer": 1,
                "ai-engineer": 2,
                "ml-engineer": 2
            }
        },
        {
            "id": "professional-cloud-developer-google-cloud",
            "title": "Professional Cloud Developer Certification",
            "issuer": "Google Cloud",
            "code": "a1c842e7ec1744d6a809d8c042381948",
            "date": "Jan 2026",
            "credentialUrl": "https://www.credly.com/badges/552f04a0-a307-4dfb-ac23-af9301b280e4",
            "badgeUrl": None,
            "featured": True,
            "priority": {
                "general": 2,
                "data-engineer": 1,
                "ai-engineer": 2,
                "ml-engineer": 2
            }
        },
        {
            "id": "generative-ai-leader-google-cloud",
            "title": "Generative AI Leader Certification",
            "issuer": "Google Cloud",
            "code": "6767488012b148009660d4c6c3da0ffe",
            "date": "Dec 2025",
            "credentialUrl": "https://www.credly.com/badges/e2556efe-eb9c-492e-945c-393fefacae26",
            "badgeUrl": None,
            "featured": True,
            "priority": {
                "general": 1,
                "data-engineer": 3,
                "ai-engineer": 1,
                "ml-engineer": 1
            }
        },
        {
            "id": "google-data-analytics-professional-certificate",
            "title": "Google Data Analytics Professional Certificate",
            "issuer": "Coursera",
            "code": None,
            "date": "Dec 2024",
            "credentialUrl": "https://www.credly.com/badges/625312be-058a-4739-9c41-6db9551a1e63",
            "badgeUrl": None,
            "featured": True,
            "priority": {
                "general": 3,
                "data-engineer": 2,
                "ai-engineer": 4,
                "ml-engineer": 4
            }
        },
        {
            "id": "python-for-data-science-and-ai",
            "title": "Python for Data Science and AI",
            "issuer": "Coursera",
            "code": None,
            "date": "Sep 2024",
            "credentialUrl": "https://www.credly.com/badges/9c024776-05ed-42b3-922c-c3416a51a934",
            "badgeUrl": None,
            "featured": False,
            "priority": {
                "general": 4,
                "data-engineer": 4,
                "ai-engineer": 3,
                "ml-engineer": 3
            }
        },
        {
            "id": "ai-102-azure-ai-solutions",
            "title": "Microsoft Certified: Azure AI Engineer Associate (AI-102)",
            "issuer": "Microsoft",
            "code": None,
            "date": "Expires Mar 2027",
            "credentialUrl": "https://www.credly.com/users/adarsh-singh.01e5c8c2/badges",
            "badgeUrl": None,
            "featured": True,
            "priority": {
                "general": 1,
                "data-engineer": 2,
                "ai-engineer": 1,
                "ml-engineer": 1
            }
        },
        {
            "id": "az-900-azure-fundamentals",
            "title": "Microsoft Certified: Azure Fundamentals (AZ-900)",
            "issuer": "Microsoft",
            "code": None,
            "date": "Feb 2026",
            "credentialUrl": "https://www.credly.com/users/adarsh-singh.01e5c8c2/badges",
            "badgeUrl": None,
            "featured": False,
            "priority": {
                "general": 4,
                "data-engineer": 4,
                "ai-engineer": 4,
                "ml-engineer": 4
            }
        },
        {
            "id": "ai-900-azure-ai-fundamentals",
            "title": "Microsoft Certified: Azure AI Fundamentals (AI-900)",
            "issuer": "Microsoft",
            "code": None,
            "date": "Nov 2025",
            "credentialUrl": "https://www.credly.com/users/adarsh-singh.01e5c8c2/badges",
            "badgeUrl": None,
            "featured": False,
            "priority": {
                "general": 3,
                "data-engineer": 4,
                "ai-engineer": 3,
                "ml-engineer": 3
            }
        }
    ]

    for mode in profiles:
        profiles[mode]['certifications'] = certs_data

    with open(PROFILE_JSON, 'w', encoding='utf-8') as f:
        json.dump(profiles, f, indent=2, ensure_ascii=False)

    print("Successfully updated database with 9 verified/unverified certifications!")

if __name__ == '__main__':
    main()
