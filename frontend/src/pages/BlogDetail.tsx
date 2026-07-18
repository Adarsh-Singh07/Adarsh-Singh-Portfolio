import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Clock, Edit } from 'lucide-react';
import { BlogNote, ProfileMode } from '../types';
import SEO from '../components/SEO';
import DetailEditModal from '../components/DetailEditModal';
import PortfolioService from '../services/api';

// New Blog Components
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
  isDark: boolean;
  onRefreshData?: () => void;
}

const staticArticles: Record<string, { title: string; excerpt: string; readTime: string; category: string; date: string; content: string; logoUrl: string; brandColor: string; tags?: string[]; difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'; lastUpdated?: string; version?: string }> = {
  "databricks-lakehouse": {
    title: "The Magic of Databricks: Building a Data Lakehouse",
    excerpt: "Imagine having the vast, bottomless storage of a data lake combined with the organized, easy-to-search structure of a data warehouse. That's the Databricks Lakehouse.",
    readTime: "8 min read",
    category: "Data Engineering",
    date: "2026-07-15",
    lastUpdated: "2026-07-17",
    version: "v1.1",
    difficulty: "Beginner",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/databricks/databricks-original.svg",
    brandColor: "#FF3621",
    tags: ["Databricks", "Data Lakehouse", "Spark", "Data Engineering"],
    content: `Imagine you're running a massive library. \n\nTraditionally, you had two choices:\n1. **The Data Lake**: A giant warehouse where people just dump books in random piles. It holds everything, but finding a specific book is a nightmare.\n2. **The Data Warehouse**: A perfectly organized bookshelf. It's easy to search, but it's incredibly expensive to maintain, and it can only hold specific types of books.\n\nWhat if you could have the unlimited storage of the warehouse pile, but the perfect organization of the bookshelf? \n\nThat's the **Databricks Lakehouse**.\n\n## How it works\nDatabricks uses a technology called Delta Lake. Think of Delta Lake as an incredibly smart librarian who stands at the door of your warehouse. \n\nEvery time you throw a massive pile of messy data (like JSON logs or CSV files) into the lake, the librarian instantly catalogs it, cleans it up, and adds "transactions." If someone tries to read the data while it's being updated, the librarian ensures they don't see a broken half-written file.\n\n## The Magic of Spark\nUnder the hood, Databricks is powered by Apache Spark. Imagine hiring 1,000 workers to read 1,000 different pages of a book at the exact same time. Spark breaks down massive data jobs into tiny pieces and processes them in parallel across a cluster of machines.\n\n> [!TIP]\n> Next time you need to process terabytes of data, don't build a fragile pipeline. Just let the Lakehouse handle it.`
  },
  "langgraph-agents": {
    title: "Teaching AI to Think in Loops with LangGraph",
    excerpt: "Standard AI bots just give one answer and stop. But what if they could double-check their own work, fix their mistakes, and think in continuous loops? Enter LangGraph.",
    readTime: "8 min read",
    category: "AI Agents",
    date: "2026-07-10",
    lastUpdated: "2026-07-18",
    version: "v1.3",
    difficulty: "Advanced",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",
    brandColor: "#3776AB",
    tags: ["LangGraph", "LLM", "AI Agents", "Python"],
    content: `Most AI systems work like a drive-thru window. You ask a question, the AI gives you an answer, and the interaction is over. \n\nBut what if you need the AI to do something complex, like write a software program, test it, and fix its own bugs? A simple drive-thru won't work. You need the AI to think in **loops**.\n\n## Enter LangGraph\nLangGraph is a framework that allows Large Language Models (LLMs) to operate in cycles. \n\nInstead of a straight line, imagine a flowchart. \n1. The **Generator** writes the code.\n2. The **Reviewer** looks at the code and runs tests.\n3. If the tests fail, the Reviewer sends it *back* to the Generator with a list of errors.\n\nThis loop continues until the code works perfectly.\n\n## Why does this matter?\nBy giving AI the ability to reflect and retry, we see a massive jump in quality. It's the difference between asking someone to write an essay in one draft without looking at it, versus letting them revise it five times. LangGraph gives your AI the power of revision.`
  },
  "rag-system": {
    title: "Giving AI a Perfect Memory: How RAG Actually Works",
    excerpt: "Ever wish your AI could instantly pull up that one specific sentence from a 500-page manual? Retrieval-Augmented Generation (RAG) is the secret filing system making it happen.",
    readTime: "10 min read",
    category: "Generative AI",
    date: "2026-07-05",
    difficulty: "Intermediate",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg",
    brandColor: "#FF6F00",
    tags: ["RAG", "Generative AI", "Vector Database", "Embeddings"],
    content: `Imagine asking an incredibly smart professor a question about a highly specific, top-secret document they have never read. No matter how smart they are, they will either guess or hallucinate an answer. \n\nThis is the problem with ChatGPT and company data.\n\n## The RAG Solution\nRetrieval-Augmented Generation (RAG) fixes this by acting as the professor's research assistant. \n\nBefore the professor (the AI) answers your question, the research assistant (the Vector Database) sprints to the filing cabinet, finds the exactly relevant paragraphs from your company's documents, and hands them to the professor.\n\n"Here, use this context to answer the question," the assistant says.\n\n## The Secret Sauce: Chunking\nYou can't just hand the AI a 500-page PDF. It will get overwhelmed. Instead, we "chunk" the document into small paragraphs. When you ask a question, the system uses mathematics (Vector Embeddings) to find the 5 most relevant paragraphs out of millions, in milliseconds.\n\nRAG doesn't just make AI smarter; it gives it a perfect, factual memory of your proprietary data.`
  },
  "interviewos": {
    title: "Building an AI Interviewer that Actually Listens",
    excerpt: "We built InterviewOS to mock-interview engineers. It had to listen in real-time, understand messy coding thoughts, and grade answers fairly. Here is the architecture behind it.",
    readTime: "9 min read",
    category: "AI Systems",
    date: "2026-06-28",
    difficulty: "Advanced",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
    brandColor: "#61DAFB",
    content: `Technical interviews are stressful, subjective, and hard to scale. We wanted to build a platform that could conduct a mock interview just like a real Senior Engineer would—listening, adapting, and evaluating in real-time.\n\n## The Challenge of Latency\nIf you've ever talked to a voice AI, you know the awkward 5-second pause before it replies. In an interview, that pause destroys the illusion.\n\nWe had to build a system that was lightning fast. As the user speaks, their audio is streamed over WebSockets directly to the backend. We transcribe the audio on the fly, feeding it to an LLM before the user even finishes their sentence.\n\n## The Panel of Judges\nInstead of using one massive AI to grade the interview, we use a panel of specialized AI judges. \n- One AI only looks at code efficiency.\n- Another AI only grades communication style.\n- A third AI ensures the candidate didn't cheat.\n\nBy breaking the problem down, InterviewOS provides a deeply accurate, unbiased feedback report that actually helps engineers improve.`
  },
  "google-cloud-run": {
    title: "Scaling Python from Zero to Hero on Cloud Run",
    excerpt: "Deploying backend servers used to mean paying for machines even when no one was using them. Cloud Run changes the game by shrinking your app to zero when idle.",
    readTime: "7 min read",
    category: "Cloud",
    date: "2026-06-18",
    difficulty: "Beginner",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg",
    brandColor: "#4285F4",
    content: `Back in the day, hosting a server meant paying for a machine to stay awake 24/7, even if no one visited your website at 3 AM. You were paying to cool down idle processors.\n\n## The Serverless Revolution\nGoogle Cloud Run flips the script. Instead of renting a permanent server, you package your code into a "Container" (a standardized box). \n\nWhen a user visits your API, Cloud Run instantly spins up a container to serve the request. \nBut here is the magic part: when the user leaves, the container disappears. It scales down to exactly **zero**.\n\n## Why it's a Game Changer\nFor portfolio projects and side businesses, this means you pay absolutely $0 when you have no traffic. \n\nBut if your app suddenly goes viral and gets a million hits? Cloud Run will automatically clone your container a thousand times to handle the load, without you lifting a finger. It's the ultimate set-it-and-forget-it deployment strategy.`
  },
  "vector-search": {
    title: "Searching by Meaning, Not Just Keywords",
    excerpt: "Traditional databases look for exact word matches. Vector databases look for 'vibes' and meanings. Here is how Pgvector and Pinecone are revolutionizing search.",
    readTime: "8 min read",
    category: "Databases",
    date: "2026-06-02",
    difficulty: "Intermediate",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
    brandColor: "#4169E1",
    content: `Traditional databases are incredibly rigid. If you search for "shoes," they will strictly look for the exact word "shoes." If a product is labeled "sneakers," the database will say, "Sorry, I have no idea what that is."\n\n## Searching by Vibes\nVector Databases (like Pgvector or Pinecone) don't look at words; they look at **meanings**. \n\nThey convert text, images, and audio into lists of numbers (Vectors). In this numerical space, the word "shoes" and "sneakers" are physically right next to each other. \n\nSo when you search for "shoes," the database finds "sneakers," "boots," and "footwear" because they share the same semantic neighborhood or "vibe."\n\n## Why it's taking over\nThis is the engine powering modern AI recommendations, image searches, and RAG pipelines. By storing meaning instead of characters, we finally have search engines that actually understand what we want.`
  },
  "fastapi-production": {
    title: "FastAPI: Making Python Fast Again",
    excerpt: "FastAPI is incredible, but putting it in production can be tricky. If you block the main thread, the whole app freezes. Here are the secrets to keeping it blazing fast.",
    readTime: "6 min read",
    category: "Backend",
    date: "2026-05-20",
    difficulty: "Intermediate",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg",
    brandColor: "#009688",
    content: `Python has a reputation for being slow. For years, web frameworks handled one request at a time. If user A asked the server to download a large file, user B had to wait in line.\n\n## The Asynchronous Hero\nFastAPI fixes this by using asynchronous programming (async/await). \n\nImagine a waiter at a restaurant. A "synchronous" waiter takes your order, walks to the kitchen, and stands there staring at the chef until your food is ready. Meanwhile, other tables are starving.\n\nAn "asynchronous" waiter takes your order, hands it to the kitchen, and immediately goes to serve the next table. When your food is ready, they bring it to you. \n\n## Production Speed\nBy freeing up the server to handle thousands of requests while waiting on databases or external APIs, FastAPI allows Python to achieve speeds comparable to NodeJS and Go. It makes Python fast again.`
  }
};

