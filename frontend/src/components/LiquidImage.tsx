import { useRef, useEffect, useId } from 'react';

interface LiquidImageProps {
  src: string;
  alt: string;
  bare?: boolean; // Hero mode - no overlays
  className?: string;
  style?: React.CSSProperties;
  hoverScale?: number;
}

export default function LiquidImage({
  src,
  alt,
  bare = false,
  className = '',
  style = {},
  hoverScale = 28,
}: LiquidImageProps) {
  const filterId = useId().replace(/:/g, '_');
  const scaleRef = useRef<SVGAnimateElement | null>(null);
  const freqRef = useRef<SVGAnimateElement | null>(null);
  const figureRef = useRef<HTMLElement>(null);
  const feScaleRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const feTurbRef = useRef<SVGFETurbulenceElement | null>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure) return;

    let current = 1;
    let target = 1;
    let freqCurrent = 0.009;
    let freqTarget = 0.009;

    function animate() {
      current += (target - current) * 0.08;
      freqCurrent += (freqTarget - freqCurrent) * 0.08;

      if (feScaleRef.current) {
        feScaleRef.current.setAttribute('scale', String(current));
      }
      if (feTurbRef.current) {
        feTurbRef.current.setAttribute('baseFrequency', String(freqCurrent));
      }
      animRef.current = requestAnimationFrame(animate);
    }

    const onEnter = () => {
      if (window.innerWidth <= 768) return;
      target = hoverScale;
      freqTarget = 0.022;
    };

    const onLeave = () => {
      target = 1;
      freqTarget = 0.009;
    };

    figure.addEventListener('mouseenter', onEnter);
    figure.addEventListener('mouseleave', onLeave);
    animRef.current = requestAnimationFrame(animate);

    return () => {
      figure.removeEventListener('mouseenter', onEnter);
      figure.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(animRef.current);
    };
  }, [hoverScale]);

  return (
    <figure
      ref={figureRef}
      role="img"
      className={`relative overflow-hidden ${className}`}
      style={{ ...style }}
    >
      {/* SVG Filter Definition */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id={filterId}>
            <feTurbulence
              ref={feTurbRef}
              type="fractalNoise"
              baseFrequency="0.009"
              numOctaves={2}
              result="noise"
            />
            <feDisplacementMap
              ref={feScaleRef}
              in="SourceGraphic"
              in2="noise"
              scale={1}
            />
          </filter>
        </defs>
      </svg>

      {/* Image with filter */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover"
        style={{ filter: `url(#${filterId})` }}
      />

      {/* Non-Bare Mode Overlays */}
      {!bare && (
        <>
          {/* Grayscale-to-color veil */}
          <div
            className="absolute inset-0 transition-opacity duration-[380ms] ease-out group-hover:opacity-0"
            style={{
              background: 'var(--background)',
              mixBlendMode: 'color',
              opacity: 0.88,
            }}
          />

          {/* Accent glow sweep */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[380ms]"
            style={{
              background: 'linear-gradient(120deg, transparent 30%, color-mix(in srgb, var(--accent) 35%, transparent) 50%, transparent 70%)',
            }}
          />

          {/* Radial vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(120% 120% at 50% 120%, color-mix(in srgb, #08080a 70%, transparent), transparent 60%)',
            }}
          />
        </>
      )}
    </figure>
  );
}
