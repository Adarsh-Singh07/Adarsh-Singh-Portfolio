import { useState, useEffect, useRef } from 'react';
import { useLenis } from './SmoothScroll';

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<'counting' | 'fadeLabels' | 'wipe' | 'done'>('counting');
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const lenisCtx = useLenis();

  useEffect(() => {
    // Lock scroll during preloader
    if (lenisCtx?.lenis) lenisCtx.lenis.stop();
    window.scrollTo(0, 0);

    startRef.current = performance.now();
    const DURATION = 2000;

    function tick(now: number) {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / DURATION, 1);
      // Ease-out cubic for the counter
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * 100));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Count complete - fade labels
        setPhase('fadeLabels');
        setTimeout(() => {
          setPhase('wipe');
          setTimeout(() => {
            setPhase('done');
            if (lenisCtx?.lenis) lenisCtx.lenis.start();
            onComplete();
          }, 700);
        }, 500);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className="preloader fixed inset-0 z-[100] flex items-end justify-between px-[var(--gutter)] pb-12"
      style={{
        background: 'var(--background)',
        transform: phase === 'wipe' ? 'translateY(-100%)' : 'translateY(0)',
        transition: phase === 'wipe' ? 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
        pointerEvents: phase === 'wipe' || phase === 'done' ? 'none' : 'auto',
      }}
      aria-hidden={phase === 'done'}
    >
      {/* Brand Label - Bottom Left */}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.75rem',
          textTransform: 'uppercase',
          lineHeight: 1,
          letterSpacing: '-0.01em',
          color: 'var(--foreground)',
          opacity: phase === 'fadeLabels' || phase === 'wipe' ? 0 : 1,
          transition: 'opacity 300ms ease-out',
        }}
      >
        Adarsh Singh
      </span>

      {/* Big Counter - Bottom Right */}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '7.5rem',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          color: 'var(--foreground)',
          opacity: phase === 'fadeLabels' || phase === 'wipe' ? 0 : 1,
          transition: 'opacity 300ms ease-out',
        }}
      >
        {count}
        <span style={{ color: 'var(--accent)' }}>%</span>
      </span>
    </div>
  );
}
