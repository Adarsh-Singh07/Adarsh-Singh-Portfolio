import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, FolderGit2, Mail, ArrowRight } from 'lucide-react';

interface NotFoundProps {
  isDark?: boolean;
}

export default function NotFound({}: NotFoundProps) {
  return (
    <div
      className="min-h-[85vh] flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        padding: '8rem var(--gutter) 4rem',
      }}
    >
      <title>404: Page Not Found | Adarsh Singh</title>
      <meta name="robots" content="noindex, follow" />

      {/* Ambient background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '32rem',
          height: '32rem',
          borderRadius: '9999px',
          background: 'radial-gradient(circle, rgba(255, 59, 29, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xl w-full text-center relative z-10"
      >
        <div className="eyebrow justify-center mb-6">
          <span className="eyebrow-dot" />
          <span>Error 404 · Unresolved Endpoint</span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(6rem, 16vw, 12rem)',
            lineHeight: 0.85,
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
          }}
          className="mb-4"
        >
          404
        </h1>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
          }}
          className="mb-4"
        >
          Lost in Data Space?
        </h2>

        <p
          style={{
            color: 'var(--muted)',
            fontSize: '1.0625rem',
            lineHeight: 1.6,
            maxWidth: '28rem',
            margin: '0 auto 2.5rem',
          }}
        >
          The endpoint you are trying to resolve doesn't exist or has been relocated. Let's redirect you back to a verified route.
        </p>

        {/* Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 p-3.5 rounded-full border transition-all duration-300 group"
            style={{
              borderColor: 'var(--line)',
              backgroundColor: 'var(--surface)',
              color: 'var(--foreground)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            <Home className="w-4 h-4 text-[#ff3b1d] transition-transform duration-300 group-hover:scale-110" />
            <span>Home</span>
          </Link>

          <Link
            to="/projects"
            className="flex items-center justify-center gap-2 p-3.5 rounded-full border transition-all duration-300 group"
            style={{
              borderColor: 'var(--line)',
              backgroundColor: 'var(--surface)',
              color: 'var(--foreground)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            <FolderGit2 className="w-4 h-4 text-[#ff3b1d] transition-transform duration-300 group-hover:scale-110" />
            <span>Projects</span>
          </Link>

          <Link
            to="/contact"
            className="flex items-center justify-center gap-2 p-3.5 rounded-full border transition-all duration-300 group"
            style={{
              borderColor: 'var(--line)',
              backgroundColor: 'var(--surface)',
              color: 'var(--foreground)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            <Mail className="w-4 h-4 text-[#ff3b1d] transition-transform duration-300 group-hover:scale-110" />
            <span>Contact</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
