import React from 'react';
import { motion } from 'motion/react';
import { FileText, Briefcase, GraduationCap, Mail, Linkedin, Github, MapPin, Award, Layers } from 'lucide-react';
import { ProfileData } from '../types';
import SEO from '../components/SEO';

interface ResumeProps {
  profileData: ProfileData;
  isDark: boolean;
}

export default function Resume({ profileData, isDark }: ResumeProps) {
  // Categorize journey milestones
  const workExperience = profileData.journey.filter(item => 
    item.era.toLowerCase().includes('experience') || 
    item.era.toLowerCase().includes('work') || 
    item.era.toLowerCase().includes('professional')
  );

  const academicHistory = profileData.journey.filter(item => 
    item.era.toLowerCase().includes('education') || 
    item.era.toLowerCase().includes('academic')
  );

  // Construct Person & ProfilePage JSON-LD Schemas
  const resumeSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": "https://adarshsingh.in/resume/#webpage",
        "url": "https://adarshsingh.in/resume",
        "name": "Adarsh Singh Professional Resume",
        "description": "Curriculum Vitae (CV) of Adarsh Singh, AI & Data Engineer.",
        "mainEntity": {
          "@id": "https://adarshsingh.in/#person"
        }
      },
      {
        "@type": "Person",
        "@id": "https://adarshsingh.in/#person",
        "name": "Adarsh Singh",
        "jobTitle": "AI & Data Engineer",
        "url": "https://adarshsingh.in",
        "sameAs": [
          "https://github.com/Adarsh-Singh07",
          "https://www.linkedin.com/in/adarsh-singh07"
        ],
        "knowsAbout": [
          "Generative AI",
          "Large Language Models",
          "RAG Pipelines",
          "Data Engineering",
          "Cloud Systems",
          "Distributed Computing"
        ]
      }
    ]
  };

  return (
    <div className={`min-h-screen py-24 px-6 md:px-12 transition-colors duration-200 ${
      isDark ? 'bg-[#121212] text-white' : 'bg-[#FDFBF7] text-neutral-900'
    }`}>
      <SEO 
        title="Professional Resume & CV | Adarsh Singh"
        description="View the professional curriculum vitae (CV) and experience history of Adarsh Singh, AI & Data Engineer. Technical skillsets, work records, and credentials."
        keywords="Adarsh Singh Resume, AI Engineer CV, Data Engineering Career, Cloud Certifications, Work Experience"
        canonicalUrl="https://adarshsingh.in/resume"
        schema={resumeSchema}
      />

      <div className="max-w-4xl mx-auto w-full">
        {/* Editorial Header */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#007AFF] block mb-2">
              Curriculum Vitae
            </span>
            <h1 className="text-4xl md:text-5xl font-sans font-bold tracking-tight mb-2">
              Adarsh Singh
            </h1>
            <p className={`text-base font-mono font-medium ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>
              AI & Data Engineer
            </p>
          </div>

          <a 
            href="/Adarsh_Singh_CV.pdf" 
            download 
            className="px-5 py-3 bg-[#007AFF] hover:bg-[#007AFF]/90 text-white rounded-full flex items-center gap-2.5 text-xs font-semibold shadow-glow cursor-pointer transition-colors"
            aria-label="Download Resume PDF file"
          >
            <FileText className="w-4 h-4" />
            <span>Download PDF CV</span>
          </a>
        </div>

        {/* Contact Info Chips */}
        <div className="flex flex-wrap gap-4 mb-16 text-xs font-mono">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-slate-350' : 'bg-slate-100 border-slate-200'}`}>
            <MapPin className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>India</span>
          </div>
          <a 
            href="https://www.linkedin.com/in/adarsh-singh07" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border hover:border-[#007AFF] transition-colors ${isDark ? 'bg-white/5 border-white/10 text-slate-350' : 'bg-slate-100 border-slate-200'}`}
          >
            <Linkedin className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>LinkedIn</span>
          </a>
          <a 
            href="https://github.com/Adarsh-Singh07" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border hover:border-[#007AFF] transition-colors ${isDark ? 'bg-white/5 border-white/10 text-slate-350' : 'bg-slate-100 border-slate-200'}`}
          >
            <Github className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>GitHub</span>
          </a>
        </div>

        {/* Main Resume Grid */}
        <div className="space-y-16">
          {/* Work Experience */}
          <section>
            <h2 className="text-xl font-bold font-sans tracking-tight mb-8 flex items-center gap-3 border-b border-white/5 pb-3">
              <Briefcase className="w-5 h-5 text-[#007AFF]" />
              <span>Professional Experience</span>
            </h2>
            <div className="space-y-8">
              {workExperience.length > 0 ? (
                workExperience.map((exp, index) => (
                  <div key={index} className="text-left group relative pl-4 border-l-2 border-[#007AFF30] hover:border-[#007AFF] transition-colors duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <h3 className="font-semibold text-base">{exp.title}</h3>
                      <span className="text-xs font-mono opacity-60">{exp.period}</span>
                    </div>
                    <p className={`text-xs font-mono mb-3 ${isDark ? 'text-[#007AFF]' : 'text-indigo-600'}`}>{exp.subtitle}</p>
                    <p className={`text-xs md:text-sm font-light leading-relaxed whitespace-pre-line ${isDark ? 'text-slate-355' : 'text-slate-655'}`}>
                      {exp.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs opacity-60 italic text-left">No experience milestones registered.</p>
              )}
            </div>
          </section>

          {/* Education */}
          <section>
            <h2 className="text-xl font-bold font-sans tracking-tight mb-8 flex items-center gap-3 border-b border-white/5 pb-3">
              <GraduationCap className="w-5 h-5 text-[#007AFF]" />
              <span>Education</span>
            </h2>
            <div className="space-y-8">
              {academicHistory.length > 0 ? (
                academicHistory.map((edu, index) => (
                  <div key={index} className="text-left pl-4 border-l-2 border-[#007AFF20]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <h3 className="font-semibold text-base">{edu.title}</h3>
                      <span className="text-xs font-mono opacity-60">{edu.period}</span>
                    </div>
                    <p className={`text-xs font-mono mb-2 ${isDark ? 'text-slate-400' : 'text-slate-655'}`}>{edu.subtitle}</p>
                    <p className={`text-xs md:text-sm font-light leading-relaxed ${isDark ? 'text-slate-350' : 'text-slate-650'}`}>
                      {edu.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs opacity-60 italic text-left">No academic milestones registered.</p>
              )}
            </div>
          </section>

          {/* Skills Grid */}
          <section>
            <h2 className="text-xl font-bold font-sans tracking-tight mb-8 flex items-center gap-3 border-b border-white/5 pb-3">
              <Layers className="w-5 h-5 text-[#007AFF]" />
              <span>Skills Directory</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profileData.skills.map((category, index) => (
                <div 
                  key={index} 
                  className={`p-5 rounded-2xl border text-left ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100/50 border-slate-200'
                  }`}
                >
                  <h3 className="font-semibold text-sm mb-4 text-[#007AFF] uppercase tracking-wide">
                    {category.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill, sIdx) => (
                      <span 
                        key={sIdx} 
                        className={`text-xs px-2.5 py-1 rounded-lg ${
                          isDark ? 'bg-white/5 text-slate-300' : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Certifications */}
          <section>
            <h2 className="text-xl font-bold font-sans tracking-tight mb-8 flex items-center gap-3 border-b border-white/5 pb-3">
              <Award className="w-5 h-5 text-[#007AFF]" />
              <span>Certifications</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profileData.certifications && profileData.certifications.length > 0 ? (
                profileData.certifications.map((cert, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all duration-300 hover:border-[#007AFF]/50 ${
                      isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100/50 border-slate-200'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-[#007AFF]/10 text-[#007AFF] mt-0.5">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs md:text-sm line-clamp-1">{cert.title}</h3>
                      <p className="text-[10px] font-mono opacity-60 mb-1">{cert.issuer}</p>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold">
                        Verified
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs opacity-60 italic text-left col-span-2">No credentials registered.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
