/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BlogNote, ProfileMode } from '../types';
import { BookOpen, Calendar, Clock, Search, X, ChevronRight, Terminal, ArrowUpRight } from 'lucide-react';

interface BlogProps {
  blogs: BlogNote[];
  currentMode: ProfileMode;
  isDark: boolean;
}

// Complete technical write-ups dictionary for the projects
const BLOG_ARTICLES: Record<string, { title: string; subtitle: string; content: React.ReactNode }> = {
  'scalable-etl-azure-databricks': {
    title: 'Building Scalable ETL Pipelines with Azure Databricks for Financial Data Lakes',
    subtitle: 'Medallion lakehouse flow transforming raw transactions to BI records.',
    content: (
      <div className="space-y-6 text-sm leading-relaxed font-sans">
        <p>
          In enterprise financial systems, data consistency, transactional safety (ACID), and schema enforcement are critical. This article outlines the architecture of a production-grade <strong>Medallion Lakehouse</strong> implemented on Azure Databricks, designed to transform raw transaction logs into structured, analytics-ready tables.
        </p>

        <h4 className="text-base font-bold text-white font-display mt-8">1. Medallion Architecture Overview</h4>
        <p>
          Data flows chronologically through three key stages, guaranteeing isolation and incremental cleanup:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-200">
          <li><strong>Bronze Layer (Raw)</strong>: Ingests unstructured JSON streams directly from event buses or legacy systems. No schema validation or transformations are applied.</li>
          <li><strong>Silver Layer (Cleansed)</strong>: Enforces schemas, casts data types, handles null values, and filters duplicates using watermark thresholds.</li>
          <li><strong>Gold Layer (Aggregated)</strong>: Builds optimized business-level metrics, creating aggregated dashboards that BI tools like Power BI can query instantly.</li>
        </ul>

        <h4 className="text-base font-bold text-white font-display mt-8">2. De-duplication and Stream Processing</h4>
        <p>
          Using PySpark Structured Streaming, we handle concurrent ingestion pipelines, using watermarks to prevent late-arriving data from creating duplicate records:
        </p>

        <pre className="p-4 bg-black border border-white/10 rounded-xl overflow-x-auto font-mono text-[11px] text-[#AEEA00]">
{`# PySpark Silver Stream ingestion with de-duplication
silver_stream = (spark.readStream
  .format("delta")
  .load("/mnt/bronze/transactions")
  .withWatermark("timestamp", "2 hours")
  .dropDuplicates(["transaction_id", "timestamp"])
  .select(
    "transaction_id",
    col("amount").cast("double"),
    col("timestamp").cast("timestamp"),
    col("account_id").cast("string")
  )
)

# Commit delta logs securely
(silver_stream.writeStream
  .format("delta")
  .outputMode("append")
  .option("checkpointLocation", "/mnt/checkpoints/silver")
  .start("/mnt/silver/transactions")
)`}
        </pre>

        <h4 className="text-base font-bold text-white font-display mt-8">3. Delta Lake Performance Optimization</h4>
        <p>
          To maintain sub-second search times for downstream BI reports, we configure the Delta tables with <strong>Z-Ordering</strong> on high-cardinality keys like <code>account_id</code>, grouping related data points physically in memory.
        </p>
        <pre className="p-4 bg-black border border-white/10 rounded-xl overflow-x-auto font-mono text-[11px] text-[#00E5FF]">
{`-- Optimize Delta storage layout
OPTIMIZE delta.\`/mnt/silver/transactions\`
ZORDER BY (account_id, transaction_type);`}
        </pre>
      </div>
    )
  },
  'agentic-ai-rag-dynamic-pricing': {
    title: 'Leveraging Agentic AI and RAG for Dynamic Pricing in On-Demand Services',
    subtitle: 'Integrating Retrieval-Augmented Generation into distributed microservices.',
    content: (
      <div className="space-y-6 text-sm leading-relaxed font-sans">
        <p>
          Static pricing algorithms are no longer sufficient in fast-paced markets. By combining <strong>Agentic AI</strong> decisions with <strong>Retrieval-Augmented Generation (RAG)</strong>, microservices can dynamically adjust pricing according to local demand, customer profiles, and competitive parameters.
        </p>

        <h4 className="text-base font-bold text-white font-display mt-8">1. Architectural Flow</h4>
        <p>
          The pricing engine relies on a state machine built around an LLM agent that decides when to trigger external tools:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-slate-200">
          <li><strong>Ingestion</strong>: User queries enter via REST endpoints and are converted to vector embeddings.</li>
          <li><strong>Semantic Search</strong>: The system queries a vector store (e.g. Pinecone/Chroma) using Cosine Similarity to retrieve matching localized pricing rules.</li>
          <li><strong>Agent Evaluation</strong>: The agent processes the semantic context, user profile, and active supply stats to compute the optimized target rate.</li>
        </ol>

        <h4 className="text-base font-bold text-white font-display mt-8">2. Semantic Retrieval Code</h4>
        <p>
          The vector search retrieval code fetches the localized rules dynamically:
        </p>

        <pre className="p-4 bg-black border border-white/10 rounded-xl overflow-x-auto font-mono text-[11px] text-[#AEEA00]">
{`# RAG Pricing Retriever using LangChain
from langchain_community.vectorstores import Pinecone
from langchain_openai import OpenAIEmbeddings

def retrieve_localized_rules(user_query: str):
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vector_store = Pinecone.from_existing_index(
        index_name="pricing-rules", 
        embedding=embeddings
    )
    
    # Retrieve top 3 matching metadata rules
    matches = vector_store.similarity_search(
        user_query, 
        k=3
    )
    return [match.page_content for match in matches]`}
        </pre>

        <h4 className="text-base font-bold text-white font-display mt-8">3. Real-Time Telemetry and Chat</h4>
        <p>
          An integrated customer support agent operates in parallel, utilizing cached context blocks to answer service inquiries under 300ms, streaming event-driven logs to client interfaces via WebSocket connections.
        </p>
      </div>
    )
  },
  'personalizing-email-openai-llm': {
    title: 'Personalizing Email Campaigns with OpenAI: A Practical Guide to LLM Integration',
    subtitle: 'Structuring automated outreach tools utilizing GPT models and Google APIs.',
    content: (
      <div className="space-y-6 text-sm leading-relaxed font-sans">
        <p>
          Generic email blasts suffer from low conversion rates. Personalizing emails using Large Language Models (LLMs) allows campaigns to tailor context points for each receiver automatically. This guide explores building an automated campaign engine in Python.
        </p>

        <h4 className="text-base font-bold text-white font-display mt-8">1. Google Sheets Data Loop</h4>
        <p>
          We use Google Sheets as a live lightweight relational database. Python reads customer parameters dynamically:
        </p>
        <pre className="p-4 bg-black border border-white/10 rounded-xl overflow-x-auto font-mono text-[11px] text-[#00E5FF]">
{`# Connect Google Sheets via API credentials
def load_leads_from_sheets():
    gc = gspread.service_account(filename="credentials.json")
    sh = gc.open("Email_Campaign_Database")
    worksheet = sh.get_worksheet(0)
    return worksheet.get_all_records()`}
        </pre>

        <h4 className="text-base font-bold text-white font-display mt-8">2. Context-Aware Prompting</h4>
        <p>
          To prevent the model from generating generic outputs, we feed structured profile points directly into the instruction payload, locking token limits to control API expenses:
        </p>

        <pre className="p-4 bg-black border border-white/10 rounded-xl overflow-x-auto font-mono text-[11px] text-[#AEEA00]">
{`# Personalization Dispatcher using OpenAI GPT-4o
from openai import OpenAI

client = OpenAI()

def generate_personalized_content(lead_data):
    prompt = f"""
    Write a concise, professional intro email to {lead_data['Name']}.
    Target Role: {lead_data['Role']}.
    Company Focus: {lead_data['Company']}.
    Ensure the email references their focus on '{lead_data['Focus']}' and proposes a brief 10-minute slot.
    Limit output to 120 words.
    """
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
        temperature=0.7
    )
    return response.choices[0].message.content`}
        </pre>

        <h4 className="text-base font-bold text-white font-display mt-8">3. SMTP Transmission & Throttling</h4>
        <p>
          To prevent emails from flagging spam filters, we integrate custom SMTP server class loaders, incorporating progressive delays between transmissions.
        </p>
      </div>
    )
  },
  'real-time-isl-translation-ml': {
    title: 'Real-Time Indian Sign Language Translation: An ML Pipeline with TensorFlow & OpenCV',
    subtitle: 'Low-latency frame processing and coordinate-based gestures inference.',
    content: (
      <div className="space-y-6 text-sm leading-relaxed font-sans">
        <p>
          Translating gesture inputs into text requires real-time computer vision processing and sequence prediction models. This post reviews building a sign language translation pipeline running locally on target processors.
        </p>

        <h4 className="text-base font-bold text-white font-display mt-8">1. Frame Processing Pipeline</h4>
        <p>
          The translation engine captures input streams via OpenCV and routes them through MediaPipe for hand skeletal tracking, avoiding heavy image convolutions in the initial stage:
        </p>
        <pre className="p-4 bg-black border border-white/10 rounded-xl overflow-x-auto font-mono text-[11px] text-[#00E5FF]">
{`# OpenCV Video Capture with MediaPipe Tracking
import cv2
import mediapipe as mp

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.7)

cap = cv2.VideoCapture(0)
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    
    # Flip frame and convert to RGB
    rgb_frame = cv2.cvtColor(cv2.flip(frame, 1), cv2.COLOR_BGR2RGB)
    results = hands.process(rgb_frame)
    # Extract coordinate positions...`}
        </pre>

        <h4 className="text-base font-bold text-white font-display mt-8">2. LSTM Sequence Inference</h4>
        <p>
          Once coordinate points are parsed and normalized, we stack them into temporal windows (e.g. 30 frames) and feed them into a pre-trained TensorFlow LSTM network to classify action state signatures:
        </p>

        <pre className="p-4 bg-black border border-white/10 rounded-xl overflow-x-auto font-mono text-[11px] text-[#AEEA00]">
{`# TensorFlow Sequence Gesture Prediction
import numpy as np
import tensorflow as tf

model = tf.keras.models.load_model("sign_language_lstm.h5")

def predict_gesture(sequence_buffer):
    # Buffer shape: (1, 30, 126) -> 30 frames, 126 skeletal coordinates
    input_data = np.expand_dims(sequence_buffer, axis=0)
    prediction = model.predict(input_data)[0]
    
    class_id = np.argmax(prediction)
    confidence = prediction[class_id]
    return class_id, confidence`}
        </pre>

        <h4 className="text-base font-bold text-white font-display mt-8">3. Output Audio Integration</h4>
        <p>
          When predictions cross a 85% confidence watermark, the system triggers Google Text-To-Speech (gTTS) routines to synthesize translated signals immediately.
        </p>
      </div>
    )
  }
};

