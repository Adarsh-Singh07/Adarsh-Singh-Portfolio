import { useState, useEffect, useRef } from 'react';
import LiquidImage from '../components/LiquidImage';

const ROLES = ['AI Engineer', 'Data Architect', 'Full-Stack', 'Builder'];
const DESCRIPTION = 'I architect autonomous AI systems, enterprise data pipelines, and high-scale web platforms — turning complex models into production reality.';

// Reveal delay after preloader
const REVEAL_DELAY = 2500;

interface CinematicHeroProps {
  bio?: string; // From Supabase profile bio, falls back to DESCRIPTION
}

export default function CinematicHero({ bio }: CinematicHeroProps) {
  const [revealed, setRevealed] = useState(false);
  const [nameRevealed, setNameRevealed] = useState(false);
  const [rolesRevealed, setRolesRevealed] = useState(false);
  const [descRevealed, setDescRevealed] = useState(false);
  const [cueRevealed, setCueRevealed] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setNameRevealed(true), REVEAL_DELAY);
    const t2 = setTimeout(() => setRolesRevealed(true), REVEAL_DELAY + 200);
    const t3 = setTimeout(() => setDescRevealed(true), REVEAL_DELAY + 400);
    const t4 = setTimeout(() => setCueRevealed(true), REVEAL_DELAY + 900);
    const t5 = setTimeout(() => setRevealed(true), REVEAL_DELAY);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  const renderLetters = (word: string, delay: number) => (
    <span className="inline-flex overflow-hidden">
      {word.split('').map((char, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            transform: nameRevealed ? 'translateY(0)' : 'translateY(100%)',
            opacity: nameRevealed ? 1 : 0,
            transition: `transform 900ms cubic-bezier(0.16, 1, 0.3, 1), opacity 900ms cubic-bezier(0.16, 1, 0.3, 1)`,
            transitionDelay: `${delay + i * 52}ms`,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );

  return (
    <section
      id="top"
      className="relative flex flex-col"
      style={{ minHeight: '100svh', overflow: 'hidden' }}
    >
      {/* Top Row: Roles + Description */}
      <div
        className="relative z-30 flex flex-col sm:flex-row justify-between"
        style={{ padding: '7rem var(--gutter) 0' }}
      >
        {/* Left - Role Words */}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            textTransform: 'uppercase',
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            color: 'var(--foreground)',
            fontSize: '1.75rem',
          }}
          className="sm:text-[3.25rem]"
        >
          {ROLES.map((role, i) => (
            <span
              key={role}
              className="block"
              style={{
                transform: rolesRevealed ? 'translateY(0)' : 'translateY(100%)',
                opacity: rolesRevealed ? 1 : 0,
                transition: `transform 760ms cubic-bezier(0.16, 1, 0.3, 1), opacity 760ms cubic-bezier(0.16, 1, 0.3, 1)`,
                transitionDelay: `${i * 80}ms`,
              }}
            >
              {role}
            </span>
          ))}
        </h2>

        {/* Right - Description */}
        <p
          className="sm:text-right mt-6 sm:mt-0"
          style={{
            maxWidth: '26rem',
            fontSize: '1.0625rem',
            color: 'var(--muted)',
            opacity: descRevealed ? 1 : 0,
            transform: descRevealed ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 520ms cubic-bezier(0.16, 1, 0.3, 1), transform 520ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {bio || DESCRIPTION}
        </p>
      </div>

      {/* Avatar / Portrait Column */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          height: '86vh',
          width: '80vw',
        }}
      >
        <div className="w-full h-full sm:w-[48vw] lg:w-[36vw] mx-auto">
          <LiquidImage
            src="/assets/hero/adarsh-avatar.png"
            alt="Adarsh Singh — AI Engineer & Data Architect"
            bare
            className="w-full h-full"
            style={{ objectFit: 'contain', objectPosition: 'center bottom' }}
            hoverScale={30}
          />
        </div>
      </div>

      {/* Gradient Base */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{
          insetInline: 0,
          bottom: 0,
          height: '26vh',
          background: 'linear-gradient(to bottom, transparent, #08080a)',
        }}
      />

      {/* Giant Name */}
      <h1
        className="absolute z-10 flex flex-col items-center text-hero"
        style={{
          insetInline: 0,
          bottom: 0,
          transform: 'translateY(6%)',
          color: 'var(--accent)',
          textAlign: 'center',
        }}
      >
        <span className="block whitespace-nowrap">
          {renderLetters('ADARSH', 0)}
        </span>
        <span className="block whitespace-nowrap">
          {renderLetters('SINGH', 240)}
        </span>
      </h1>

      {/* Scroll Cue */}
      <div
        className="absolute z-30 flex items-center"
        style={{
          bottom: '2rem',
          left: 'var(--gutter)',
          gap: '0.75rem',
          fontSize: '0.8125rem',
          textTransform: 'uppercase',
          letterSpacing: '0.22em',
          color: 'var(--muted)',
          opacity: cueRevealed ? 1 : 0,
          transform: cueRevealed ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 520ms ease-out, transform 520ms ease-out',
        }}
      >
        <span
          style={{
            width: '1px',
            height: '2.5rem',
            background: 'var(--accent)',
          }}
        />
        <span>Scroll to enter</span>
      </div>
    </section>
  );
}
