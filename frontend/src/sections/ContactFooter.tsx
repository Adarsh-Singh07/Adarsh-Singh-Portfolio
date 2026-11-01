import React, { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PortfolioService from '../services/api';
import { Coordinates } from '../types';

interface ContactFooterProps {
  isDark?: boolean;
  coordinates?: Coordinates;
}

export default function ContactFooter({ coordinates }: ContactFooterProps) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Portfolio Outreach', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  const coords = coordinates || {
    email: 'hello@adarshsingh.in',
    linkedin: 'https://linkedin.com/in/adarshsingh45',
    github: 'https://github.com/Adarsh-Singh07',
    location: 'Bengaluru, India',
    hours: 'Mon – Fri, 9:00 AM – 6:00 PM IST',
  };

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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await PortfolioService.submitContactMessage(formData);
      setSubmitResult(res);
      setFormData({ name: '', email: '', subject: 'Portfolio Outreach', message: '' });
    } catch {
      setSubmitResult({
        success: false,
        message: 'Your message could not be delivered to the gateway. Please reach out directly via email.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const socials = [
    { label: 'GitHub', url: coords.github || 'https://github.com/Adarsh-Singh07' },
    { label: 'LinkedIn', url: coords.linkedin || 'https://linkedin.com/in/adarshsingh45' },
    { label: 'X / Twitter', url: 'https://x.com/adarshsingh_07' },
    { label: 'Portfolio', url: 'https://adarshsingh.in' },
  ];

  return (
    <footer
      id="contact"
      ref={sectionRef}
      style={{
        paddingTop: 'var(--section)',
        paddingInline: 'var(--gutter)',
        background: 'var(--background)',
      }}
    >
      {/* Eyebrow */}
      <div className="eyebrow" style={{ marginBottom: '1.5rem' }}>
        Let's Build
      </div>

      {/* Heading with line reveal */}
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          textTransform: 'uppercase',
          lineHeight: 0.95,
          color: 'var(--foreground)',
          fontSize: '3.5rem',
        }}
        className="sm:text-[7.5rem]"
      >
        {'Need an AI system or platform built for scale?'.split(' ').map((word, i) => (
          <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
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

      {/* Sub-copy */}
      <p
        style={{
          marginTop: '2rem',
          maxWidth: '44ch',
          fontSize: '1.375rem',
          color: 'var(--muted)',
          lineHeight: 1.45,
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 520ms cubic-bezier(0.16, 1, 0.3, 1) 150ms, transform 520ms cubic-bezier(0.16, 1, 0.3, 1) 150ms',
        }}
      >
        Whether it's enterprise AI architecture, multi-agent systems, or full-stack engineering — my inbox is open.
      </p>

      {/* Grid: Oversized Email Link + Direct Supabase Contact Form */}
      <div
        className="grid grid-cols-1 lg:grid-cols-12 mt-12 items-start"
        style={{ gap: 'var(--gutter)' }}
      >
        {/* Left: Oversized CTA */}
        <div className="lg:col-span-6">
          <a
            href={`mailto:${coords.email}`}
            className="group inline-flex items-center gap-3 transition-transform duration-340 ease-out hover:translate-x-3.5"
            style={{
              fontSize: '1.75rem',
              fontWeight: 600,
              color: 'var(--foreground)',
              transition: 'color 340ms ease-out, transform 340ms ease-out',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
          >
            <span className="break-all sm:text-[3rem] lg:text-[4rem] leading-none font-sans font-bold">
              {coords.email}
            </span>
            <span style={{ color: 'var(--accent)', fontSize: '2rem' }}>↗</span>
          </a>

          <div
            className="mt-8 space-y-2"
            style={{
              fontSize: '0.8125rem',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: 'var(--muted)',
            }}
          >
            <p>Direct Inquiries · Advisory · Technical Architecture</p>
            <p>Based in {coords.location || 'Bengaluru, India'} · Worldwide Deployments</p>
          </div>
        </div>

        {/* Right: Supabase Connected Minimal Contact Form */}
        <div className="lg:col-span-6">
          <form
            onSubmit={handleFormSubmit}
            className="p-6 md:p-8 rounded-[0.25rem]"
            style={{
              border: '1px solid var(--line)',
              background: 'var(--surface)',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
                color: 'var(--foreground)',
                marginBottom: '1.5rem',
              }}
            >
              Direct Transmission
            </h3>

            <div className="space-y-4">
              <div>
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="Your Name / Organization *"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--line-strong)',
                    padding: '1.25rem 0',
                    color: 'var(--foreground)',
                    fontSize: '1.0625rem',
                    outline: 'none',
                    transition: 'border-color 340ms ease-out',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line-strong)')}
                />
              </div>

              <div>
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="Your Return Email Address *"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--line-strong)',
                    padding: '1.25rem 0',
                    color: 'var(--foreground)',
                    fontSize: '1.0625rem',
                    outline: 'none',
                    transition: 'border-color 340ms ease-out',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line-strong)')}
                />
              </div>

              <div>
                <textarea
                  required
                  rows={4}
                  name="message"
                  placeholder="Brief overview of problem statement, architecture requirements, or timeline... *"
                  value={formData.message}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--line-strong)',
                    padding: '1.25rem 0',
                    color: 'var(--foreground)',
                    fontSize: '1.0625rem',
                    outline: 'none',
                    resize: 'none',
                    transition: 'border-color 340ms ease-out',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line-strong)')}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative overflow-hidden w-full mt-4"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.375rem',
                  textTransform: 'uppercase',
                  padding: '1.25rem 2rem',
                  letterSpacing: '0.05em',
                  background: 'var(--surface-2)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--line-strong)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'background 340ms ease-out, border-color 340ms ease-out',
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.background = 'var(--accent)';
                    e.currentTarget.style.borderColor = 'var(--accent)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.background = 'var(--surface-2)';
                    e.currentTarget.style.borderColor = 'var(--line-strong)';
                  }
                }}
              >
                <span>{isSubmitting ? 'Transmitting Data...' : 'Transmit Message →'}</span>
              </button>

              {submitResult && (
                <div
                  className="p-4 rounded text-xs mt-4"
                  style={{
                    background: submitResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: submitResult.success ? '#4ade80' : '#f87171',
                    border: submitResult.success ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                >
                  {submitResult.message}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Footer Bar */}
      <div
        className="grid grid-cols-1 lg:grid-cols-12 items-center"
        style={{
          marginTop: 'var(--section)',
          borderTop: '1px solid var(--line)',
          padding: '3rem 0',
          gap: '2rem',
        }}
      >
        {/* Left */}
        <div className="lg:col-span-6">
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3.25rem',
              textTransform: 'uppercase',
              lineHeight: 1,
              color: 'var(--foreground)',
              display: 'block',
            }}
          >
            Adarsh Singh
          </span>
          <p
            style={{
              fontSize: '0.8125rem',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: 'var(--muted)',
              marginTop: '0.5rem',
            }}
          >
            Engineered in Bengaluru · Built with conviction.
          </p>
        </div>

        {/* Middle — Social Links with expanding leading line */}
        <div className="lg:col-span-3 flex flex-col gap-2.5">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2"
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
              <span
                style={{
                  height: '1px',
                  background: 'var(--accent)',
                  width: '0rem',
                  transition: 'width 340ms ease-out',
                }}
                className="group-hover:!w-6"
              />
              <span>{s.label}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>↗</span>
            </a>
          ))}
        </div>

        {/* Right — Copyright & Admin link */}
        <div className="lg:col-span-3 lg:text-right space-y-1">
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--muted)',
              letterSpacing: '0.05em',
            }}
          >
            © 2026 Adarsh Singh. All rights reserved.
          </p>
          <div className="text-xs">
            <Link
              to="/admin"
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                color: 'var(--muted)',
                opacity: 0.5,
                transition: 'opacity 340ms ease-out',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
            >
              Admin Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
