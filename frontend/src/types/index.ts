export type ProfileMode = 'general' | 'data-engineer' | 'ai-engineer';

export interface RoleDefinition {
  id: ProfileMode;
  label: string;
  icon: string;
}

export interface HeroConfig {
  badge: string;
  titleName: string;
  headline: string;
  subtext: string;
  trustRow: string[];
}

export interface Metric {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  metrics: Metric[];
  githubUrl: string;
  demoUrl?: string;
  status: 'Deployed' | 'Beta' | 'In Progress';
  featured: boolean;
  priority: {
    general: number;
    'data-engineer': number;
    'ai-engineer'?: number;
  };
}

export interface Skill {
  name: string;
  level: string; // 'Expert' | 'Advanced' | 'Intermediate'
}

export interface SkillCategory {
  title: string;
  skills: Skill[];
  priority: {
    general: number;
    'data-engineer': number;
    'ai-engineer'?: number;
  };
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  code?: string;
  date: string;
  credentialUrl?: string;
  badgeUrl?: string;
  featured: boolean;
  priority: {
    general: number;
    'data-engineer': number;
    'ai-engineer'?: number;
  };
}

export interface JourneyMilestone {
  id: string;
  era: string; // e.g. "Foundation", "Transformation", etc.
  title: string;
  subtitle: string;
  description: string;
  period: string;
  emphasis: Record<string, boolean>;
}

export interface BlogNote {
  id: string;
  title: string;
  excerpt: string;
  readTime: string;
  category: string;
  date: string;
  url: string;
  priority: {
    general: number;
    'data-engineer': number;
    'ai-engineer'?: number;
  };
}

export interface ProfileData {
  hero: HeroConfig;
  projects: Project[];
  skills: SkillCategory[];
  certifications: Certification[];
  journey: JourneyMilestone[];
  blogs: BlogNote[];
  philosophy: string;
}
