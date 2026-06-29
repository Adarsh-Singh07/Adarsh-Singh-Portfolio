import os
import json
from typing import List, Optional
from pydantic import BaseModel, Field

# Load environment variables manually from root .env if it exists
env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            if '=' in line:
                k, v = line.strip().split('=', 1)
                os.environ[k] = v

from google import genai
from google.genai import types

# Pydantic schema for structured output to match TS interfaces
class HeroConfig(BaseModel):
    badge: str
    titleName: str
    headline: str
    subtext: str
    trustRow: List[str]

class Metric(BaseModel):
    label: str
    value: str

class Priority(BaseModel):
    general: int
    data_engineer: int = Field(alias="data-engineer")
    ai_engineer: int = Field(alias="ai-engineer")
    ml_engineer: int = Field(alias="ml-engineer")

    class Config:
        populate_by_name = True

class Project(BaseModel):
    id: str
    title: str
    description: str
    technologies: List[str]
    metrics: List[Metric]
    githubUrl: str
    demoUrl: Optional[str] = None
    status: str # 'Deployed' | 'Beta' | 'In Progress'
    featured: bool
    priority: Priority

class Skill(BaseModel):
    name: str
    level: str # 'Expert' | 'Advanced' | 'Intermediate'

class SkillCategory(BaseModel):
    title: str
    skills: List[Skill]
    priority: Priority

class Certification(BaseModel):
    id: str
    title: str
    issuer: str
    code: Optional[str] = None
    date: str
    credentialUrl: Optional[str] = None
    badgeUrl: Optional[str] = None
    featured: bool
    priority: Priority

class Emphasis(BaseModel):
    general: bool
    data_engineer: bool = Field(alias="data-engineer")
    ai_engineer: bool = Field(alias="ai-engineer")
    ml_engineer: bool = Field(alias="ml-engineer")

    class Config:
        populate_by_name = True

class JourneyMilestone(BaseModel):
    id: str
    era: str
    title: str
    subtitle: str
    description: str
    period: str
    emphasis: Emphasis

class BlogNote(BaseModel):
    id: str
    title: str
    excerpt: str
    readTime: str
    category: str
    date: str
    url: str
    priority: Priority

class ProfileData(BaseModel):
    hero: HeroConfig
    projects: List[Project]
    skills: List[SkillCategory]
    certifications: List[Certification]
    journey: List[JourneyMilestone]
    blogs: List[BlogNote]
    philosophy: str

def parse_profile_for_role(client: genai.Client, cv_text: str, role_id: str, role_desc: str) -> dict:
    print(f"Generating profile content optimized for role: '{role_id}'...")
    
    prompt = f"""
You are an expert resume parser and data engineer.
Analyze the following CV and convert it into a structured portfolio configuration JSON.
This profile configuration must be optimized specifically for the role: '{role_id}' ({role_desc}).

Ensure:
1. Formulate a catchy, luxury-level headline (headline), badge (badge) and trustRow (trustRow) relevant specifically to a '{role_id}'.
2. For project IDs, use kebab-case (e.g. 'agentic-rag-platform').
3. Project status must be: 'Deployed', 'Beta', or 'In Progress'.
4. Certifications should map correctly.
5. Create journey milestones from the education and work history.
6. Ensure priority mapping is set for ALL 4 roles (general, data-engineer, ai-engineer, ml-engineer) in the priority dictionary of each project, skill category, and cert. Priority is an ascending rank (1 is highest priority). Assign rank 1 to the item most relevant to that specific role.
7. If the CV lacks blogs, generate 3-4 realistic editorial blog titles and excerpts based on their actual projects and experience, pointing the URL to '#' (e.g. 'Building Scalable ETL Pipelines with Spark & Azure' with date, readTime).
8. Make the philosophy statement reflect their passion and actual expertise for this specific role.

Here is the raw CV content:
{cv_text}
"""

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ProfileData,
            temperature=0.1
        )
    )
    
    data = json.loads(response.text)
    # Validate structure using Pydantic
    profile_obj = ProfileData(**data)
    return profile_obj.model_dump(by_alias=True)

def main():
    print("Reading CV text...")
    cv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'cv.txt')
    if not os.path.exists(cv_path):
        print(f"Error: CV file not found at {cv_path}")
        return
        
    with open(cv_path, 'r', encoding='utf-8') as f:
        cv_text = f.read()

    print("Initializing Gemini API Client...")
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY env var is missing.")
        return
        
    client = genai.Client(api_key=api_key)

    roles = {
        "general": "A balanced profile combining AI, ML, GenAI, and Data Engineering.",
        "data-engineer": "Optimized specifically for Data Engineering, highlighting Databricks, Apache Spark, ADF, Delta Lake, medallion ETL pipelines, and data warehousing.",
        "ai-engineer": "Optimized for AI Engineering, highlighting RAG, LLMs, Agentic AI, NLP, Vertex AI, and model deployment.",
        "ml-engineer": "Optimized for Machine Learning Engineering, highlighting PyTorch, TensorFlow, ML translation models, model optimization (low-latency, OpenCV), and training."
    }

    output_data = {}
    for role_id, role_desc in roles.items():
        try:
            profile_dump = parse_profile_for_role(client, cv_text, role_id, role_desc)
            output_data[role_id] = profile_dump
        except Exception as e:
            print(f"Error parsing role {role_id}: {e}")
            return

    # Save the consolidated roles data to profile.json
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'profile.json')
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
        
    print(f"\nSuccessfully created consolidated structured profiles at {out_path}!")

if __name__ == '__main__':
    main()
