/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { SkillCategory, Certification, ProfileMode } from '../types';
import { 
  Award, 
  Cpu, 
  Database, 
  Cloud, 
  Layers, 
  CheckCircle2, 
  ArrowUpRight, 
  Zap, 
  Server, 
  ShieldCheck, 
  Infinity 
} from 'lucide-react';

interface SkillsProps {
  categories: SkillCategory[];
  certifications: Certification[];
  currentMode: ProfileMode;
  isDark: boolean;
}

type DomainType = 'AI / GenAI' | 'Data Engineering' | 'Cloud' | 'Backend' | 'Developer Tools';

// Brand SVGs for verified credentials
const MicrosoftLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h11v11H0z" fill="#F25022"/>
    <path d="M12 0h11v11H12z" fill="#7FBA00"/>
    <path d="M0 12h11v11H0z" fill="#00A4EF"/>
    <path d="M12 12h11v11H12z" fill="#FFB900"/>
  </svg>
);

const GoogleCloudLogo = ({ className = "w-4.5 h-4.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.04 20.73L3.82 16v-9.5l8.22-4.73 8.22 4.73V16l-8.22 4.73z" fill="#F4B400" opacity="0.15" />
    <path d="M12.04 2.23L3.82 6.97v9.49l8.22 4.75 8.22-4.75V6.97l-8.22-4.74zm0 2.87l5.72 3.3v6.61l-5.72 3.3-5.72-3.3V8.4l5.72-3.3z" fill="#4285F4" />
    <path d="M12.04 5.1L6.32 8.4v6.61l5.72 3.3V5.1z" fill="#34A853" />
    <path d="M12.04 11.7l5.72-3.3v6.61l-5.72 3.3v-6.61z" fill="#EA4335" />
  </svg>
);

const AWSLogo = ({ className = "w-4.5 h-4.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.2 20.9c-4.9 0-8.9-3-8.9-6.7 0-2.3 1.6-4.3 4.1-5.4.3-.1.6.1.6.4v.1c0 .2-.1.4-.4.5C5.5 10.7 4.3 12.3 4.3 14.2c0 3 3.5 5.5 7.9 5.5.9 0 1.8-.1 2.6-.4.3-.1.6.1.7.3.1.2 0 .5-.2.6-.9.4-2 .7-3.1.7zm5.5-3.6c-.3 0-.6-.2-.7-.4l-2.4-3.8c-.1-.2-.1-.4 0-.6s.3-.3.5-.3h4.7c.3 0 .5.1.6.3s.1.4 0 .6l-2.4 3.8c-.1.2-.2.4-.3.4zm.5-8.5v3.1c0 .4-.3.7-.7.7h-3.1c-.4 0-.7-.3-.7-.7V8.8c0-.4.3-.7.7-.7H17.5c.4 0 .7.3.7.7z" fill="#FF9900"/>
  </svg>
);

const CourseraLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fill="#0056B3"/>
    <path d="M14.5 15.5a3.5 3.5 0 0 1-3.5-3.5 3.5 3.5 0 0 1 3.5-3.5h1v-2h-1a5.5 5.5 0 0 0-5.5 5.5 5.5 5.5 0 0 0 5.5 5.5h1v-2h-1z" fill="#FFFFFF"/>
  </svg>
);

const getIssuerTheme = (issuer: string, isDark: boolean) => {
  const norm = issuer.toLowerCase();
  
  if (norm.includes('google') || norm.includes('gcp') || norm.includes('cloud')) {
    return {
      glow: 'hover:shadow-[0_0_35px_-5px_rgba(66,133,244,0.22)]',
      borderHover: 'group-hover:border-[#4285F4]/40',
      badgeBg: isDark ? 'bg-[#4285F4]/10 text-[#90CAF9]' : 'bg-[#4285F4]/5 text-[#1565C0]',
      badgeBorder: 'border-[#4285F4]/20',
      logoBadge: <GoogleCloudLogo className="w-3.5 h-3.5" />,
      logoBtn: <GoogleCloudLogo className="w-4 h-4" />,
      btnHoverBg: 'hover:bg-[#4285F4]',
      accentColor: '#4285F4',
      bgGlow: 'from-[#4285F4]/8 to-transparent'
    };
  }
  
  if (norm.includes('microsoft') || norm.includes('azure')) {
    return {
      glow: 'hover:shadow-[0_0_35px_-5px_rgba(127,186,0,0.22)]',
      borderHover: 'group-hover:border-[#7FBA00]/40',
      badgeBg: isDark ? 'bg-[#7FBA00]/10 text-[#C5E1A5]' : 'bg-[#7FBA00]/5 text-[#33691E]',
      badgeBorder: 'border-[#7FBA00]/20',
      logoBadge: <MicrosoftLogo className="w-3.5 h-3.5" />,
      logoBtn: <MicrosoftLogo className="w-4 h-4" />,
      btnHoverBg: 'hover:bg-[#7FBA00]',
      accentColor: '#7FBA00',
      bgGlow: 'from-[#7FBA00]/8 to-transparent'
    };
  }
  
  if (norm.includes('amazon') || norm.includes('aws') || norm.includes('services')) {
    return {
      glow: 'hover:shadow-[0_0_35px_-5px_rgba(255,153,0,0.22)]',
      borderHover: 'group-hover:border-[#FF9900]/40',
      badgeBg: isDark ? 'bg-[#FF9900]/10 text-[#FFCC80]' : 'bg-[#FF9900]/5 text-[#E65100]',
      badgeBorder: 'border-[#FF9900]/20',
      logoBadge: <AWSLogo className="w-3.5 h-3.5" />,
      logoBtn: <AWSLogo className="w-4 h-4" />,
      btnHoverBg: 'hover:bg-[#FF9900]',
      accentColor: '#FF9900',
      bgGlow: 'from-[#FF9900]/8 to-transparent'
    };
  }
  
  if (norm.includes('coursera')) {
    return {
      glow: 'hover:shadow-[0_0_35px_-5px_rgba(0,86,179,0.22)]',
      borderHover: 'group-hover:border-[#0056B3]/40',
      badgeBg: isDark ? 'bg-[#0056B3]/15 text-[#90CAF9]' : 'bg-[#0056B3]/5 text-[#0D47A1]',
      badgeBorder: 'border-[#0056B3]/25',
      logoBadge: <CourseraLogo className="w-3.5 h-3.5" />,
      logoBtn: <CourseraLogo className="w-4 h-4" />,
      btnHoverBg: 'hover:bg-[#0056B3]',
      accentColor: '#0056B3',
      bgGlow: 'from-[#0056B3]/8 to-transparent'
    };
  }
  
  return {
    glow: 'hover:shadow-[0_0_35px_-5px_rgba(0,122,255,0.22)]',
    borderHover: 'group-hover:border-[#007AFF]/40',
    badgeBg: isDark ? 'bg-[#007AFF]/10 text-[#90CAF9]' : 'bg-[#007AFF]/5 text-[#007AFF]',
    badgeBorder: 'border-[#007AFF]/20',
    logoBadge: <Award className="w-3.5 h-3.5 text-[#007AFF]" />,
    logoBtn: <Award className="w-4 h-4 text-[#007AFF]" />,
    btnHoverBg: 'hover:bg-[#007AFF]',
    accentColor: '#007AFF',
    bgGlow: 'from-[#007AFF]/8 to-transparent'
  };
};

export default function Skills({ categories, certifications, currentMode, isDark }: SkillsProps) {
  // Dynamic Domain Mapping Function
  const getDomainSkills = (domain: DomainType) => {
    const skillsList: { name: string; level: string }[] = [];
    
    categories.forEach(cat => {
      const catTitle = cat.title.toLowerCase();
      
      cat.skills.forEach(skill => {
        const name = skill.name.toLowerCase();
        
        if (domain === 'AI / GenAI') {
          if (
            catTitle.includes('ai') || 
            catTitle.includes('ml') || 
            catTitle.includes('genai') || 
            ['pytorch', 'tensorflow', 'opencv', 'nlp', 'transformers', 'rag', 'agentic ai', 'generative ai', 'machine learning', 'llm'].some(k => name.includes(k))
          ) {
            skillsList.push(skill);
          }
        } else if (domain === 'Data Engineering') {
          if (
            catTitle.includes('data engineering') || 
            ['spark', 'etl', 'databricks', 'pipelines', 'transformation', 'distributed data', 'lakehouse', 'delta'].some(k => name.includes(k))
          ) {
            skillsList.push(skill);
          }
        } else if (domain === 'Cloud') {
          if (
            catTitle.includes('cloud') || 
            catTitle.includes('platforms') || 
            ['azure', 'gcp', 'aws', 'docker', 'kubernetes', 'cloud'].some(k => name.includes(k))
          ) {
            skillsList.push(skill);
          }
        } else if (domain === 'Backend') {
          if (
            catTitle.includes('languages') || 
            ['python', 'fastapi', 'rest api', 'sql', 'c++', 'smtp', 'sheets api'].some(k => name.includes(k))
          ) {
            skillsList.push(skill);
          }
        } else if (domain === 'Developer Tools') {
          if (
            catTitle.includes('dev practices') || 
            catTitle.includes('visualization') || 
            ['git', 'ci/cd', 'agile', 'microservices', 'power bi', 'matplotlib', 'seaborn', 'looker', 'tableau', 'tkinter'].some(k => name.includes(k))
          ) {
            skillsList.push(skill);
          }
        }
      });
    });

    const uniqueSkills = skillsList.filter((value, index, self) =>
      self.findIndex(t => t.name === value.name) === index
    );

    return uniqueSkills;
  };

  // Sort certifications based on priority
  const sortedCerts = [...certifications].sort((a, b) => {
    const aPriority = a.priority[currentMode] ?? 99;
    const bPriority = b.priority[currentMode] ?? 99;
    return aPriority - bPriority;
  });

  // Dynamic Bento structure sizes based on active role toggle
  const getBentoSpan = (domain: DomainType) => {
    if (currentMode === 'data-engineer') {
      if (domain === 'Data Engineering') return 'col-span-1 lg:col-span-8';
      if (domain === 'Cloud') return 'col-span-1 lg:col-span-4';
    } else if (currentMode === 'ai-engineer') {
      if (domain === 'AI / GenAI') return 'col-span-1 lg:col-span-8';
      if (domain === 'Backend') return 'col-span-1 lg:col-span-4';
    } else {
      // General
      if (domain === 'AI / GenAI') return 'col-span-1 lg:col-span-6';
      if (domain === 'Data Engineering') return 'col-span-1 lg:col-span-6';
    }
    return 'col-span-1 lg:col-span-4';
  };

  // Prestige strengths static list mapped to Adarsh's actual competencies
  const prestigeStrengths = [
    {
      title: 'Scalable ETL Pipelines',
      desc: 'Architecting medallion delta lakehouse flows, transforming raw JSON logs to structured BI-ready records.',
      signal: 'Capgemini Production Lead',
      icon: Database
    },
    {
      title: 'Retrieval-Augmented Gen',
      desc: 'Designing stateful hybrid semantic searches, hybrid query merging, and context caching architectures.',
      signal: '98% Citation Accuracy',
      icon: Cpu
    },
    {
      title: 'Cloud Infrastructure',
      desc: 'Orchestrating Azure Synapse workloads, ADF triggers, and GCP serverless machine learning APIs.',
      signal: 'Certified Developer Assoc.',
      icon: Cloud
    },
    {
      title: 'Event-Driven APIs',
      desc: 'Developing low-latency asynchronous FastAPI routes and WebSocket channels for telemetry dashboards.',
      signal: '<45ms response loop',
      icon: Zap
    },
    {
      title: 'CI/CD & Automation',
      desc: 'Building containerized Docker builds and Github Action runners for automatic code compilation.',
      signal: 'Agile Standard Compliant',
      icon: Infinity
    },
    {
      title: 'Computer Vision ML',
      desc: 'Deploying optimized gesture translation pipelines and model checkpoints to constraint targets.',
      signal: 'OpenCV & PyTorch Expert',
      icon: ShieldCheck
    }
  ];

  // Engineering Philosophy principles
  const principles = [
    {
      title: 'Scalability First',
      desc: 'System bottlenecks are resolved at the ingestion layer. Design pipelines that scale horizontally without expanding computational spend.'
    },
    {
      title: 'Automation Mindset',
      desc: 'If a workflow runs more than twice, it deserves a scheduled automation trigger. Continuous integration saves developer hours.'
    },
    {
      title: 'Cloud Native Thinking',
      desc: 'Avoid heavy server instances. Deploy lightweight, containerized microservices that activate on demand and utilize cached nodes.'
    },
    {
      title: 'Production Readiness',
      desc: 'Code is not complete without structured telemetry logging, robust error boundaries, and validated type constraints.'
    }
  ];

  const domains: { type: DomainType; label: string; icon: any }[] = [
    { type: 'AI / GenAI', label: 'AI & Generative Systems', icon: Cpu },
    { type: 'Data Engineering', label: 'Data Lakehouse & Pipelines', icon: Database },
    { type: 'Cloud', label: 'Cloud & Platforms', icon: Cloud },
    { type: 'Backend', label: 'Backend & Language Engines', icon: Server },
    { type: 'Developer Tools', label: 'Visualization & Tooling', icon: Layers }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.08 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <div className="min-h-screen py-28 px-6 md:px-12 max-w-7xl mx-auto w-full select-none">
      
      {/* 1. HERO INTRO */}
      <div className="mb-20 text-left max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[10px] font-bold tracking-[0.2em] font-sans uppercase w-fit mb-6 ${
            isDark 
              ? 'bg-[#007AFF15] border-[#007AFF30] text-[#007AFF]' 
              : 'bg-[#007AFF10] border-[#007AFF20] text-[#007AFF]'
          }`}
        >
          <Zap className="w-3.5 h-3.5 animate-pulse" />
          <span>{currentMode.replace('-', ' ').toUpperCase()} STACK CONFIG</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-6xl font-sans font-semibold tracking-tight leading-none mb-6"
        >
          Engineering Intelligence<br />
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
            isDark 
              ? 'from-white via-white/80 to-white/40' 
              : 'from-neutral-950 via-neutral-900 to-neutral-500'
          } italic font-serif font-medium`}>Across Data, AI &amp; Cloud</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={`text-base md:text-lg font-light max-w-2xl leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
          Building scalable intelligent systems using modern data engineering, GenAI pipelines, cloud architecture and automation ecosystems.
        </motion.p>
      </div>

      {/* 2. TECHNOLOGY ECOSYSTEM BENTO */}
      <div className="mb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold tracking-tight font-sans">Technology Ecosystem</h2>
          <span className={`text-[10px] font-mono tracking-widest uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Asymmetric Bento View
          </span>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {domains.map(domain => {
            const domainSkills = getDomainSkills(domain.type);
            const spanClass = getBentoSpan(domain.type);
            const Icon = domain.icon;

            return (
              <motion.div
                key={domain.type}
                layout
                variants={itemVariants}
                className={`p-6 md:p-8 rounded-[40px] border transition-all duration-500 hover:shadow-2xl flex flex-col justify-between group relative overflow-hidden ${spanClass} ${
                  isDark 
                    ? 'bg-gradient-to-b from-[#141416]/80 to-[#09090b]/90 border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] hover:border-[#007AFF]/30' 
                    : 'bg-white hover:bg-slate-100/50 border-neutral-200/60 hover:border-[#007AFF]/15 shadow-sm'
                }`}
              >
                {/* Soft Ambient glow on card hover */}
                <div className="absolute -right-20 -bottom-20 w-60 h-60 rounded-full filter blur-[80px] opacity-0 group-hover:opacity-100 bg-[#007AFF]/15 pointer-events-none transition-opacity duration-500" />

                <div>
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        isDark ? 'bg-white/5 text-white/80' : 'bg-slate-100 text-neutral-800'
                      } group-hover:bg-[#007AFF] group-hover:text-white transition-colors duration-300`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-semibold tracking-wider font-sans uppercase">
                        {domain.label}
                      </h3>
                    </div>
                    <span className={`text-[9px] font-mono tracking-widest ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {domainSkills.length} Units
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {domainSkills.map(skill => (
                      <motion.span
                        key={skill.name}
                        whileHover={{ y: -2, scale: 1.03 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide border cursor-default select-none ${
                          isDark 
                            ? 'bg-white/[0.04] border-white/[0.06] text-white/80 hover:bg-white/[0.08] hover:border-white/15 hover:text-white' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 hover:text-neutral-900'
                        }`}
                      >
                        {skill.name}
                      </motion.span>
                    ))}
                  </div>
                </div>

                <div className={`text-[10px] font-mono leading-none tracking-wide pt-4 border-t flex items-center justify-between ${
                  isDark ? 'border-white/[0.06] text-slate-300' : 'border-neutral-100 text-slate-600'
                }`}>
                  <span>System Reliability</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Verified
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* 3. PRESTIGE WALL */}
      <div className="mb-24">
        <div className="mb-12 text-left">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-[1px] bg-[#007AFF]" />
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-[#007AFF]' : 'text-[#007AFF]'}`}>
              PRESTIGE CORE
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-sans font-semibold tracking-tight">
            Core Engineering Strengths
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prestigeStrengths.map(strength => {
            const IconComponent = strength.icon;
            return (
              <div
                key={strength.title}
                className={`p-8 rounded-[32px] border transition-all duration-350 hover:-translate-y-1 ${
                  isDark 
                    ? 'bg-gradient-to-b from-[#141416]/80 to-[#09090b]/90 border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] hover:border-white/20' 
                    : 'bg-white hover:bg-slate-50/50 border-neutral-200/60 hover:border-[#007AFF]/15 shadow-sm hover:shadow-md'
                } flex flex-col justify-between group`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-[#007AFF]">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold tracking-tight font-sans">
                      {strength.title}
                    </h3>
                  </div>
                  <p className={`text-xs font-light leading-relaxed mb-6 ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    {strength.desc}
                  </p>
                </div>

                <div className={`pt-4 border-t border-solid flex items-center justify-between ${
                  isDark ? 'border-white/[0.06]' : 'border-neutral-100'
                }`}>
                  <span className={`text-[9px] uppercase font-mono tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Trust Signal
                  </span>
                  <span className="text-[10px] font-mono font-semibold tracking-wider text-[#007AFF] uppercase">
                    {strength.signal}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. CERTIFICATIONS LUXURY SECTION */}
      <div className="mb-24">
        <div className="mb-12 text-left">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-[#007AFF]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#007AFF]">
              ACCREDITATIONS
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-sans font-semibold tracking-tight">
            Executive Credentials &amp; Certifications
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedCerts.map((cert) => {
            const theme = getIssuerTheme(cert.issuer, isDark);
            return (
              <div
                key={cert.id}
                className={`p-8 rounded-[32px] border transition-all duration-500 relative group overflow-hidden flex flex-col justify-between h-full ${
                  isDark 
                    ? `bg-gradient-to-b from-[#141416]/90 to-[#09090b]/95 border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] ${theme.borderHover} ${theme.glow}` 
                    : 'bg-white border-neutral-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-[#007AFF]/15'
                }`}
              >
                {/* Ambient background glow inside card */}
                <div className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${theme.bgGlow} rounded-bl-full filter blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none`} />

                <div className="flex flex-col justify-between h-full flex-grow relative z-10">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-6">
                      {/* Issuer Badge Capsule */}
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-mono tracking-widest uppercase w-fit leading-none ${
                        isDark 
                          ? `${theme.badgeBg} ${theme.badgeBorder} border` 
                          : `${theme.badgeBg} ${theme.badgeBorder} border`
                      }`}>
                        {theme.logoBadge}
                        <span className="font-semibold tracking-[0.12em]">{cert.issuer}</span>
                      </div>

                      {/* Verified Badge */}
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-mono font-bold tracking-wider text-emerald-400 uppercase">VERIFIED</span>
                      </div>
                    </div>

                    <h3 className={`text-base md:text-lg font-bold font-display tracking-wide mb-6 leading-snug transition-colors duration-300 min-h-[3.5rem] flex items-center ${
                      isDark ? 'text-white' : 'text-neutral-900'
                    }`}>
                      {cert.title}
                    </h3>
                  </div>

                  <div>
                    <div className={`border-t border-solid my-4 ${isDark ? 'border-white/[0.06]' : 'border-neutral-100'}`} />

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-[8px] font-mono tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>ISSUED</span>
                        <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{cert.date}</span>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 max-w-[60%]">
                        <span className={`text-[8px] font-mono tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>CREDENTIAL CODE</span>
                        <span className={`text-[10px] font-mono truncate max-w-full ${isDark ? 'text-slate-300' : 'text-slate-600'}`} title={cert.code || 'Secure Verification Record'}>
                          {cert.code ? cert.code.substring(0, 14).toUpperCase() + '...' : 'SECURE_RECORD'}
                        </span>
                      </div>
                    </div>

                    {/* Dynamic verify credentials redirect trigger */}
                    <a
                      href={cert.credentialUrl || 'https://www.credly.com/users/adarsh-singh.01e5c8c2/badges'}
                      target="_blank"
                      rel="noreferrer"
                      className={`mt-6 w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-300 border ${
                        isDark 
                          ? 'bg-white/5 border-white/10 text-white hover:bg-white hover:text-neutral-950 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-[0.98]' 
                          : 'bg-neutral-950 border-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.98]'
                      }`}
                    >
                      {theme.logoBtn}
                      <span>Verify Credential</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. ENGINEERING PHILOSOPHY */}
      <div className="mb-24 border-t border-white/5 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-4 flex flex-col justify-start">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#007AFF] block mb-3">
              METHODOLOGY
            </span>
            <h2 className="text-3xl md:text-4xl font-sans font-semibold tracking-tight mb-4">
              How I Build Systems
            </h2>
            <p className={`text-sm font-light leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              A systematic engineering paradigm structured around scalability metrics, cloud infrastructure, and operational reliability.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {principles.map((p, idx) => (
              <div key={p.title} className="text-left">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xl font-mono font-medium ${isDark ? 'text-white/20' : 'text-neutral-300'}`}>
                    0{idx + 1}
                  </span>
                  <h3 className="text-base font-semibold tracking-tight font-sans">
                    {p.title}
                  </h3>
                </div>
                <p className={`text-xs font-light leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* 6. TRUST SECTION */}
      <div className="border-t border-white/5 pt-16 text-center select-none">
        <span className={`text-[10px] uppercase font-mono tracking-[0.3em] font-bold block mb-6 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Recruiter Core Focus Competency Wall
        </span>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-50 hover:opacity-100 transition-opacity duration-500">
          {['Cloud Architectures', 'Generative AI Systems', 'Medallion ETL', 'Low Latency APIs', 'Agile Automation', 'Production Infrastructure'].map((item, idx) => (
            <div key={item} className="flex items-center gap-2">
              {idx > 0 && <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-350'}`} />}
              <span className={`text-xs font-semibold tracking-wider ${isDark ? 'text-white/80' : 'text-neutral-800'}`}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
