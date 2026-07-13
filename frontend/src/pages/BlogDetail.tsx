import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, BookOpen, User, Edit } from 'lucide-react';
import { BlogNote, ProfileMode } from '../types';
import SEO from '../components/SEO';
import DetailEditModal from '../components/DetailEditModal';
import PortfolioService from '../services/api';

interface BlogDetailProps {
  blogs: BlogNote[];
  currentMode?: ProfileMode;
  isDark: boolean;
  onRefreshData?: () => void;
}

// Predefined high-quality articles mapping to requested SEO slugs
const staticArticles: Record<string, { title: string; excerpt: string; readTime: string; category: string; date: string; content: string }> = {
  "langgraph-agents": {
    title: "Orchestrating Multi-Agent Workflows with LangGraph",
    excerpt: "Learn how to build cyclical, stateful agent systems using LangGraph to handle complex, multi-step tasks in production environments.",
    readTime: "8 min read",
    category: "AI Agents",
    date: "2026-07-10",
    content: `Building autonomous systems with Large Language Models (LLMs) requires structured orchestrations. While simple linear chains are suitable for basic tasks, real-world engineering often demands loops, branching logic, and state preservation. This is where LangGraph shines.

### 1. The Core Architecture: State and Graphs
Unlike typical DAG (Directed Acyclic Graph) models, LangGraph introduces cycles into LLM chains. It organizes applications as state machines defined by:
- **State:** A shared database or key-value object containing the conversation history, parsed metrics, and agent tasks.
- **Nodes:** Individual execution steps (often containing LLM prompts, tool invocations, or data processing scripts).
- **Edges:** Decision paths routing nodes based on conditions.

### 2. Implementation Strategy
By defining a graph where agents evaluate outputs and route feedback loops back to parent nodes, developers can build robust error correction systems. For example, if a code-generation node outputs invalid Python script, a validation node can catch the error and route it back to the generator with the exception logs for corrections.

This cycle continues autonomously until all compile checks pass, significantly increasing task completion rates compared to zero-shot models.`
  },
  "rag-system": {
    title: "Production-Grade Retrieval-Augmented Generation (RAG)",
    excerpt: "A deep dive into building highly accurate, low-latency RAG systems using advanced chunking, hybrid search, and LLM reranking.",
    readTime: "10 min read",
    category: "Generative AI",
    date: "2026-07-05",
    content: `Retrieval-Augmented Generation (RAG) is the industry standard for grounding LLMs in proprietary context. However, scaling RAG to production requires more than simply calling vector embeddings.

### 1. Advanced Chunking and Pre-processing
Simple sliding window chunking often fragment sentences, breaking semantic linkages. Production RAG pipelines require semantic chunking based on header hierarchies or sentence boundaries, alongside metadata tagging (author, project, page) to improve query alignment.

### 2. Hybrid Retrieval & Reranking
Combining vector search (dense embeddings) with keyword search (BM25 sparse tokens) yields the highest recall scores. Once the top 50 documents are fetched:
- **Reranker Models:** Use cross-encoder models to evaluate the exact similarity between the user prompt and context chunks.
- **Top K Selection:** Limit context injection to the top 5-10 reranked chunks, lowering processing overhead and avoiding context dilution.

This hybrid approach ensures high precision and response reliability under scale.`
  },
  "interviewos": {
    title: "Case Study: Engineering InterviewOS Platform",
    excerpt: "An architectural review of InterviewOS, a mock interviewing system utilizing LLM evaluators and real-time audio streams.",
    readTime: "9 min read",
    category: "AI Systems",
    date: "2026-06-28",
    content: `InterviewOS was engineered to automate technical mock interviewing. The core challenge was achieving low-latency voice-to-voice loops while maintaining high evaluation accuracy.

### 1. The Real-time Audio Loop
The system utilizes WebSockets for duplex audio transmission between the browser client and a FastAPI backend. Incoming audio bytes are parsed on the fly, routed to automatic speech recognition (ASR) engines, and processed by LLM dialogue modules.

### 2. LLM Judge Orchestration
To grade the candidate's responses accurately, InterviewOS uses a panel of distinct LLM evaluators specialized in code complexity, architectural patterns, and communication skills. These individual grades are aggregated via consensus algorithms to generate a balanced feedback report, ensuring fair scoring.`
  },
  "google-cloud-run": {
    title: "Zero to Hero: Deploying FastAPI on Google Cloud Run",
    excerpt: "A technical guide to containerizing FastAPI applications, configuring CPU bounds, and deploying securely on Google Cloud Run.",
    readTime: "7 min read",
    category: "Cloud",
    date: "2026-06-18",
    content: `Google Cloud Run is an excellent choice for hosting containerized python backends. Since it scales down to zero instances when idle, it is highly cost-effective for portfolio APIs and microservices.

### 1. Dockerfile Optimization
FastAPI requires light container footprints to boot quickly during scaling spikes. Using multi-stage builds and base images like \`python:3.11-slim\` reduces image sizes from 1GB to under 150MB, minimizing cold start delays.

### 2. Production Settings
When launching in Cloud Run, ensure:
- **Uvicorn Workers:** Use a single worker per container, allowing Cloud Run's native autoscaler to manage concurrent requests.
- **CPU Allocation:** Keep CPU allocated only during request processing to lower hosting fees, or enable CPU boost for faster initial container startups.`
  },
  "vector-search": {
    title: "High-Dimensional Vector Databases & Semantic Search",
    excerpt: "Comparing performance metrics, recall rates, and index types across Pinecone, Pgvector, and Weaviate databases.",
    readTime: "8 min read",
    category: "Databases",
    date: "2026-06-02",
    content: `Vector databases are critical components of semantic search applications. Choosing the right database depends on scale, index preferences, and budget constraints.

### 1. Pgvector vs Dedicated Vector DBs
For existing relational workloads, Pgvector (running on PostgreSQL) is highly convenient. It allows querying structured metadata and high-dimensional embeddings in a single SQL statement. However, for datasets containing millions of embeddings, dedicated databases like Pinecone or Weaviate are optimized for fast indexing.

### 2. Index Types: HNSW vs IVF
- **HNSW (Hierarchical Navigable Small World):** Builds multi-layer graphs. Offers the highest query speeds and recall rates, but requires significant memory.
- **IVF (Inverted File Index):** Clusters vectors to limit query spaces. Requires less memory but can suffer from slightly lower recall rates.`
  },
  "fastapi-production": {
    title: "Asynchronous Python: FastAPI Production Guide",
    excerpt: "Best practices for structural logging, connection pooling, exception handling, and production uvicorn configurations.",
    readTime: "6 min read",
    category: "Backend",
    date: "2026-05-20",
    content: `FastAPI is incredibly fast due to its asynchronous nature. However, writing async Python in production requires careful handling of blocking operations.

### 1. Asynchronous Database Clients
Never run synchronous query clients (like default SQLAlchemy) inside async routes. This blocks the main event loop, causing requests to queue up. Instead, use async drivers like \`asyncpg\` and database pools to handle concurrent transactions.

### 2. Structured Middleware
Always configure JSON logging formatting. In production, logs should be structured (e.g. key-value JSON strings) to allow centralized collectors (like Google Cloud Logging or Datadog) to index and query trace IDs easily during debugging.`
  },
  "vercel-vs-firebase": {
    title: "Firebase Hosting vs Vercel Edge for React Deployments",
    excerpt: "Comparing routing rewrite configurations, caching structures, CDN distributions, and build speeds on Vercel and Firebase.",
    readTime: "7 min read",
    category: "Frontend",
    date: "2026-05-12",
    content: `Deploying React single-page applications requires reliable path routing fallbacks. Both Firebase and Vercel are top-tier platforms, but they excel in different areas.

### 1. Vercel: Developer Experience and Edge Power
Vercel is optimized for seamless deployment workflows. Its edge middleware allows running logic closer to the user, and its routing system handles clean redirects and serverless rewrites out of the box.

### 2. Firebase: Cost and Ecosystem Integration
Firebase Hosting is extremely budget-friendly and integrates directly with Google Cloud services. If your app already relies on Firebase Auth, Firestore, or Cloud Functions, hosting on Firebase keeps all security tokens and environments under a single configuration.`
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
    priority: { general: 1, 'data-engineer': 1 }
  } : null);

  const token = sessionStorage.getItem('admin-token') || localStorage.getItem('admin-token');
  const isAdmin = !!token;

  if (!activeBlog) {
    return (
      <div className={`min-h-screen py-32 px-6 flex flex-col items-center justify-center text-center transition-colors duration-1000 ${
        isDark ? 'bg-[#050505] text-white' : 'bg-slate-50 text-neutral-900'
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

  // Construct BlogPosting JSON-LD Schema for rich search snippet indexing
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": activeBlog.title,
    "description": activeBlog.excerpt,
    "datePublished": activeBlog.date,
    "mainEntityOfPage": `https://adarshsingh.in/blog/${activeBlog.id}`,
    "author": {
      "@type": "Person",
      "name": "Adarsh Singh"
    },
    "publisher": {
      "@type": "Person",
      "name": "Adarsh Singh"
    }
  };

  return (
    <div className={`min-h-screen py-24 px-6 md:px-12 transition-colors duration-1000 ${
      isDark ? 'bg-[#050505] text-white' : 'bg-slate-50 text-neutral-900'
    }`}>
      <SEO 
        title={`${activeBlog.title} | Adarsh Singh Blog`}
        description={activeBlog.excerpt}
        keywords={`${activeBlog.category}, Technical Blog, Engineering Articles, Adarsh Singh`}
        canonicalUrl={`https://adarshsingh.in/blog/${activeBlog.id}`}
        schema={blogPostingSchema}
      />

      <div className="max-w-3xl mx-auto w-full">
        {/* Navigation Row */}
        <div className="mb-12 flex justify-between items-center">
          <Link 
            to="/blog" 
            className={`flex items-center gap-2 text-xs font-semibold cursor-pointer transition-colors ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-655 hover:text-neutral-950'
            }`}
          >
            <ArrowLeft className="w-4 h-4 text-[#007AFF]" />
            <span>Back to Engineering Blog</span>
          </Link>

          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center gap-1.5 text-xs font-semibold shadow-glow cursor-pointer transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Article</span>
            </button>
          )}
        </div>

        {/* Article Meta */}
        <div className="text-left mb-8 border-b border-white/5 pb-8">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono mb-4 opacity-70">
            <span className="text-[#007AFF] uppercase font-bold tracking-wider">{activeBlog.category}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{activeBlog.date}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{activeBlog.readTime}</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-sans font-bold tracking-tight leading-tight mb-4">
            {activeBlog.title}
          </h1>

          <p className={`text-base md:text-lg font-light leading-relaxed italic ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {activeBlog.excerpt}
          </p>
        </div>

        {/* Article Content Area */}
        <article className={`text-left prose prose-invert max-w-none text-xs md:text-sm font-light leading-relaxed whitespace-pre-line ${
          isDark ? 'text-slate-300' : 'text-slate-750'
        }`}>
          {activeBlog.content || `### Article Overview
          No detailed content has been compiled for this article yet. Log in to the administrator portal to draft and publish details.`}
        </article>
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
