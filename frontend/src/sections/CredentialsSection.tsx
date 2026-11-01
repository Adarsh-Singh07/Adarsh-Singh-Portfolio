import { useState, useRef, useEffect } from 'react';
import LiquidImage from '../components/LiquidImage';
import { Certification } from '../types';

interface CredentialItem {
  id: string;
  num: string;
  title: string;
  issuer: string;
  quote: string;
  credentialUrl?: string;
  badgeUrl?: string;
}

const DEFAULT_CREDENTIALS: CredentialItem[] = [
  {
    id: 'gcp-dev',
    num: '01',
    title: 'Google Cloud Professional Cloud Developer & GenAI Leader',
    issuer: 'Google Cloud',
    quote: 'Designing, building, and deploying scalable cloud-native applications and enterprise generative AI workflows on GCP.',
    credentialUrl: 'https://google.accredible.com',
    badgeUrl: '/favicon.png',
  },
  {
    id: 'azure-ai',
    num: '02',
    title: 'Microsoft Certified: Azure AI Engineer Associate',
    issuer: 'Microsoft Azure (Plus AI-900 & AZ-900)',
    quote: 'Architecting end-to-end cognitive services, Azure OpenAI pipelines, and enterprise Databricks data engineering solutions.',
    credentialUrl: 'https://learn.microsoft.com',
    badgeUrl: '/favicon.png',
  },
  {
    id: 'aws-ai',
    num: '03',
    title: 'AWS Certified AI Practitioner',
    issuer: 'Amazon Web Services',
    quote: 'Implementing foundational machine learning, bedrock model routing, and secure AI architectures on AWS infrastructure.',
    credentialUrl: 'https://aws.amazon.com/verification',
    badgeUrl: '/favicon.png',
  },
  {
    id: 'capgemini',
    num: '04',
    title: 'Enterprise AI & Data Engineering',
    issuer: 'Analyst @ Capgemini · MCA (LPU)',
    quote: 'Driving production support, Python automation, and Azure Databricks data engineering for enterprise client systems.',
    credentialUrl: 'https://www.linkedin.com/in/adarshsingh45',
    badgeUrl: '/favicon.png',
  },
];

interface CredentialsSectionProps {
  certifications?: Certification[];
}

export default function CredentialsSection({ certifications }: CredentialsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [revealKey, setRevealKey] = useState(0);

  // Map Supabase certifications or fallback
  const items: CredentialItem[] = certifications && certifications.length > 0
    ? certifications.map((c, i) => ({
        id: c.id,
        num: String(i + 1).padStart(2, '0'),
        title: c.title,
        issuer: c.issuer,
        quote: `${c.title} — certified by ${c.issuer}. Validated for production cloud and artificial intelligence infrastructure.`,
        credentialUrl: c.credentialUrl,
        badgeUrl: c.badgeUrl || '/favicon.png',
      }))
    : DEFAULT_CREDENTIALS;

  const active = items[activeIndex] || items[0];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSelect = (idx: number) => {
    setActiveIndex(idx);
    setRevealKey(k => k + 1);
  };

  return (
    <section
      id="credentials"
      ref={sectionRef}
      style={{ padding: 'var(--section) var(--gutter)' }}
    >
      {/* Header */}
      <div className="eyebrow" style={{ marginBottom: '1.5rem' }}>
        Verified Credentials
      </div>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          textTransform: 'uppercase',
          lineHeight: 0.95,
          color: 'var(--foreground)',
          fontSize: '3.25rem',
        }}
        className="sm:text-[5rem]"
      >
        Cloud & AI Mastery.
      </h2>

      {/* Body Grid */}
      <div
        className="grid grid-cols-1 lg:grid-cols-12 mt-16"
        style={{ gap: 'var(--gutter)' }}
      >
        {/* Left Selector List */}
        <div className="lg:col-span-5">
          <ul>
            {items.map((item, i) => {
              const isActive = activeIndex === i;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleSelect(i)}
                    className="w-full text-left group transition-all"
                    style={{
                      borderTop: '1px solid var(--line)',
                      padding: '1.75rem 0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      opacity: inView ? 1 : 0,
                      transform: inView ? 'translateY(0)' : 'translateY(20px)',
                      transition: 'opacity 560ms cubic-bezier(0.16, 1, 0.3, 1), transform 560ms cubic-bezier(0.16, 1, 0.3, 1)',
                      transitionDelay: `${i * 90}ms`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        letterSpacing: '0.18em',
                        color: isActive ? 'var(--accent)' : 'var(--muted)',
                        transition: 'color 340ms ease-out',
                      }}
                    >
                      {item.num}
                    </span>
                    <span
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: 600,
                        lineHeight: 1.2,
                        letterSpacing: '-0.01em',
                        color: isActive ? 'var(--foreground)' : 'var(--muted)',
                        transition: 'color 340ms ease-out',
                      }}
                      className="group-hover:!text-[var(--foreground)]"
                    >
                      {item.title}
                    </span>
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.18em',
                        color: 'var(--muted)',
                        marginTop: '0.25rem',
                      }}
                    >
                      {item.issuer}
                    </span>
                    {/* Trailing accent rule */}
                    <span
                      style={{
                        height: '1px',
                        background: 'var(--accent)',
                        width: isActive ? '2.5rem' : '0rem',
                        transition: 'width 340ms ease-out',
                        marginTop: '0.5rem',
                      }}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Featured Panel */}
        <div className="lg:col-span-7 flex flex-col justify-between pt-4 lg:pt-0">
          <div>
            {/* Quote with word-by-word spring reveal */}
            <blockquote
              key={revealKey}
              style={{
                maxWidth: '30ch',
                fontFamily: 'var(--font-sans)',
                fontSize: '1.75rem',
                fontWeight: 500,
                lineHeight: 1.35,
                color: 'var(--foreground)',
              }}
            >
              {active.quote.split(' ').map((word, i) => (
                <span key={i} className="inline-block overflow-hidden mr-[0.28em]">
                  <span
                    className="inline-block"
                    style={{
                      animation: `credWord 520ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 22}ms both`,
                    }}
                  >
                    {word}
                  </span>
                </span>
              ))}
            </blockquote>
            <style>{`
              @keyframes credWord {
                from { opacity: 0; transform: translateY(18px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            {/* Credential link / verification */}
            <footer
              style={{
                marginTop: '2rem',
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                color: 'var(--muted)',
              }}
            >
              <span>{active.issuer}</span>
              {active.credentialUrl && (
                <>
                  <span className="mx-2">·</span>
                  <a
                    href={active.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--accent)' }}
                    className="hover:underline"
                  >
                    Verify Credential ↗
                  </a>
                </>
              )}
            </footer>
          </div>

          {/* Visual badge / preview */}
          {active.badgeUrl && (
            <div
              className="mt-8 rounded-sm overflow-hidden"
              style={{ width: '16rem', aspectRatio: '4/5' }}
            >
              <LiquidImage
                src={active.badgeUrl}
                alt={active.title}
                hoverScale={22}
                className="w-full h-full object-contain p-4 bg-[var(--surface)]"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
