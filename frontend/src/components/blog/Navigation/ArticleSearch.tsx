import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Hash, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReadingState } from '../../../store/readingStore';

interface ArticleSearchProps {
  isDark: boolean;
  allArticles?: { id: string; title: string; category: string }[];
}

export default function ArticleSearch({ isDark, allArticles = [] }: ArticleSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { headings } = useReadingState();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Filter headings
  const matchedHeadings = headings.filter(h => 
    h.text.toLowerCase().includes(query.toLowerCase())
  );

  // Filter other articles
  const matchedArticles = allArticles.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase()) || 
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101] p-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            <div className={`rounded-2xl shadow-2xl overflow-hidden border ${
              isDark ? 'bg-neutral-900 border-white/10 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-200/50'
            }`}>
              <div className="flex items-center px-4 py-4 border-b border-inherit">
                <Search className={`w-5 h-5 mr-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search headings or articles..."
                  className="flex-1 bg-transparent border-none outline-none text-lg font-medium placeholder:text-slate-400"
                />
                <div className={`text-xs px-2 py-1 rounded font-mono ${
                  isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'
                }`}>ESC</div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {query.length > 0 ? (
                  <>
                    {matchedHeadings.length > 0 && (
                      <div className="mb-4">
                        <div className={`px-3 pt-2 pb-1 text-xs font-bold uppercase tracking-wider ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          In this article
                        </div>
                        {matchedHeadings.map(h => (
                          <button
                            key={h.id}
                            onClick={() => {
                              document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                              setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                              isDark ? 'hover:bg-white/5' : 'hover:bg-[#FDFBF7]'
                            }`}
                          >
                            <Hash className="w-4 h-4 text-[#007AFF] opacity-70" />
                            <span className="font-medium text-sm">{h.text}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {matchedArticles.length > 0 && (
                      <div>
                        <div className={`px-3 pt-2 pb-1 text-xs font-bold uppercase tracking-wider ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          Other Articles
                        </div>
                        {matchedArticles.map(a => (
                          <button
                            key={a.id}
                            onClick={() => {
                              navigate(`/blog/${a.id}`);
                              setIsOpen(false);
                            }}
                            className={`w-full flex flex-col items-start px-3 py-3 rounded-xl text-left transition-colors ${
                              isDark ? 'hover:bg-white/5' : 'hover:bg-[#FDFBF7]'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-3.5 h-3.5 text-emerald-500 opacity-70" />
                              <span className="font-medium text-sm">{a.title}</span>
                            </div>
                            <span className={`text-xs pl-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {a.category}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {matchedHeadings.length === 0 && matchedArticles.length === 0 && (
                      <div className={`py-12 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        No results found for "{query}"
                      </div>
                    )}
                  </>
                ) : (
                  <div className={`py-8 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Type to start searching...
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
