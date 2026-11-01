import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLenis } from './SmoothScroll';

const PRIMARY_LINKS = [
  { label: 'Story', hash: '#story', path: '/#story' },
  { label: 'Projects', hash: '#projects', path: '/projects' },
  { label: 'Impact', hash: '#impact', path: '/#impact' },
  { label: 'Credentials', hash: '#credentials', path: '/certifications' },
  { label: 'Contact', hash: '#contact', path: '/#contact' },
];

const ALL_ROUTES = [
  { label: 'Story', path: '/#story' },
  { label: 'Projects Archive', path: '/projects' },
  { label: 'Skills & Stack', path: '/skills' },
  { label: 'Credentials', path: '/certifications' },
  { label: 'Engineering Journey', path: '/timeline' },
  { label: 'Technical Articles', path: '/blog' },
  { label: 'Contact Gateway', path: '/#contact' },
  { label: 'Blueprint Resume', path: '/resume' },
  { label: 'Admin Console', path: '/admin' },
];

export default function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const lenisCtx = useLenis();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, link: { hash?: string; path: string }) => {
    if (location.pathname === '/') {
      if (link.hash) {
        e.preventDefault();
        const targetEl = document.querySelector(link.hash);
        if (targetEl && lenisCtx?.lenis) {
          lenisCtx.lenis.scrollTo(targetEl as HTMLElement);
        }
        setMenuOpen(false);
        return;
      }
    } else {
      if (link.hash?.startsWith('#') && link.path.startsWith('/#')) {
        e.preventDefault();
        navigate(link.path);
        setMenuOpen(false);
        setTimeout(() => {
          const targetEl = document.querySelector(link.hash || '');
          if (targetEl && lenisCtx?.lenis) {
            lenisCtx.lenis.scrollTo(targetEl as HTMLElement);
          }
        }, 300);
        return;
      }
    }
  };

  return (
    <>
      <header
        style={{
          position: 'fixed',
          insetInline: 0,
          top: 0,
          zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        <nav
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem var(--gutter)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            background: 'linear-gradient(to bottom, rgba(8, 8, 10, 0.85) 0%, rgba(8, 8, 10, 0) 100%)',
          }}
        >
          {/* Logo (left) */}
          <Link to="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '9999px',
                border: '1px solid var(--line-strong)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: 'var(--foreground)',
                fontSize: '0.875rem',
                background: 'var(--surface)',
              }}
            >
              AS
            </div>
            <span
              className="hidden sm:block"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.22em',
                color: 'var(--muted)',
              }}
            >
              Adarsh Singh
            </span>
          </Link>

          {/* Desktop links (>=md) */}
          <ul className="hidden md:flex items-center" style={{ gap: '2.5rem' }}>
            {PRIMARY_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.path}
                  onClick={(e) => handleLinkClick(e, link)}
                  className="group relative inline-block py-1"
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
                  {link.label}
                  <span
                    className="absolute left-0 bottom-0 h-px bg-[var(--accent)] transition-all duration-340 ease-out w-0 group-hover:w-full"
                  />
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/resume"
                className="py-1.5 px-4 rounded-full border text-[11px] font-bold uppercase tracking-widest transition-all duration-300"
                style={{
                  borderColor: 'var(--line-strong)',
                  color: 'var(--foreground)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.color = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--line-strong)';
                  e.currentTarget.style.color = 'var(--foreground)';
                }}
              >
                Resume
              </Link>
            </li>
          </ul>

          {/* Mobile Burger Button (<md) */}
          <button
            className="md:hidden relative z-[60] flex flex-col gap-[5px] items-center justify-center w-10 h-10 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span
              className="block w-6 h-px transition-all duration-300"
              style={{
                background: 'var(--foreground)',
                transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none',
              }}
            />
            <span
              className="block w-6 h-px transition-all duration-300"
              style={{
                background: 'var(--foreground)',
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-6 h-px transition-all duration-300"
              style={{
                background: 'var(--foreground)',
                transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none',
              }}
            />
          </button>
        </nav>
      </header>

      {/* Fullscreen Mobile Menu Panel */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[55] flex flex-col items-start justify-center px-[var(--gutter)] overflow-y-auto py-20"
          style={{
            background: 'var(--background)',
            animation: 'menuFadeIn 450ms ease-out forwards',
          }}
        >
          <style>{`
            @keyframes menuFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes linkSlideUp {
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <ul className="space-y-4 w-full">
            {ALL_ROUTES.map((link, i) => (
              <li
                key={link.label}
                style={{
                  opacity: 0,
                  transform: 'translateY(48px)',
                  animation: `linkSlideUp 420ms ease-out forwards`,
                  animationDelay: `${80 + i * 40}ms`,
                }}
              >
                <Link
                  to={link.path}
                  onClick={(e) => handleLinkClick(e, link)}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.5rem',
                    textTransform: 'uppercase',
                    color: 'var(--foreground)',
                    lineHeight: 1.1,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
