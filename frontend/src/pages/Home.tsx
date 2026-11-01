import React, { useState } from 'react';
import { HeroConfig, HomeCard, ProfileMode, Project, Certification, Coordinates } from '../types';
import SEO from '../components/SEO';
import Preloader from '../components/Preloader';
import CinematicHero from '../sections/CinematicHero';
import Marquee from '../components/Marquee';
import StorySection from '../sections/StorySection';
import VenturesSection from '../sections/VenturesSection';
import ImpactSection from '../sections/ImpactSection';
import CredentialsSection from '../sections/CredentialsSection';
import ContactFooter from '../sections/ContactFooter';
import { MessageSquare, ArrowRight } from 'lucide-react';

interface HomeProps {
  config: HeroConfig;
  homeCards?: HomeCard[];
  projects?: Project[];
  certifications?: Certification[];
  coordinates?: Coordinates;
  currentMode: ProfileMode;
  isDark: boolean;
  onRefreshData?: () => void;
}

export default function Home({
  config,
  projects = [],
  certifications = [],
  coordinates,
  isDark,
}: HomeProps) {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const homeSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://adarshsingh.in/#website',
        url: 'https://adarshsingh.in',
        name: 'Adarsh Singh | Enterprise AI Analyst · Cloud & AI Architect',
        description:
          'Portfolio of Adarsh Singh — architecting autonomous AI systems, enterprise data pipelines, and high-scale platforms.',
        publisher: { '@id': 'https://adarshsingh.in/#person' },
      },
      {
        '@type': 'Person',
        '@id': 'https://adarshsingh.in/#person',
        name: 'Adarsh Singh',
        jobTitle: 'Enterprise AI Analyst · Cloud & AI Architect · Full-Stack Builder',
        url: 'https://adarshsingh.in',
        sameAs: [
          'https://github.com/Adarsh-Singh07',
          'https://www.linkedin.com/in/adarsh-singh07',
        ],
      },
    ],
  };

  const faqData = [
    {
      q: 'Who is Adarsh Singh?',
      a: 'Adarsh Singh is an Enterprise AI Analyst and Cloud & AI Architect specializing in autonomous agent architectures, multi-agent RAG pipelines, distributed enterprise data engineering (Databricks, Delta Lake), and resilient full-stack systems.',
    },
    {
      q: 'What technical stack does Adarsh master?',
      a: 'His core stack includes Python (FastAPI, PySpark, LangGraph, PyTorch), TypeScript & React/Next.js, PostgreSQL/Supabase, Docker, Azure (Databricks, ADF), Google Cloud Platform, and AWS.',
    },
    {
      q: 'What flagship systems has he built?',
      a: 'Key architectures include EMIVO (Full-Stack Commerce & EMI Platform with 17 locked ADRs), InterviewOS (real-time low-latency AI interview copilot), OfferShield (AI career authenticity verification platform), and Autonomous Voice AI Operations Agents.',
    },
    {
      q: 'Is Adarsh available for consulting or full-time engagements?',
      a: 'Yes. Adarsh engages with teams on enterprise AI architecture, high-scale data pipeline engineering, and multi-agent LLM systems. Connect via the direct transmission form below.',
    },
  ];

  return (
    <div className="w-full bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-[var(--background)]">
      <SEO
        title="Adarsh Singh | Enterprise AI Analyst · Cloud & AI Architect"
        description="Cinematic portfolio of Adarsh Singh — Enterprise AI Analyst, Cloud & AI Architect, and Full-Stack Builder. Architecting autonomous AI systems and distributed data pipelines."
        keywords="Adarsh Singh, AI Engineer, Cloud Architect, Data Architect, LangGraph, RAG, Databricks, FastAPI, React, Supabase"
        schema={homeSchema}
      />

      {/* 1. Cinematic Preloader (Runs 0-100% over 2000ms + curtain wipe) */}
      <Preloader onComplete={() => setPreloaderDone(true)} />

      {/* 2. Hero Section (#top) */}
      <CinematicHero bio={config?.subtext} />

      {/* 3. Infinite Marquee Operating Principles */}
      <Marquee />

      {/* 4. Story Section (#story) */}
      <StorySection />

      {/* 5. Ventures / Selected Projects (#projects — Supabase Dynamic) */}
      <VenturesSection projects={projects} />

      {/* 6. Live AI Twin CTA Card */}
      <section
        style={{
          padding: '4rem var(--gutter)',
          borderTop: '1px solid var(--line)',
          borderBottom: '1px solid var(--line)',
          background: 'var(--surface)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <a
            href="https://addy.adarshsingh.in"
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-8 rounded-[0.25rem] transition-all duration-340"
            style={{
              border: '1px solid var(--line-strong)',
              background: 'var(--surface-2)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line-strong)')}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-block w-2 h-2 rounded-full animate-pulse"
                    style={{ background: 'var(--accent)' }}
                  />
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.22em',
                      color: 'var(--accent)',
                    }}
                  >
                    Autonomous AI Twin
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.5rem',
                    textTransform: 'uppercase',
                    color: 'var(--foreground)',
                    lineHeight: 1,
                  }}
                >
                  Query Addy — My AI Twin
                </h3>
                <p
                  style={{
                    marginTop: '0.5rem',
                    fontSize: '1.0625rem',
                    color: 'var(--muted)',
                    maxWidth: '48ch',
                  }}
                >
                  Interrogate my production knowledge base, verify architectural decisions, or test real-time RAG synthesis.
                </p>
              </div>

              <div
                className="shrink-0 flex items-center gap-2 py-3 px-6 rounded-full"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--background)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                }}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Launch Addy Copilot</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* 7. Impact (#impact — By The Numbers) */}
      <ImpactSection />

      {/* 8. Credentials (#credentials — Interactive Split Panel) */}
      <CredentialsSection certifications={certifications} />

      {/* FAQ Accordion Section for SEO & AEO */}
      <section
        style={{
          padding: 'var(--section) var(--gutter)',
          borderTop: '1px solid var(--line)',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="eyebrow" style={{ marginBottom: '1.5rem' }}>
            AEO Knowledge Base
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3.25rem',
              textTransform: 'uppercase',
              lineHeight: 1,
              color: 'var(--foreground)',
              marginBottom: '3rem',
            }}
          >
            Frequently Clarified Architectures.
          </h2>

          <div className="space-y-4">
            {faqData.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  style={{
                    border: '1px solid var(--line)',
                    background: 'var(--surface)',
                    borderRadius: '0.125rem',
                  }}
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full py-5 px-6 flex items-center justify-between text-left cursor-pointer"
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '1.1875rem',
                        fontWeight: 600,
                        color: 'var(--foreground)',
                      }}
                    >
                      {faq.q}
                    </span>
                    <span
                      style={{
                        color: 'var(--accent)',
                        fontSize: '1.5rem',
                        transform: isOpen ? 'rotate(45deg)' : 'none',
                        transition: 'transform 300ms ease-out',
                      }}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        padding: '0 1.5rem 1.5rem',
                        borderTop: '1px solid var(--line)',
                        paddingTop: '1rem',
                        fontSize: '1.0625rem',
                        color: 'var(--muted)',
                        lineHeight: 1.6,
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. ContactFooter (#contact — Supabase Integrated) */}
      <ContactFooter coordinates={coordinates} isDark={isDark} />
    </div>
  );
}
