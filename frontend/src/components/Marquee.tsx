const WORDS = [
  'Ship Production AI',
  'Architect For Scale',
  'Autonomous Agents',
  'Data To Decisions',
  'Build The Future',
];

export default function Marquee() {
  // Double the track for seamless loop
  const track = [...WORDS, ...WORDS];

  return (
    <section
      aria-label="Operating principles"
      className="overflow-hidden"
      style={{
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
        padding: '2rem 0',
      }}
    >
      <div
        className="marquee-track flex items-center whitespace-nowrap"
        style={{ animation: 'marquee 22s linear infinite' }}
      >
        {track.map((word, i) => (
          <span key={i} className="flex items-center">
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '3.25rem',
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
                color: 'var(--foreground)',
              }}
            >
              {word}
            </span>
            <span
              className="inline-block mx-[2rem] shrink-0"
              style={{
                width: '0.625rem',
                height: '0.625rem',
                borderRadius: '9999px',
                background: 'var(--accent)',
              }}
            />
          </span>
        ))}
      </div>
    </section>
  );
}
