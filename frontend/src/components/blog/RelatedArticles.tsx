import React from 'react';
import { Link } from 'react-router-dom';
import { AI_ENGINEERING_ROADMAP } from '../../data/learningPath';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  tags?: string[];
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface RelatedArticlesProps {
  currentArticleId: string;
  category: string;
  allArticles: Article[];
  isDark: boolean;
}

export default function RelatedArticles({ currentArticleId, category, allArticles, isDark }: RelatedArticlesProps) {
  // Advanced Recommendation Logic
  // Priority: Same Path -> Shared Tags -> Same Category
  
  const currentArticle = allArticles.find(a => a.id === currentArticleId);
  const currentIndexInPath = AI_ENGINEERING_ROADMAP.findIndex(n => n.slug === currentArticleId);
  
  let recommendations: Article[] = [];
  
  // 1. Same Path (Next Article)
  if (currentIndexInPath !== -1 && currentIndexInPath < AI_ENGINEERING_ROADMAP.length - 1) {
    const nextSlug = AI_ENGINEERING_ROADMAP[currentIndexInPath + 1].slug;
    const nextArticle = allArticles.find(a => a.id === nextSlug);
    if (nextArticle) {
      recommendations.push(nextArticle);
    }
  }

  // 2. Shared Tags
  if (currentArticle?.tags) {
    const taggedArticles = allArticles
      .filter(a => a.id !== currentArticleId && !recommendations.find(r => r.id === a.id))
      .map(a => {
        const sharedTagsCount = a.tags?.filter(t => currentArticle.tags?.includes(t)).length || 0;
        return { article: a, score: sharedTagsCount };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.article);
      
    recommendations = [...recommendations, ...taggedArticles];
  }

  // 3. Same Category
  const categoryArticles = allArticles
    .filter(a => a.id !== currentArticleId && a.category === category && !recommendations.find(r => r.id === a.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
  recommendations = [...recommendations, ...categoryArticles];
  
  // 4. Fill up to 2
  if (recommendations.length < 2) {
    const recentArticles = allArticles
      .filter(a => a.id !== currentArticleId && !recommendations.find(r => r.id === a.id))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    recommendations = [...recommendations, ...recentArticles];
  }

  const finalRecommendations = recommendations.slice(0, 2);

  if (finalRecommendations.length === 0) return null;

  return (
    <div className={`mt-16 pt-10 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
      <h3 className={`text-xl font-bold mb-6 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
        Read Next
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {finalRecommendations.map((article, idx) => (
          <Link
            key={article.id}
            to={`/blog/${article.id}`}
            className={`group p-6 rounded-3xl border transition-all duration-300 ${
              isDark 
                ? 'bg-neutral-900/40 border-white/10 hover:border-white/20 hover:bg-neutral-900/80 hover:-translate-y-1' 
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {idx === 0 && currentIndexInPath !== -1 && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-[#007AFF] ${
                  isDark ? 'bg-[#007AFF]/10' : 'bg-[#007AFF]/10'
                }`}>
                  Next in Path
                </span>
              )}
              <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                {article.date}
              </div>
            </div>
            <h4 className={`text-lg font-bold mb-2 group-hover:text-[#007AFF] transition-colors ${
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