export default function BlogDetail({ blogs, currentMode = 'general', isDark, onRefreshData }: BlogDetailProps) {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Find blog in static articles or dynamic database blogs
  const staticBlog = staticArticles[blogId || ''];
  const dynamicBlog = blogs.find(b => b.id === blogId);

  const activeBlog: BlogNote | null = dynamicBlog || (staticBlog ? {
    id: blogId!,
    title: staticBlog.title,
    excerpt: staticBlog.excerpt,
    readTime: staticBlog.readTime,
    category: staticBlog.category,
    date: staticBlog.date,
    url: '#',
    content: staticBlog.content,
    tags: staticBlog.tags,
    logoUrl: staticBlog.logoUrl,
    brandColor: staticBlog.brandColor,
    priority: { general: 1, 'data-engineer': 1 }
  } : null);

  const { isFocusMode } = useReadingState();

  const token = sessionStorage.getItem('admin-token') || localStorage.getItem('admin-token');
  const isAdmin = !!token;

  if (!activeBlog) {
    return (
      <div className={`min-h-screen py-32 px-6 flex flex-col items-center justify-center text-center transition-colors duration-200 ${
        isDark ? 'bg-[#121212] text-white' : 'bg-[#FDFBF7] text-neutral-900'
      }`}>
        <span className="text-sm font-mono text-red-500 mb-2">Error 404</span>
        <h1 className="text-3xl font-bold font-sans mb-4">Article Not Found</h1>
        <p className="text-sm opacity-60 mb-6 max-w-sm">The article you are looking for does not exist or has been archived.</p>
        <Link 
          to="/blog" 
          className="px-5 py-2.5 bg-[#007AFF] hover:bg-[#007AFF]/90 text-white rounded-full flex items-center gap-2 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Blog</span>
        </Link>
      </div>
    );
  }

  React.useEffect(() => {
    if (activeBlog?.content) {
      // Parse headings directly from markdown to guarantee stability and bypass DOM rendering issues
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

  // Calculate actual reading time
  const wordCount = activeBlog.content?.trim().split(/\s+/).length || 0;
  const calculatedReadTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min read';
  const displayReadTime = activeBlog.readTime || calculatedReadTime;

  // Construct JSON-LD Schemas
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

  // Extract all articles for "Related Articles"
  const allArticlesList = Object.keys(staticArticles).map(k => ({
    id: k,
    title: staticArticles[k].title,
    excerpt: staticArticles[k].excerpt,
    date: staticArticles[k].date,
    category: staticArticles[k].category,
    tags: staticArticles[k].tags,
    difficulty: staticArticles[k].difficulty
  })).concat(blogs.map(b => ({
    id: b.id,
    title: b.title,
    excerpt: b.excerpt,
    date: b.date,
    category: b.category,
    tags: b.tags,
    difficulty: b.difficulty
  })));

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-[#121212] text-white' : 'bg-[#FDFBF7] text-neutral-900'
    }`}>
      <SEO 
        title={`${activeBlog.title} | Adarsh Singh`}
        description={activeBlog.excerpt}
        keywords={`${activeBlog.category}, Software Engineering, React, Python, Adarsh Singh`}
        canonicalUrl={`https://adarshsingh.in/blog/${activeBlog.id}`}
        schema={[breadcrumbSchema, blogPostingSchema]}
      />

      <StickyHeader article={activeBlog} isDark={isDark} />
      <ReadingMemory articleId={activeBlog.id} version={activeBlog.version} />
      <ArticleSearch isDark={isDark} allArticles={allArticlesList} />

      <div className={`pt-32 pb-24 px-6 md:px-12 max-w-[1200px] mx-auto w-full flex flex-col xl:flex-row gap-16 relative transition-all duration-500 ease-out ${isFocusMode ? 'justify-center' : ''}`}>
        {/* Main Content Area */}
        <div className={`flex-1 max-w-[820px] w-full transition-all duration-500 mx-auto ${isFocusMode ? 'xl:mx-auto' : 'xl:mx-0'}`}>
          {/* Navigation Row */}
          <div className="mb-12 flex justify-between items-center">
            <Link 
              to="/blog" 
              className={`flex items-center gap-2 text-sm font-medium cursor-pointer transition-colors ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ArrowLeft className="w-4 h-4 text-[#007AFF]" />
              <span>Blog</span>
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={() => readingStore.toggleFocusMode()}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isFocusMode 
                    ? 'bg-[#007AFF] text-white shadow-[0_0_15px_rgba(0,122,255,0.4)]' 
                    : isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
                aria-label={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                title={isFocusMode ? "Exit Focus Mode (Esc)" : "Enter Focus Mode (Shift+F)"}
              >
                {/* Maximize icon from lucide-react (we can just import it) */}
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
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center gap-1.5 text-xs font-semibold shadow-glow cursor-pointer transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* Article Header */}
          <header className="mb-16 flex flex-col items-start text-left">
            <div className="flex items-center gap-3 mb-6">
              {activeBlog.logoUrl && (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center border shadow-sm p-2"
                  style={{ 
                    backgroundColor: `${activeBlog.brandColor || '#007AFF'}15`,
                    borderColor: `${activeBlog.brandColor || '#007AFF'}25`
                  }}
                >
                  <img src={activeBlog.logoUrl} alt={activeBlog.category} className="w-full h-full object-contain" />
                </div>
              )}
              <span className="text-[#007AFF] font-mono text-sm tracking-wider font-semibold uppercase">
                {activeBlog.category}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-6 max-w-3xl">
              {activeBlog.title}
            </h1>
            
            <p className={`text-xl font-light leading-relaxed mb-8 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {activeBlog.excerpt}
            </p>

            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden border border-slate-300 dark:border-white/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">AS</span>
                  <img src="/api/v1/portfolio/assets/avatar.jpg" alt="Adarsh Singh" className="absolute inset-0 w-full h-full object-cover z-10" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
                <div className="flex flex-col text-left">
                  <span className={isDark ? 'text-white' : 'text-slate-900'}>Adarsh Singh</span>
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    <time dateTime={activeBlog.date}>{activeBlog.date}</time>
                    {activeBlog.lastUpdated && (
                      <span className="hidden sm:inline"> (Updated {activeBlog.lastUpdated})</span>
                    )}
                    <span>·</span>
                    <span>{displayReadTime}</span>
                    {activeBlog.difficulty && (
                      <>
                        <span>·</span>
                        <span className={`px-1.5 py-0.5 rounded-sm border ${
                          activeBlog.difficulty === 'Advanced' 
                            ? 'text-rose-500 border-rose-500/20 bg-rose-500/10' 
                            : activeBlog.difficulty === 'Intermediate'
                            ? 'text-amber-500 border-amber-500/20 bg-amber-500/10'
                            : 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10'
                        }`}>{activeBlog.difficulty}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Tags */}
          <TagList tags={activeBlog.tags} isDark={isDark} />

          {/* Markdown Content */}
          <MarkdownRenderer content={activeBlog.content} title={activeBlog.title} isDark={isDark} />

          {!isFocusMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ArticleFooter article={activeBlog} isDark={isDark} />
              <RelatedArticles 
                currentArticleId={activeBlog.id} 
                category={activeBlog.category} 
                allArticles={allArticlesList} 
                isDark={isDark} 
              />
            </motion.div>
          )}
        </div>

        {/* Sidebar TOC & Mobile FAB */}
        <TableOfContents isDark={isDark} />
        <MobileBottomSheet article={activeBlog} isDark={isDark} />
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
          isDark={isDark}
        />
      )}
    </div>
  );
}
