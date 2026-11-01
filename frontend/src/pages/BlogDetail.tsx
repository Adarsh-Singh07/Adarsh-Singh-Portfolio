import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Edit } from 'lucide-react';
import { BlogNote, ProfileMode } from '../types';
import SEO from '../components/SEO';
import DetailEditModal from '../components/DetailEditModal';
import PortfolioService from '../services/api';

// Blog Components
import MarkdownRenderer from '../components/blog/MarkdownRenderer';
import ArticleFooter from '../components/blog/Footer/ArticleFooter';
import RelatedArticles from '../components/blog/RelatedArticles';
import TagList from '../components/blog/TagList';

// Advanced Navigation Components
import StickyHeader from '../components/blog/Navigation/StickyHeader';
import TableOfContents from '../components/blog/Navigation/TableOfContents';
import MobileBottomSheet from '../components/blog/Navigation/MobileBottomSheet';
import ReadingMemory from '../components/blog/Navigation/ReadingMemory';
import ArticleSearch from '../components/blog/Navigation/ArticleSearch';
import { readingStore, useReadingState } from '../store/readingStore';

interface BlogDetailProps {
  blogs: BlogNote[];
  currentMode?: ProfileMode;
  isDark?: boolean;
  onRefreshData?: () => void;
}

export default function BlogDetail({ blogs, currentMode = 'general', onRefreshData }: BlogDetailProps) {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Resolve active article from backend-provided blog list
  const activeBlog: BlogNote | null = (Array.isArray(blogs) ? blogs : []).find(b => b.id === blogId) || null;
  const { isFocusMode } = useReadingState();

  const token = sessionStorage.getItem('admin-token') || localStorage.getItem('admin-token');
  const isAdmin = !!token;

  if (!activeBlog) {
    return (
      <div
        className="min-h-screen py-32 px-6 flex flex-col items-center justify-center text-center"
        style={{
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
        }}
      >
        <span className="text-sm font-mono text-[#ff3b1d] mb-2 uppercase tracking-widest">Error 404</span>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '3rem',
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
          }}
          className="mb-4"
        >
          Article Not Found
        </h1>
        <p className="text-sm mb-6 max-w-sm" style={{ color: 'var(--muted)' }}>
          The article you are looking for does not exist or has been archived.
        </p>
        <Link 
          to="/blog" 
          className="px-6 py-3 rounded-full flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#08080a',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Blog</span>
        </Link>
      </div>
    );
  }

  React.useEffect(() => {
    if (activeBlog?.content) {
      const extractHeadings = (markdown: string) => {
        const extracted: any[] = [];
        const lines = markdown.split('\n');
        let inCodeBlock = false;
        const slugCounts = new Map<string, number>();

        for (const line of lines) {
          if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
          }
          if (!inCodeBlock) {
            const match = line.match(/^(#{2,3})\s+(.+)$/);
            if (match) {
              const level = match[1].length;
              let text = match[2].trim();
              text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
              text = text.replace(/[*_~`]/g, '');
              text = text.replace(/<[^>]+>/g, '');
              
              let id = text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
              
              if (slugCounts.has(id)) {
                const count = slugCounts.get(id)! + 1;
                slugCounts.set(id, count);
                id = `${id}-${count}`;
              } else {
                slugCounts.set(id, 0);
              }
              
              if (text) extracted.push({ id, text, level });
            }
          }
        }
        return extracted;
      };

      const tocHeadings = extractHeadings(activeBlog.content || '');
      readingStore.initialize(tocHeadings, activeBlog.content || '');
      
      const onScroll = () => readingStore.handleScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'f' && e.shiftKey) {
          e.preventDefault();
          readingStore.toggleFocusMode();
        } else if (e.key === 'Escape') {
          readingStore.setFocusMode(false);
        }
      };
      window.addEventListener('keydown', onKeyDown);
      
      return () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('keydown', onKeyDown);
        readingStore.cleanup();
      };
    }
  }, [activeBlog]);

  const handleSave = async (updatedBlog: BlogNote) => {
    if (!token) return;
    try {
      const fullConfig = await PortfolioService.getAdminConfig(token);
      const activeProfile = fullConfig[currentMode];
      if (!activeProfile) return;

      if (!activeProfile.blogs) {
        activeProfile.blogs = [];
      }

      const existingIndex = activeProfile.blogs.findIndex(b => b.id === updatedBlog.id);
      if (existingIndex >= 0) {
        activeProfile.blogs[existingIndex] = updatedBlog;
      } else {
        activeProfile.blogs.push(updatedBlog);
      }

      await PortfolioService.saveAdminConfig(token, fullConfig);
      setIsModalOpen(false);
      if (onRefreshData) onRefreshData();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error('Failed to save blog:', err);
      alert('Failed to save blog data.');
    }
  };

  const handleDelete = async (targetId: string) => {
    if (!token) return;
    try {
      const fullConfig = await PortfolioService.getAdminConfig(token);
      const activeProfile = fullConfig[currentMode];
      if (!activeProfile || !activeProfile.blogs) return;

      activeProfile.blogs = activeProfile.blogs.filter(b => b.id !== targetId);
      await PortfolioService.saveAdminConfig(token, fullConfig);
      setIsModalOpen(false);
      if (onRefreshData) onRefreshData();
      navigate('/blog');
    } catch (err) {
      console.error('Failed to delete blog:', err);
      alert('Failed to delete blog.');
    }
  };

  const wordCount = activeBlog.content?.trim().split(/\s+/).length || 0;
  const calculatedReadTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min read';
  const displayReadTime = activeBlog.readTime || calculatedReadTime;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://adarshsingh.in" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://adarshsingh.in/blog" },
      { "@type": "ListItem", "position": 3, "name": activeBlog.title, "item": `https://adarshsingh.in/blog/${activeBlog.id}` }
    ]
  };

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": activeBlog.title,
    "description": activeBlog.excerpt,
    "datePublished": activeBlog.date,
    "mainEntityOfPage": `https://adarshsingh.in/blog/${activeBlog.id}`,
    "author": {
      "@type": "Person",
      "name": "Adarsh Singh",
      "url": "https://adarshsingh.in"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Adarsh Singh",
      "logo": {
        "@type": "ImageObject",
        "url": "https://adarshsingh.in/og-image.png"
      }
    }
  };

  const safeBlogs = Array.isArray(blogs) ? blogs : [];
  const allArticlesList = safeBlogs.map(b => ({
    id: b.id, title: b.title, excerpt: b.excerpt, date: b.date, category: b.category, tags: b.tags, difficulty: b.difficulty
  }));

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
      <SEO 
        title={`${activeBlog.title} | Adarsh Singh`}
        description={activeBlog.excerpt}
        keywords={`${activeBlog.category}, Software Engineering, React, Python, Adarsh Singh`}
        canonicalUrl={`https://adarshsingh.in/blog/${activeBlog.id}`}
        schema={[breadcrumbSchema, blogPostingSchema]}
      />

      <StickyHeader article={activeBlog} isDark={true} />
      <ReadingMemory articleId={activeBlog.id} version={activeBlog.version} />
      <ArticleSearch isDark={true} allArticles={allArticlesList} />

      <div
        className={`pt-32 pb-24 max-w-[1200px] mx-auto w-full flex flex-col xl:flex-row gap-16 relative transition-all duration-500 ease-out ${
          isFocusMode ? 'justify-center' : ''
        }`}
        style={{
          paddingLeft: 'var(--gutter)',
          paddingRight: 'var(--gutter)',
        }}
      >
        {/* Main Content Area */}
        <div className={`flex-1 max-w-[820px] w-full transition-all duration-500 mx-auto ${isFocusMode ? 'xl:mx-auto' : 'xl:mx-0'}`}>
          {/* Navigation Row */}
          <div className="mb-12 flex justify-between items-center">
            <Link 
              to="/blog" 
              className="flex items-center gap-2 text-sm font-medium cursor-pointer transition-colors"
              style={{ color: 'var(--muted)' }}
            >
              <ArrowLeft className="w-4 h-4 text-[#ff3b1d]" />
              <span>Back to Articles</span>
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={() => readingStore.toggleFocusMode()}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer"
                style={{
                  backgroundColor: isFocusMode ? 'var(--accent)' : 'var(--surface)',
                  color: isFocusMode ? '#08080a' : 'var(--foreground)',
                  border: '1px solid var(--line)',
                }}
                aria-label={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                title={isFocusMode ? "Exit Focus Mode (Esc)" : "Enter Focus Mode (Shift+F)"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {isFocusMode ? (
                    <>
                      <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                      <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                      <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                      <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                    </>
                  ) : (
                    <>
                      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                    </>
                  )}
                </svg>
                <span>{isFocusMode ? "Exit Focus" : "Focus Mode"}</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-full flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#08080a',
                  }}
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* Article Header */}
          <header className="mb-14 flex flex-col items-start text-left">
            <div className="eyebrow mb-4">
              <span className="eyebrow-dot" />
              <span>{activeBlog.category}</span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
                lineHeight: 0.95,
              }}
              className="mb-6 max-w-3xl"
            >
              {activeBlog.title}
            </h1>
            
            <p
              style={{
                color: 'var(--muted)',
                fontSize: '1.25rem',
                lineHeight: 1.5,
              }}
              className="mb-8 max-w-2xl"
            >
              {activeBlog.excerpt}
            </p>

            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-3">
                <div
                  className="relative w-10 h-10 rounded-full overflow-hidden border flex items-center justify-center"
                  style={{
                    borderColor: 'var(--line)',
                    backgroundColor: 'var(--surface-2)',
                  }}
                >
                  <span className="text-xs font-bold text-neutral-400">AS</span>
                  <img
                    src="/assets/hero/adarsh-avatar.png"
                    alt="Adarsh Singh"
                    className="absolute inset-0 w-full h-full object-cover z-10"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span style={{ color: 'var(--foreground)' }}>Adarsh Singh</span>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                    <time dateTime={activeBlog.date}>{activeBlog.date}</time>
                    {activeBlog.lastUpdated && (
                      <span className="hidden sm:inline"> (Updated {activeBlog.lastUpdated})</span>
                    )}
                    <span>·</span>
                    <span>{displayReadTime}</span>
                    {activeBlog.difficulty && (
                      <>
                        <span>·</span>
                        <span
                          className="px-2 py-0.5 rounded-full border text-[10px] font-mono"
                          style={{
                            color: 'var(--accent)',
                            borderColor: 'rgba(255, 59, 29, 0.3)',
                            backgroundColor: 'rgba(255, 59, 29, 0.08)',
                          }}
                        >
                          {activeBlog.difficulty}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Tags */}
          <TagList tags={activeBlog.tags} isDark={true} />

          {/* Markdown Content */}
          <MarkdownRenderer content={activeBlog.content} title={activeBlog.title} isDark={true} />

          {!isFocusMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ArticleFooter article={activeBlog} isDark={true} />
              <RelatedArticles 
                currentArticleId={activeBlog.id} 
                category={activeBlog.category} 
                allArticles={allArticlesList} 
                isDark={true} 
              />
            </motion.div>
          )}
        </div>

        {/* Sidebar TOC & Mobile FAB */}
        <TableOfContents isDark={true} />
        <MobileBottomSheet article={activeBlog} isDark={true} />
      </div>

      {isAdmin && (
        <DetailEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          onDelete={handleDelete}
          item={activeBlog}
          type="blog"
          isAdmin={isAdmin}
          isDark={true}
        />
      )}
    </div>
  );
}
