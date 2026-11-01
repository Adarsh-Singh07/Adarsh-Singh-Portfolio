import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LiquidImage from '../components/LiquidImage';
import { Project } from '../types';

export const FALLBACK_PROJECTS: Array<Project & { year?: string; outcome?: string; image?: string }> = [
  {
    id: 'emivo',
    title: 'EMIVO',
    description: 'Electronics and appliance retail ecosystem featuring custom EMI financing, 17 locked ADRs, Cloudflare R2 media pipeline, and Docker-first deployment.',
    technologies: ['FastAPI', 'Next.js', 'Supabase', 'Cloudflare R2', 'Docker'],
    metrics: [{ label: 'ADRs Locked', value: '17' }, { label: 'Architecture', value: 'Microservices' }],
    githubUrl: 'https://github.com/Adarsh-Singh07/EMIVO',
    demoUrl: 'https://emivo.adarshsingh.in',
    status: 'Deployed',
    featured: true,
    priority: { general: 1, 'data-engineer': 1 },
    year: '2026',
    outcome: 'Full-Stack Commerce & EMI Platform',
    image: '/og-image.png',
  },
  {
    id: 'interviewos',
    title: 'InterviewOS',
    description: 'Low-latency personal AI meeting and interview copilot engineered with live streaming transcription and a three-layer contextual memory architecture.',
    technologies: ['Deepgram ASR', 'Groq', 'Cloud VM', 'FastAPI', 'WebSocket'],
    metrics: [{ label: 'Latency', value: '<250ms' }, { label: 'Memory', value: '3-Layer Context' }],
    githubUrl: 'https://github.com/Adarsh-Singh07/InterviewOS',
    demoUrl: 'https://interviewos.adarshsingh.in',
    status: 'Deployed',
    featured: true,
    priority: { general: 2, 'data-engineer': 2 },
    year: '2026',
    outcome: 'Real-Time AI Copilot',
    image: '/og-image.png',
  },
  {
    id: 'offershield',
    title: 'OfferShield',
    description: 'AI-powered job offer and company authenticity verification platform tailored to detect recruitment fraud in the Indian tech market.',
    technologies: ['LLM Risk Engine', 'Python', 'FastAPI', 'Supabase'],
    metrics: [{ label: 'Accuracy', value: '98.4%' }, { label: 'Analysis Time', value: '<2s' }],
    githubUrl: 'https://github.com/Adarsh-Singh07/OfferShield',
    demoUrl: 'https://offershield.adarshsingh.in',
    status: 'Deployed',
    featured: true,
    priority: { general: 3, 'data-engineer': 3 },
    year: '2026',
    outcome: 'AI Career & Offer Verification',
    image: '/og-image.png',
  },
  {
    id: 'voice-ai-agent',
    title: 'Autonomous Voice AI Agent',
    description: 'Voice-driven autonomous agent orchestrating workflows across GitHub, LinkedIn, Zoho Mail, and Calendar with local and cloud LLM routing.',
    technologies: ['LangGraph', 'Ollama', 'CLI', 'Python', 'Whisper'],
    metrics: [{ label: 'Integrations', value: '4 Tools' }, { label: 'Execution', value: 'Autonomous' }],
    githubUrl: 'https://github.com/Adarsh-Singh07/Voice-AI-Agent',
    demoUrl: 'https://addy.adarshsingh.in',
    status: 'Deployed',
    featured: true,
    priority: { general: 4, 'data-engineer': 4 },
    year: '2026',
    outcome: 'Multi-Tool Operations Agent',
    image: '/og-image.png',
  },
];

interface VenturesSectionProps {
  projects?: Project[];
}

