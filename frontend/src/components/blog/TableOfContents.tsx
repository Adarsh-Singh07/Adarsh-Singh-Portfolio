import React, { useEffect, useState } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  isDark: boolean;
}

export default function TableOfContents({ isDark }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Wait a short delay for markdown to render
    const timeout = setTimeout(() => {
      const elements = Array.from(document.querySelectorAll('.prose h2, .prose h3'));
      const items: TOCItem[] = elements.map((elem) => ({
        id: elem.id,
        text: elem.textContent || '',
        level: Number(elem.tagName.substring(1)),
      }));
      setHeadings(items);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-10% 0px -70% 0px' }
    );

    const elements = document.querySelectorAll('.prose h2, .prose h3');
    elements.forEach((elem) => observer.observe(elem));

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="hidden xl:block w-64 shrink-0">
      <div className="sticky top-32 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-4">
        <h4 className={`text-xs font-bold uppercase tracking-wider mb-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          On this page
        </h4>
        <nav className="flex flex-col gap-3 relative before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                setActiveId(heading.id);
              }}
              className={`text-sm transition-all duration-300 relative pl-4 block line-clamp-2 ${
                heading.level === 3 ? 'ml-3 text-[13px]' : ''
              } ${
                activeId === heading.id
                  ? isDark ? 'text-[#007AFF] font-medium' : 'text-[#007AFF] font-medium'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {activeId === heading.id && (
                <span className="absolute left-[-1px] top-0 bottom-0 w-0.5 bg-[#007AFF] rounded-full shadow-[0_0_8px_rgba(0,122,255,0.4)]" />
              )}
              {heading.text}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
