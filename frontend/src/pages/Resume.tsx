/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Briefcase, GraduationCap, Linkedin, Github, MapPin, Award, Layers, ExternalLink, Download } from 'lucide-react';
import { ProfileData } from '../types';
import SEO from '../components/SEO';

interface ResumeProps {
  profileData: ProfileData;
  isDark: boolean;
}

export default function Resume({ profileData }: ResumeProps) {
  // Categorize journey milestones
  const workExperience = (profileData.journey || []).filter(item => 
    item.era.toLowerCase().includes('experience') || 
    item.era.toLowerCase().includes('work') || 
    item.era.toLowerCase().includes('professional')
  );

  const academicHistory = (profileData.journey || []).filter(item => 
    item.era.toLowerCase().includes('education') || 
    item.era.toLowerCase().includes('academic')
  );

  const resumeSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": "https://adarshsingh.in/resume/#webpage",
        "url": "https://adarshsingh.in/resume",
        "name": "Adarsh Singh Professional Resume",
        "description": "Curriculum Vitae (CV) of Adarsh Singh, Enterprise AI Analyst & Cloud Architect.",
        "mainEntity": {
          "@id": "https://adarshsingh.in/#person"
        }
      },
      {
        "@type": "Person",
        "@id": "https://adarshsingh.in/#person",
        "name": "Adarsh Singh",
        "jobTitle": "Enterprise AI Analyst · Cloud & AI Architect",
        "url": "https://adarshsingh.in",
        "sameAs": [
          "https://github.com/Adarsh-Singh07",
          "https://www.linkedin.com/in/adarsh-singh07"
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen py-28 px-6 md:px-12 max-w-4xl mx-auto w-full bg-[var(--background)] text-[var(--foreground)]">
      <SEO 
        title="Professional Resume & CV | Adarsh Singh"
        description="View the professional curriculum vitae (CV) and experience history of Adarsh Singh, Enterprise AI Analyst & Cloud Architect. Technical skillsets, work records, and credentials."
        keywords="Adarsh Singh Resume, AI Engineer CV, Data Engineering Career, Cloud Certifications, Work Experience"
        canonicalUrl="https://adarshsingh.in/resume"
        schema={resumeSchema}
      />

      <div className="w-full">
        {/* Editorial Header */}
        <div
          className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          <div className="text-left">
            <div className="eyebrow" style={{ marginBottom: '1rem' }}>
              Curriculum Vitae
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '3.5rem',
                textTransform: 'uppercase',
                lineHeight: 1,
                color: 'var(--foreground)',
              }}
            >
              Adarsh Singh
            </h1>
            <p style={{ marginTop: '0.5rem', fontSize: '1.0625rem', color: 'var(--accent)', fontWeight: 600 }}>
              Enterprise AI Analyst · Cloud &amp; AI Architect · Full-Stack Builder
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a 
              href="/cv.pdf" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-sm flex items-center gap-2 text-xs font-semibold border transition-all cursor-pointer"
              style={{
                borderColor: 'var(--line-strong)',
                color: 'var(--foreground)',
              }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View PDF</span>
            </a>

            <a 
              href="/cv.pdf" 
              download="Adarsh_Singh_CV.pdf" 
              className="px-5 py-2.5 rounded-sm flex items-center gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors"
              style={{
                background: 'var(--accent)',
                color: 'var(--background)',
              }}
              aria-label="Download Resume PDF file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CV</span>
            </a>
          </div>
        </div>

        {/* Contact Info Chips */}
        <div className="flex flex-wrap gap-3 mb-16 text-xs font-mono">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-sm border"
            style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--muted)' }}
          >
            <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <span>Bengaluru, India</span>
          </div>
          <a 
            href="https://www.linkedin.com/in/adarshsingh45" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-colors"
            style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--muted)' }}
          >
            <Linkedin className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <span>LinkedIn</span>
          </a>
          <a 
            href="https://github.com/Adarsh-Singh07" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-colors"
            style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--muted)' }}
          >
            <Github className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <span>GitHub</span>
          </a>
        </div>

        {/* Main Resume Grid */}
        <div className="space-y-16">
          {/* Work Experience */}
          <section>
            <h2
              className="text-2xl font-bold font-sans tracking-tight mb-8 flex items-center gap-3 pb-3"
              style={{ borderBottom: '1px solid var(--line)' }}
            >
              <Briefcase className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  textTransform: 'uppercase',
                  fontSize: '1.75rem',
                }}
              >
                Professional Experience
              </span>
            </h2>
            <div className="space-y-8">
              {workExperience.length > 0 ? (
                workExperience.map((exp, index) => (
                  <div
                    key={index}
                    className="text-left group relative pl-5 transition-colors duration-300"
                    style={{ borderLeft: '2px solid var(--line-strong)' }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-1">
                      <h3 style={{ fontSize: '1.1875rem', fontWeight: 600, color: 'var(--foreground)' }}>
                        {exp.title}
                      </h3>
                      <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                        {exp.period}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '0.75rem' }}>
                      {exp.subtitle}
                    </p>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--muted)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {exp.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs italic text-left" style={{ color: 'var(--muted)' }}>
                  No experience milestones registered.
                </p>
              )}
            </div>
          </section>

          {/* Education */}
          <section>
            <h2
              className="text-2xl font-bold font-sans tracking-tight mb-8 flex items-center gap-3 pb-3"
              style={{ borderBottom: '1px solid var(--line)' }}
            >
              <GraduationCap className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  textTransform: 'uppercase',
                  fontSize: '1.75rem',
                }}
              >
                Education
              </span>
            </h2>
            <div className="space-y-8">
              {academicHistory.length > 0 ? (
                academicHistory.map((edu, index) => (
                  <div
                    key={index}
                    className="text-left pl-5"
                    style={{ borderLeft: '2px solid var(--line-strong)' }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-1">
                      <h3 style={{ fontSize: '1.1875rem', fontWeight: 600, color: 'var(--foreground)' }}>
                        {edu.title}
                      </h3>
                      <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                        {edu.period}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                      {edu.subtitle}
                    </p>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                      {edu.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs italic text-left" style={{ color: 'var(--muted)' }}>
                  No academic milestones registered.
                </p>
              )}
            </div>
          </section>

          {/* Skills Grid */}
          <section>
            <h2
              className="text-2xl font-bold font-sans tracking-tight mb-8 flex items-center gap-3 pb-3"
              style={{ borderBottom: '1px solid var(--line)' }}
            >
              <Layers className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  textTransform: 'uppercase',
                  fontSize: '1.75rem',
                }}
              >
                Skills Directory
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(profileData.skills || []).map((category, index) => (
                <div 
                  key={index} 
                  className="p-5 rounded-[0.25rem] border text-left"
                  style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
                >
                  <h3
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--accent)',
                      marginBottom: '1rem',
                    }}
                  >
                    {category.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(category.skills || []).map((skill, sIdx) => (
                      <span 
                        key={sIdx} 
                        className="text-xs px-2.5 py-1 rounded-sm border"
                        style={{
                          background: 'var(--surface-2)',
                          borderColor: 'var(--line)',
                          color: 'var(--foreground)',
                        }}
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
            <h2
              className="text-2xl font-bold font-sans tracking-tight mb-8 flex items-center gap-3 pb-3"
              style={{ borderBottom: '1px solid var(--line)' }}
            >
              <Award className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  textTransform: 'uppercase',
                  fontSize: '1.75rem',
                }}
              >
                Certifications
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profileData.certifications && profileData.certifications.length > 0 ? (
                profileData.certifications.map((cert, index) => (
                  <div 
                    key={index} 
                    className="p-4 rounded-[0.25rem] border text-left flex items-start gap-3.5 transition-all duration-300"
                    style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
                  >
                    <div
                      className="p-2 rounded-sm"
                      style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}
                    >
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--foreground)' }}>
                        {cert.title}
                      </h3>
                      <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginTop: '0.25rem' }}>
                        {cert.issuer}
                      </p>
                      <span
                        className="inline-block text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-sm mt-1"
                        style={{ background: 'rgba(255, 59, 29, 0.1)', color: 'var(--accent)' }}
                      >
                        Verified
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs italic text-left col-span-2" style={{ color: 'var(--muted)' }}>
                  No credentials registered.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
