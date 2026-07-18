import React from 'react';
import { Link } from 'react-router-dom';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
}

interface RelatedArticlesProps {
  currentArticleId: string;
  category: string;
  allArticles: Article[];
  isDark: boolean;
}

export default function RelatedArticles({ currentArticleId, category, allArticles, isDark }: RelatedArticlesProps) {
  const related = allArticles
    .filter((a) => a.id !== currentArticleId && a.category === category)
    .slice(0, 2);

  if (related.length === 0) return null;

  return (
    <div className={`mt-16 pt-10 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
      <h3 className={`text-xl font-bold mb-6 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
        More in {category}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {related.map((article) => (
          <Link
            key={article.id}
            to={`/blog/${article.id}`}
            className={`group p-5 rounded-2xl border transition-all duration-300 ${
              isDark 
                ? 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10' 
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50'
            }`}
          >
            <div className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {article.date}
            </div>
            <h4 className={`text-lg font-semibold mb-2 group-hover:text-[#007AFF] transition-colors ${
              isDark ? 'text-slate-200' : 'text-slate-800'
            }`}>
              {article.title}
            </h4>
            <p className={`text-sm line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {article.excerpt}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
