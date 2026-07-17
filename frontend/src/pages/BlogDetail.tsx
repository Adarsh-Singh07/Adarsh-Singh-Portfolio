import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, BookOpen, User, Edit } from 'lucide-react';
import { BlogNote, ProfileMode } from '../types';
import SEO from '../components/SEO';
import DetailEditModal from '../components/DetailEditModal';
import PortfolioService from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BlogDetailProps {
  blogs: BlogNote[];
  currentMode?: ProfileMode;
  isDark: boolean;
  onRefreshData?: () => void;
}

// Predefined high-quality articles mapping to requested SEO slugs
const staticArticles: Record<string, { title: string; excerpt: string; readTime: string; category: string; date: string; content: string; logoUrl: string; brandColor: string }> = {
  "databricks-lakehouse": {
    title: "The Magic of Databricks: Building a Data Lakehouse",
    excerpt: "Imagine having the vast, bottomless storage of a data lake combined with the organized, easy-to-search structure of a data warehouse. That's the Databricks Lakehouse.",
    readTime: "8 min read",
    category: "Data Engineering",
    date: "2026-07-15",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/databricks/databricks-original.svg",
    brandColor: "#FF3621",
    content: `Imagine you're running a massive library. 
Traditionally, you had two choices:
1. **The Data Lake**: A giant warehouse where people just dump books in random piles. It holds everything, but finding a specific book is a nightmare.
2. **The Data Warehouse**: A perfectly organized bookshelf. It's easy to search, but it's incredibly expensive to maintain, and it can only hold specific types of books.

What if you could have the unlimited storage of the warehouse pile, but the perfect organization of the bookshelf? 

That's the **Databricks Lakehouse**.

### How it works
Databricks uses a technology called Delta Lake. Think of Delta Lake as an incredibly smart librarian who stands at the door of your warehouse. 

Every time you throw a massive pile of messy data (like JSON logs or CSV files) into the lake, the librarian instantly catalogs it, cleans it up, and adds "transactions." If someone tries to read the data while it's being updated, the librarian ensures they don't see a broken half-written file.

### The Magic of Spark
Under the hood, Databricks is powered by Apache Spark. Imagine hiring 1,000 workers to read 1,000 different pages of a book at the exact same time. Spark breaks down massive data jobs into tiny pieces and processes them in parallel across a cluster of machines.

Next time you need to process terabytes of data, don't build a fragile pipeline. Just let the Lakehouse handle it.`
  },
  "langgraph-agents": {
    title: "Teaching AI to Think in Loops with LangGraph",
    excerpt: "Standard AI bots just give one answer and stop. But what if they could double-check their own work, fix their mistakes, and think in continuous loops? Enter LangGraph.",
    readTime: "8 min read",
    category: "AI Agents",
    date: "2026-07-10",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",
    brandColor: "#3776AB",
    content: `Most AI systems work like a drive-thru window. You ask a question, the AI gives you an answer, and the interaction is over. 

But what if you need the AI to do something complex, like write a software program, test it, and fix its own bugs? A simple drive-thru won't work. You need the AI to think in **loops**.

### Enter LangGraph
LangGraph is a framework that allows Large Language Models (LLMs) to operate in cycles. 

Instead of a straight line, imagine a flowchart. 
1. The **Generator** writes the code.
2. The **Reviewer** looks at the code and runs tests.
3. If the tests fail, the Reviewer sends it *back* to the Generator with a list of errors.

This loop continues until the code works perfectly.

### Why does this matter?
By giving AI the ability to reflect and retry, we see a massive jump in quality. It's the difference between asking someone to write an essay in one draft without looking at it, versus letting them revise it five times. LangGraph gives your AI the power of revision.`
  },
  "rag-system": {
    title: "Giving AI a Perfect Memory: How RAG Actually Works",
    excerpt: "Ever wish your AI could instantly pull up that one specific sentence from a 500-page manual? Retrieval-Augmented Generation (RAG) is the secret filing system making it happen.",
    readTime: "10 min read",
    category: "Generative AI",
    date: "2026-07-05",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg",
    brandColor: "#FF6F00",
    content: `Imagine asking an incredibly smart professor a question about a highly specific, top-secret document they have never read. No matter how smart they are, they will either guess or hallucinate an answer. 

This is the problem with ChatGPT and company data.

### The RAG Solution
Retrieval-Augmented Generation (RAG) fixes this by acting as the professor's research assistant. 

Before the professor (the AI) answers your question, the research assistant (the Vector Database) sprints to the filing cabinet, finds the exactly relevant paragraphs from your company's documents, and hands them to the professor.

"Here, use this context to answer the question," the assistant says.

### The Secret Sauce: Chunking
You can't just hand the AI a 500-page PDF. It will get overwhelmed. Instead, we "chunk" the document into small paragraphs. When you ask a question, the system uses mathematics (Vector Embeddings) to find the 5 most relevant paragraphs out of millions, in milliseconds.

RAG doesn't just make AI smarter; it gives it a perfect, factual memory of your proprietary data.`
  },
  "interviewos": {
    title: "Building an AI Interviewer that Actually Listens",
    excerpt: "We built InterviewOS to mock-interview engineers. It had to listen in real-time, understand messy coding thoughts, and grade answers fairly. Here is the architecture behind it.",
    readTime: "9 min read",
    category: "AI Systems",
    date: "2026-06-28",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
    brandColor: "#61DAFB",
    content: `Technical interviews are stressful, subjective, and hard to scale. We wanted to build a platform that could conduct a mock interview just like a real Senior Engineer would—listening, adapting, and evaluating in real-time.

### The Challenge of Latency
If you've ever talked to a voice AI, you know the awkward 5-second pause before it replies. In an interview, that pause destroys the illusion.

We had to build a system that was lightning fast. As the user speaks, their audio is streamed over WebSockets directly to the backend. We transcribe the audio on the fly, feeding it to an LLM before the user even finishes their sentence.

### The Panel of Judges
Instead of using one massive AI to grade the interview, we use a panel of specialized AI judges. 
- One AI only looks at code efficiency.
- Another AI only grades communication style.
- A third AI ensures the candidate didn't cheat.

By breaking the problem down, InterviewOS provides a deeply accurate, unbiased feedback report that actually helps engineers improve.`
  },
  "google-cloud-run": {
    title: "Scaling Python from Zero to Hero on Cloud Run",
    excerpt: "Deploying backend servers used to mean paying for machines even when no one was using them. Cloud Run changes the game by shrinking your app to zero when idle.",
    readTime: "7 min read",
    category: "Cloud",
    date: "2026-06-18",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg",
    brandColor: "#4285F4",
    content: `Back in the day, hosting a server meant paying for a machine to stay awake 24/7, even if no one visited your website at 3 AM. You were paying to cool down idle processors.

### The Serverless Revolution
Google Cloud Run flips the script. Instead of renting a permanent server, you package your code into a "Container" (a standardized box). 

When a user visits your API, Cloud Run instantly spins up a container to serve the request. 
But here is the magic part: when the user leaves, the container disappears. It scales down to exactly **zero**.

### Why it's a Game Changer
For portfolio projects and side businesses, this means you pay absolutely $0 when you have no traffic. 

But if your app suddenly goes viral and gets a million hits? Cloud Run will automatically clone your container a thousand times to handle the load, without you lifting a finger. It's the ultimate set-it-and-forget-it deployment strategy.`
  },
  "vector-search": {
    title: "Searching by Meaning, Not Just Keywords",
    excerpt: "Traditional databases look for exact word matches. Vector databases look for 'vibes' and meanings. Here is how Pgvector and Pinecone are revolutionizing search.",
    readTime: "8 min read",
    category: "Databases",
    date: "2026-06-02",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
    brandColor: "#4169E1",
    content: `Traditional databases are incredibly rigid. If you search for "shoes," they will strictly look for the exact word "shoes." If a product is labeled "sneakers," the database will say, "Sorry, I have no idea what that is."

### Searching by Vibes
Vector Databases (like Pgvector or Pinecone) don't look at words; they look at **meanings**. 

They convert text, images, and audio into lists of numbers (Vectors). In this numerical space, the word "shoes" and "sneakers" are physically right next to each other. 

So when you search for "shoes," the database finds "sneakers," "boots," and "footwear" because they share the same semantic neighborhood or "vibe."

### Why it's taking over
This is the engine powering modern AI recommendations, image searches, and RAG pipelines. By storing meaning instead of characters, we finally have search engines that actually understand what we want.`
  },
  "fastapi-production": {
    title: "FastAPI: Making Python Fast Again",
    excerpt: "FastAPI is incredible, but putting it in production can be tricky. If you block the main thread, the whole app freezes. Here are the secrets to keeping it blazing fast.",
    readTime: "6 min read",
    category: "Backend",
    date: "2026-05-20",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg",
    brandColor: "#009688",
    content: `Python has a reputation for being slow. For years, web frameworks handled one request at a time. If user A asked the server to download a large file, user B had to wait in line.

### The Asynchronous Hero
FastAPI fixes this by using asynchronous programming (async/await). 

Imagine a waiter at a restaurant. A "synchronous" waiter takes your order, walks to the kitchen, and stands there staring at the chef until your food is ready. Meanwhile, other tables are starving.

An "asynchronous" waiter takes your order, hands it to the kitchen, and immediately goes to serve the next table. When your food is ready, they bring it to you. 

### Production Speed
By freeing up the server to handle thousands of requests while waiting on databases or external APIs, FastAPI allows Python to achieve speeds comparable to NodeJS and Go. It makes Python fast again.`
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
    logoUrl: staticBlog.logoUrl,
    brandColor: staticBlog.brandColor,
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

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-4">
            {activeBlog.logoUrl && (
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center border shadow-sm p-3"
                style={{ 
                  backgroundColor: `${activeBlog.brandColor || '#007AFF'}15`,
                  borderColor: `${activeBlog.brandColor || '#007AFF'}25`
                }}
              >
                <img src={activeBlog.logoUrl} alt={activeBlog.category} className="w-full h-full object-contain" />
              </div>
            )}
            <h1 className="text-3xl md:text-5xl font-sans font-bold tracking-tight leading-tight">
              {activeBlog.title}
            </h1>
          </div>

          <p className={`text-base md:text-lg font-light leading-relaxed italic ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {activeBlog.excerpt}
          </p>
        </div>

        {/* Article Content Area */}
        <article className={`text-left max-w-none font-light leading-relaxed ${
          isDark ? 'text-slate-300 prose-invert' : 'text-slate-700'
        }`}>
          <div className={`prose md:prose-lg max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight 
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-[#007AFF] prose-a:no-underline hover:prose-a:underline
            prose-strong:font-semibold
            prose-ul:list-disc prose-ul:pl-6 prose-li:mb-2
            prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-mono
            ${isDark ? 'prose-code:bg-white/10 prose-code:text-emerald-400' : 'prose-code:bg-slate-100 prose-code:text-emerald-600'}
            prose-pre:bg-neutral-900 prose-pre:text-emerald-400 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
          `}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {activeBlog.content || `### Article Overview\nNo detailed content has been compiled for this article yet. Log in to the administrator portal to draft and publish details.`}
            </ReactMarkdown>
          </div>
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
