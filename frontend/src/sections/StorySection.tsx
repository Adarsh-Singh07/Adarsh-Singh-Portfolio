import { useRef, useEffect, useState } from 'react';

const PRINCIPLES = [
  {
    num: '01',
    title: 'Production over prototypes',
    desc: 'Demos are easy; reliability is hard. Every AI workflow and data pipeline I build is engineered for low latency, observability, and fault tolerance from day one.',
  },
  {
    num: '02',
    title: 'Multi-agent systems with guardrails',
    desc: 'Autonomous LLMs need deterministic structure. Using LangGraph, RAG, and strict schema validation, I turn probabilistic models into dependable software.',
  },
  {
    num: '03',
    title: 'Full-stack ownership',
    desc: 'From PostgreSQL, Supabase, and FastAPI backends to glassmorphic, fluid frontends and Dockerized cloud deployments, I own the entire stack end-to-end.',
  },
  {
    num: '04',
    title: 'Cloud-native by default',
    desc: 'Certified across Azure, Google Cloud, and AWS, I design architectures that scale elastically while keeping compute and inference costs lean.',
  },
];

export default function StorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

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

  return (
    <section
      id="story"
      ref={sectionRef}
      style={{ padding: 'var(--section) var(--gutter)' }}
    >
      <div
        className="grid grid-cols-1 lg:grid-cols-12"
        style={{ gap: 'var(--gutter)' }}
      >
        {/* Left Column */}
        <div className="lg:col-span-6">
          {/* Eyebrow */}
          <div className="eyebrow" style={{ marginBottom: '1.5rem' }}>
            The Story
          </div>

          {/* Heading with line reveal */}
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              textTransform: 'uppercase',
              fontSize: '3.25rem',
              lineHeight: 0.95,
              maxWidth: '16ch',
              color: 'var(--foreground)',
            }}
            className="sm:text-[5rem]"
          >
            {'Engineering intelligence that scales in the real world.'.split(' ').map((word, i) => (
              <span key={i} className="inline-block overflow-hidden mr-[0.3em]">
                <span
                  className="inline-block"
                  style={{
                    transform: inView ? 'translateY(0)' : 'translateY(110%)',
                    transition: 'transform 850ms cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDelay: `${i * 50}ms`,
                  }}
                >
                  {word}
                </span>
              </span>
            ))}
          </h2>

          {/* Body text */}
          <p
            style={{
              marginTop: '2rem',
              maxWidth: '46ch',
              fontSize: '1.375rem',
              color: 'var(--muted)',
              lineHeight: 1.45,
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 520ms cubic-bezier(0.16, 1, 0.3, 1) 200ms, transform 520ms cubic-bezier(0.16, 1, 0.3, 1) 200ms',
            }}
          >
            From enterprise data pipelines on Azure Databricks at Capgemini to shipping multi-agent LLM architectures, real-time voice copilots, and full-stack platforms, my focus has never changed: take the hardest problems in AI and distributed systems, strip away the hype, and ship resilient software built for production.
          </p>
        </div>

        {/* Right Column - Principles */}
        <div className="lg:col-span-6" style={{ paddingTop: '0.5rem' }}>
          <ul>
            {PRINCIPLES.map((p, i) => (
              <li
                key={p.num}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  columnGap: '1.5rem',
                  borderTop: '1px solid var(--line)',
                  padding: '2rem 0',
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0)' : 'translateY(24px)',
                  transition: 'opacity 560ms cubic-bezier(0.16, 1, 0.3, 1), transform 560ms cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: `${i * 90}ms`,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.75rem',
                    color: 'var(--accent)',
                    lineHeight: 1,
                  }}
                >
                  {p.num}
                </span>
                <div>
                  <h3
                    style={{
                      fontSize: '1.75rem',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                      color: 'var(--foreground)',
                      lineHeight: 1.15,
                    }}
                  >
                    {p.title}
                  </h3>
                  <p
                    style={{
                      marginTop: '0.5rem',
                      fontSize: '1.0625rem',
                      color: 'var(--muted)',
                      lineHeight: 1.6,
                    }}
                  >
                    {p.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
