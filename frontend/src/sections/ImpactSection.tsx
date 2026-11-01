import { useRef, useEffect, useState } from 'react';

const STATS = [
  { figure: '6+', label: 'Global Cloud & AI Certifications (Azure, GCP, AWS)' },
  { figure: '17+', label: 'Production ADRs & Full-Stack Architectures Shipped' },
  { figure: '99.9%', label: 'Enterprise Data Pipeline & System Reliability' },
  { figure: '4+', label: 'Autonomous AI & Multi-Agent Platforms Built' },
];

export default function ImpactSection() {
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
      id="impact"
      ref={sectionRef}
      style={{ padding: 'var(--section) var(--gutter)' }}
    >
      {/* Header */}
      <div className="eyebrow" style={{ marginBottom: '1.5rem' }}>
        By The Numbers
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
        {'Engineering impact, measured.'.split(' ').map((word, i) => (
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

      {/* Stats Grid */}
      <dl
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ marginTop: '4rem', borderTop: '1px solid var(--line)' }}
      >
        {STATS.map((stat, i) => (
          <div
            key={stat.figure}
            className="group"
            style={{
              borderBottom: '1px solid var(--line)',
              padding: '2.5rem 0',
              paddingLeft: i > 0 ? '2rem' : 0,
              borderLeft: i > 0 ? '1px solid var(--line)' : 'none',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 560ms cubic-bezier(0.16, 1, 0.3, 1), transform 560ms cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: `${i * 110}ms`,
            }}
          >
            <dd
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '7.5rem',
                lineHeight: 1,
                letterSpacing: '-0.01em',
                color: 'var(--foreground)',
                transition: 'color 340ms ease-out',
              }}
              className="group-hover:!text-[var(--accent)]"
            >
              {stat.figure}
            </dd>
            <dt
              style={{
                maxWidth: '20ch',
                fontSize: '1.0625rem',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--muted)',
                marginTop: '0.75rem',
                lineHeight: 1.4,
              }}
            >
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