export default function VenturesSection({ projects }: VenturesSectionProps) {
  const displayProjects = projects && projects.length > 0 ? projects : FALLBACK_PROJECTS;
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
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      style={{ padding: 'var(--section) var(--gutter)' }}
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16">
        <div>
          <div className="eyebrow" style={{ marginBottom: '1.5rem' }}>
            Selected Works
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
            {'Systems built and shipped.'.split(' ').map((word, i) => (
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
        </div>

        <div className="mt-6 sm:mt-0 flex flex-col sm:items-end gap-2">
          <span
            style={{
              fontSize: '0.8125rem',
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              color: 'var(--muted)',
            }}
          >
            {String(displayProjects.length).padStart(2, '0')} / Flagship Builds
          </span>
          <Link
            to="/projects"
            className="group inline-flex items-center gap-1.5"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: 'var(--muted)',
              transition: 'color 340ms ease-out',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
          >
            <span>View Full Archive</span>
            <span style={{ color: 'var(--accent)' }}>→</span>
          </Link>
        </div>
      </div>

      {/* Projects Grid */}
      <ul
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ columnGap: 'var(--gutter)', rowGap: '4rem' }}
      >
        {displayProjects.slice(0, 4).map((project, i) => {
          const isOdd = i % 2 === 1;
          const p = project as any;
          const projectImage = p.image_url || p.imageUrl || p.image || '/og-image.png';
          const projectYear = p.year || (p.created_at ? new Date(p.created_at).getFullYear() : '2026');
          const projectOutcome = p.outcome || (p.metrics && p.metrics[0]?.value ? `${p.metrics[0].label}: ${p.metrics[0].value}` : project.status);
          const projectLink = `/projects/${project.id}`;

          return (
            <li
              key={project.id}
              className="group"
              style={{
                marginTop: isOdd ? '6rem' : 0,
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(32px)',
                transition: 'opacity 620ms cubic-bezier(0.16, 1, 0.3, 1), transform 620ms cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: isOdd ? `${120 + i * 60}ms` : `${i * 60}ms`,
              }}
            >
              <article>
                {/* Project Image wrapped with Link */}
                <Link to={projectLink} className="block overflow-hidden rounded-[0.125rem]">
                  <LiquidImage
                    src={projectImage}
                    alt={project.title}
                    className="w-full aspect-[16/11]"
                    hoverScale={28}
                  />
                </Link>

                {/* Meta Row */}
                <div
                  className="flex flex-col sm:flex-row justify-between"
                  style={{
                    marginTop: '1.5rem',
                    borderTop: '1px solid var(--line)',
                    paddingTop: '1.25rem',
                  }}
                >
                  <div className="max-w-[42ch]">
                    <Link to={projectLink}>
                      <h3
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '1.75rem',
                          fontWeight: 600,
                          letterSpacing: '-0.01em',
                          color: 'var(--foreground)',
                          transition: 'color 340ms ease-out',
                        }}
                        className="group-hover:!text-[var(--accent)]"
                      >
                        {project.title}
                      </h3>
                    </Link>
                    <p
                      style={{
                        marginTop: '0.5rem',
                        fontSize: '1.0625rem',
                        color: 'var(--muted)',
                        lineHeight: 1.5,
                      }}
                    >
                      {project.description}
                    </p>
                  </div>

                  <div className="shrink-0 sm:text-right mt-3 sm:mt-0">
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.18em',
                        color: 'var(--muted)',
                      }}
                    >
                      {projectYear}
                    </span>
                    <span
                      className="block"
                      style={{
                        marginTop: '0.5rem',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.18em',
                        color: 'var(--accent)',
                      }}
                    >
                      {projectOutcome}
                    </span>

                    {/* External Direct Links */}
                    <div className="flex gap-4 mt-2 sm:justify-end">
                      {(p.demoUrl || p.live_url) && (
                        <a
                          href={p.demoUrl || p.live_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '0.8125rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.18em',
                            color: 'var(--muted)',
                            transition: 'color 340ms ease-out',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
                        >
                          Live ↗
                        </a>
                      )}
                      {(project.githubUrl || p.github_url) && (
                        <a
                          href={project.githubUrl || p.github_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '0.8125rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.18em',
                            color: 'var(--muted)',
                            transition: 'color 340ms ease-out',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
                        >
                          Code ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tech Stack Tags */}
                <div className="flex flex-wrap gap-2.5" style={{ marginTop: '0.75rem' }}>
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      style={{
                        fontSize: '0.8125rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.22em',
                        color: 'var(--muted)',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
