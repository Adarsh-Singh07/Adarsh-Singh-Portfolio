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
      { rootMargin: '0px 0px -80% 0px' }
    );

    const elements = document.querySelectorAll('.prose h2, .prose h3');
    elements.forEach((elem) => observer.observe(elem));

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="hidden xl:block w-64 shrink-0">
      <div className="sticky top-32 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          On this page
        </h4>
        <nav className="flex flex-col gap-2.5 relative before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={`text-sm transition-colors duration-200 relative pl-4 ${
                heading.level === 3 ? 'ml-3' : ''
              } ${
                activeId === heading.id
                  ? isDark ? 'text-white font-medium' : 'text-slate-900 font-medium'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {activeId === heading.id && (
                <span className="absolute left-[-1px] top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#007AFF] rounded-full" />
              )}
              {heading.text}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
