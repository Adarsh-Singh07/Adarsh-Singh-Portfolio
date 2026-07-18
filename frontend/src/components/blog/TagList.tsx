import React from 'react';

interface TagListProps {
  tags?: string[];
  isDark: boolean;
}

export default function TagList({ tags, isDark }: TagListProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 my-8">
      {tags.map((tag, i) => (
        <span 
          key={i} 
          className="px-3 py-1.5 rounded-lg text-sm font-semibold tracking-wide border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-none"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