export default function Blog({ blogs, currentMode, isDark }: BlogProps) {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  
  const drawerRef = useRef<HTMLDivElement>(null);

  // Extract unique categories dynamically from blogs
  const categories = ['all', ...Array.from(new Set(blogs.map(blog => blog.category)))];

  // Filter & sort blogs
  const filteredBlogs = blogs
    .filter(blog => {
      const matchCategory = filter === 'all' || blog.category === filter;
      const matchSearch = 
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) || 
        blog.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      const aPriority = a.priority[currentMode] ?? 99;
      const bPriority = b.priority[currentMode] ?? 99;
      return aPriority - bPriority;
    });

  const handleDrawerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.clientHeight <= 0) return;
    const progress = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
    setScrollProgress(progress);
  };

  // Close drawer on ESC keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedBlogId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeArticle = selectedBlogId ? BLOG_ARTICLES[selectedBlogId] : null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.08 } 
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <div className="min-h-screen py-28 px-6 md:px-12 max-w-7xl mx-auto w-full select-none relative">
      
      {/* 1. HERO HEADER */}
      <div className="mb-16 text-left max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[10px] font-bold tracking-[0.2em] font-sans uppercase w-fit mb-6 ${
            isDark 
              ? 'bg-[#007AFF15] border-[#007AFF30] text-[#007AFF]' 
              : 'bg-[#007AFF10] border-[#007AFF20] text-[#007AFF]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>EDITORIAL WRITING LOG</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-6xl font-sans font-semibold tracking-tight leading-none mb-6"
        >
          Technical Musings<br />
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
            isDark 
              ? 'from-white via-white/80 to-white/40' 
              : 'from-neutral-950 via-neutral-900 to-neutral-500'
          } italic font-serif font-medium`}>Editorial Notes &amp; Systems</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={`text-base md:text-lg font-light leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          Detailed reviews and architectures detailing big data workloads, RAG dynamically adjusted parameters, and local ML pipelines.
        </motion.p>
      </div>

      {/* 2. FILTER CONTROLS & SEARCH BAR */}
      <div className="mb-12 flex flex-col md:flex-row gap-6 md:items-center md:justify-between relative z-20">
        
        {/* Category switcher */}
        <div className={`p-1 rounded-2xl border flex flex-wrap items-center gap-1.5 backdrop-blur-xl ${
          isDark ? 'bg-white/5 border-white/[0.08]' : 'bg-slate-100 border-slate-200'
        }`}>
          {categories.map((cat) => {
            const isActive = filter === cat;
            const label = cat === 'all' ? 'All Publications' : cat;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`relative px-4 py-2 rounded-xl text-xs font-mono font-medium tracking-wide transition-all duration-300 ${
                  isActive 
                    ? isDark ? 'text-black' : 'text-white'
                    : isDark ? 'text-slate-300' : 'text-slate-600 hover:text-neutral-950'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="blog-category-pill"
                    className={`absolute inset-0 rounded-xl -z-10 ${
                      isDark ? 'bg-white' : 'bg-neutral-950'
                    }`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search publications..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-mono tracking-wider focus:outline-none transition-all duration-300 ${
              isDark 
                ? 'bg-white/5 border-white/[0.08] text-white placeholder-slate-400 focus:border-[#007AFF] focus:bg-black/40' 
                : 'bg-slate-100 border-slate-200 text-neutral-900 placeholder-slate-500 focus:border-[#007AFF] focus:bg-white'
            }`}
          />
        </div>

      </div>

      {/* 3. BLOG POSTS ARCHIVE GRID */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {filteredBlogs.map((blog) => (
          <motion.div
            key={blog.id}
            variants={cardVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            onClick={() => setSelectedBlogId(blog.id)}
            className={`p-8 rounded-[32px] border transition-all duration-300 relative group overflow-hidden flex flex-col justify-between cursor-pointer h-full ${
              isDark 
                ? 'bg-gradient-to-b from-[#141416]/90 to-[#09090b]/95 border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] hover:border-white/20' 
                : 'bg-white border-neutral-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] hover:border-[#007AFF]/15'
            }`}
          >
            {/* Ambient hover glow */}
            <div className="absolute -right-20 -bottom-20 w-52 h-52 rounded-full filter blur-[65px] opacity-0 group-hover:opacity-10 bg-[#007AFF]/30 pointer-events-none transition-opacity duration-500" />

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                
                {/* Meta details header row */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full border text-[8px] font-mono font-bold tracking-widest uppercase ${
                    isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}>
                    {blog.category}
                  </span>
                  
                  <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>•</span>
                  
                  <div className={`flex items-center gap-1 text-[9px] font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <Clock className="w-3 h-3 text-[#007AFF]" />
                    <span>{blog.readTime}</span>
                  </div>
                </div>

                <h3 className={`text-lg font-bold font-display tracking-tight leading-snug transition-colors duration-300 group-hover:text-[#007AFF] mb-4 ${
                  isDark ? 'text-white' : 'text-neutral-900'
                }`}>
                  {blog.title}
                </h3>

                <p className={`text-xs font-light leading-relaxed mb-6 line-clamp-3 ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {blog.excerpt}
                </p>

              </div>

              {/* Card Footer link indicator */}
              <div className={`border-t border-solid pt-4 mt-auto flex items-center justify-between ${
                isDark ? 'border-white/[0.06] text-slate-400' : 'border-neutral-100 text-slate-600'
              }`}>
                <span className="text-[9px] font-mono tracking-widest uppercase">{blog.date}</span>
                <div className="flex items-center gap-1 text-[9px] font-mono font-bold tracking-widest text-[#007AFF] group-hover:underline">
                  <span>READ NOTE</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* No articles fallback */}
      {filteredBlogs.length === 0 && (
        <div className="text-center py-20">
          <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-sm font-mono text-white/40 uppercase tracking-widest">No matching publications found.</p>
        </div>
      )}

      {/* 4. SLIDE-OUT LUXURY READING DRAWER */}
      <AnimatePresence>
        {selectedBlogId && activeArticle && (
          <>
            {/* Backdrop Dimmer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBlogId(null)}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
            />

            {/* Reading Panel */}
            <motion.div
              ref={drawerRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              onScroll={handleDrawerScroll}
              className="fixed inset-y-0 right-0 max-w-3xl w-full bg-[#09090b] z-50 border-l border-white/[0.08] shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col justify-start overflow-y-auto"
            >
              
              {/* Floating Linear Scroll Progress Bar */}
              <div className="sticky top-0 left-0 right-0 h-1 z-55 bg-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-[#007AFF] to-[#00E5FF] transition-all duration-100" 
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>

              {/* Drawer Content */}
              <div className="p-8 md:p-12 max-w-2xl mx-auto w-full relative">
                
                {/* Control bar */}
                <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2 text-[#007AFF] font-mono text-[10px] tracking-wider uppercase font-semibold">
                    <Terminal className="w-4 h-4" />
                    <span>Secure Reader Console</span>
                  </div>
                  
                  <button
                    onClick={() => setSelectedBlogId(null)}
                    className="p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 text-slate-300 hover:text-white transition-all duration-300"
                    title="Close Reader (ESC)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Article Header */}
                <div className="mb-10">
                  <span className="px-3 py-1 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 text-[9px] font-mono font-bold tracking-widest text-[#90CAF9] uppercase mb-4 inline-block">
                    {blogs.find(b => b.id === selectedBlogId)?.category}
                  </span>
                  
                  <h2 className="text-2xl md:text-3xl font-bold font-serif italic tracking-tight text-white mb-4 leading-tight">
                    {activeArticle.title}
                  </h2>
                  
                  <p className="text-sm font-light leading-relaxed text-slate-300 mb-6 italic">
                    {activeArticle.subtitle}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400 border-t border-b border-white/5 py-3.5">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{blogs.find(b => b.id === selectedBlogId)?.date}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{blogs.find(b => b.id === selectedBlogId)?.readTime}</span>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="text-white/80 leading-relaxed font-sans mb-16">
                  {activeArticle.content}
                </div>

                {/* Footer close option */}
                <div className="border-t border-white/5 pt-8 text-center flex items-center justify-between">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">End of Publication</span>
                  <button
                    onClick={() => setSelectedBlogId(null)}
                    className="px-6 py-2 bg-white/5 border border-white/10 hover:bg-white hover:text-black hover:border-white text-white font-mono font-semibold text-xs rounded-xl transition-all duration-300 active:scale-[0.98] inline-flex items-center gap-1"
                  >
                    <span>Terminate Connection</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
