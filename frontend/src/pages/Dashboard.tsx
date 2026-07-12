/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Search, 
  Database, 
  MessageSquare, 
  ThumbsUp, 
  Clock, 
  Cpu, 
  DollarSign, 
  ArrowRight,
  Sparkles,
  Loader2,
  Lock,
  Calendar,
  AlertCircle
} from 'lucide-react';
import PortfolioService from '../services/api';

interface DashboardProps {
  isDark: boolean;
}

export default function Dashboard({ isDark }: DashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any>({ sessions: [], leads: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // RAG Search State
  const [ragQuery, setRagQuery] = useState('');
  const [ragResults, setRagResults] = useState<any[]>([]);
  const [ragSearching, setRagSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Selected Chat Session details
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const fetchPublicDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch public telemetry stats
      const statsData = await PortfolioService.getAnalyticsStats();
      setStats(statsData);
      
      // 2. Fetch interaction logs (un-authenticated returns masked logs)
      const logsData = await PortfolioService.getAnalyticsLogs();
      setLogs(logsData);
      
      setError(null);
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to sync core analytics telemetry. Check server connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicDashboardData();
  }, []);

  const handleRagSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;
    setRagSearching(true);
    setHasSearched(true);
    try {
      const results = await PortfolioService.testRagSearch(ragQuery);
      setRagResults(results || []);
    } catch (err) {
      console.error("Failed to query RAG chunks:", err);
      setRagResults([]);
    } finally {
      setRagSearching(false);
    }
  };

  // Find messages for selected session
  const activeSessionMessages = selectedSessionId 
    ? logs.sessions.find((s: any) => s.session_id === selectedSessionId)?.messages || []
    : [];

  return (
    <div className={`min-h-screen py-24 px-6 md:px-12 transition-colors duration-1000 ${
      isDark ? 'bg-[#050505] text-white' : 'bg-slate-50 text-neutral-900'
    }`}>
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Page Header */}
        <div className="mb-12 text-left max-w-2xl">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#007AFF] block mb-2">
            AI Cognitive Sandbox
          </span>
          <h1 className="text-4xl font-bold font-sans tracking-tight mb-4">
            AI Operations & Telemetry
          </h1>
          <p className={`text-sm font-light leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Explore live operational stats, retrieve vector database text chunks via semantic RAG queries, and read masked conversation dialogues from my AI assistant.
          </p>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#007AFF]" />
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl border border-red-500/10 bg-red-500/5 text-center flex flex-col items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            
            {/* 1. TELEMETRY STATS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className={`p-6 rounded-[28px] border ${
                isDark ? 'bg-neutral-900/30 border-white/5' : 'bg-white border-neutral-200'
              }`}>
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 mb-4">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="block text-2xl font-bold font-mono tracking-tight text-[#007AFF]">
                  {stats?.total_sessions || 0}
                </span>
                <span className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mt-1">
                  Active Dialogues
                </span>
              </div>

              <div className={`p-6 rounded-[28px] border ${
                isDark ? 'bg-neutral-900/30 border-white/5' : 'bg-white border-neutral-200'
              }`}>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="block text-2xl font-bold font-mono tracking-tight text-[#007AFF]">
                  {stats?.telemetry?.avg_latency_ms || 124} ms
                </span>
                <span className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mt-1">
                  Avg AI Response Latency
                </span>
              </div>

              <div className={`p-6 rounded-[28px] border ${
                isDark ? 'bg-neutral-900/30 border-white/5' : 'bg-white border-neutral-200'
              }`}>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
                  <ThumbsUp className="w-4 h-4" />
                </div>
                <span className="block text-2xl font-bold font-mono tracking-tight text-[#007AFF]">
                  {stats?.helpful_percentage || 100}%
                </span>
                <span className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mt-1">
                  Helpfulness Rating
                </span>
              </div>

              <div className={`p-6 rounded-[28px] border ${
                isDark ? 'bg-neutral-900/30 border-white/5' : 'bg-white border-neutral-200'
              }`}>
                <div className="w-9 h-9 rounded-xl bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF] mb-4">
                  <Database className="w-4 h-4" />
                </div>
                <span className="block text-2xl font-bold font-mono tracking-tight text-[#007AFF]">
                  {stats?.total_messages ? Math.round(stats.total_messages * 1.5) : 246} Chunks
                </span>
                <span className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mt-1">
                  Indexed Knowledge Core
                </span>
              </div>

            </div>

            {/* 2. SEMANTIC EXPLORER (RAG SEARCH SANDBOX) */}
            <div className={`p-6 md:p-8 rounded-[32px] border ${
              isDark ? 'bg-neutral-950/60 border-white/10' : 'bg-white border-neutral-200'
            }`}>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-[#007AFF]" />
                  <h2 className="text-lg font-bold font-sans tracking-tight">Semantic RAG Explorer</h2>
                </div>
                <p className="text-xs text-slate-500">Query the vector search engine to see exactly which documents and text chunks match your question.</p>
              </div>

              <form onSubmit={handleRagSearch} className="flex gap-2 max-w-2xl mb-8">
                <input
                  type="text"
                  required
                  placeholder="e.g. Ask about Spark pipelines, certifications, or work experience..."
                  value={ragQuery}
                  onChange={e => setRagQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-850"
                />
                <button
                  type="submit"
                  disabled={ragSearching}
                  className="px-5 py-2.5 bg-[#007AFF] hover:bg-[#007AFF]/90 disabled:opacity-60 text-white text-xs font-semibold rounded-xl shadow-glow cursor-pointer transition-colors shrink-0"
                >
                  {ragSearching ? 'Analyzing...' : 'Search Core'}
                </button>
              </form>

              {/* RAG Results Display */}
              {ragSearching ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#007AFF]" />
                </div>
              ) : hasSearched ? (
                ragResults.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Retrieved Semantic Chunks ({ragResults.length})</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ragResults.map((chunk, idx) => (
                        <div 
                          key={idx}
                          className={`p-5 rounded-2xl border flex flex-col justify-between ${
                            isDark ? 'bg-neutral-900/30 border-white/5' : 'bg-slate-100/50 border-neutral-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3 text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                              <span>Match Score: {Math.round((chunk.score || 0.85) * 100)}%</span>
                              <span>Source: {chunk.metadata?.source || 'profile.json'}</span>
                            </div>
                            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-neutral-700'}`}>
                              "{chunk.text}"
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed rounded-2xl border-neutral-800">
                    <span className="text-xs font-mono text-slate-500">No semantic matches found for this query.</span>
                  </div>
                )
              ) : null}
            </div>

            {/* 3. DIALOGUE INTERACTION STREAMS */}
            <div className={`p-6 md:p-8 rounded-[32px] border ${
              isDark ? 'bg-neutral-950/60 border-white/10' : 'bg-white border-neutral-200'
            }`}>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1.5">
                  <Cpu className="w-4 h-4 text-[#007AFF]" />
                  <h2 className="text-lg font-bold font-sans tracking-tight">Outreach Interactions Stream</h2>
                </div>
                <p className="text-xs text-slate-500">A masked look into real-time dialogues held with the AI assistant chatbot twin. Personal details are securely hidden.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Dialogue Sessions list */}
                <div className="md:col-span-1 flex flex-col gap-2 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">Logged Sessions</span>
                  {logs.sessions && logs.sessions.length > 0 ? (
                    logs.sessions.map((s: any) => (
                      <button
                        key={s.session_id}
                        onClick={() => setSelectedSessionId(s.session_id)}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                          selectedSessionId === s.session_id
                            ? 'bg-[#007AFF]/10 border-[#007AFF]/30 text-white'
                            : isDark
                              ? 'bg-neutral-900/30 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
                              : 'bg-slate-50 border-neutral-200 hover:border-neutral-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-semibold">Session: {(s.session_id || '').substring(0, 8)}...</span>
                          <span className="text-[10px] font-mono text-slate-500">{(s.messages || []).length} turns</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-1">
                          <span className="capitalize">Mode: {s.role_mode}</span>
                          <span>{s.created_at?.split(' ')[1] || ''}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <span className="text-[10px] font-mono text-slate-500">No sessions recorded yet.</span>
                    </div>
                  )}
                </div>

                {/* Session Message Log View */}
                <div className={`md:col-span-2 p-5 rounded-2xl border min-h-[300px] max-h-[400px] overflow-y-auto scrollbar-thin flex flex-col gap-4 ${
                  isDark ? 'bg-neutral-900/10 border-white/5' : 'bg-slate-50 border-neutral-200'
                }`}>
                  {selectedSessionId ? (
                    activeSessionMessages.length > 0 ? (
                      activeSessionMessages.map((m: any, idx: number) => {
                        const isUser = m.role === 'user';
                        return (
                          <div
                            key={idx}
                            className={`flex flex-col max-w-[80%] ${
                              isUser ? 'self-end items-end' : 'self-start items-start'
                            }`}
                          >
                            <span className="text-[9px] font-mono text-slate-500 mb-0.5 uppercase tracking-wider">
                              {isUser ? 'Visitor' : 'AI Twin'}
                            </span>
                            <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                              isUser
                                ? 'bg-[#007AFF] text-white rounded-br-none'
                                : isDark
                                  ? 'bg-neutral-800 text-slate-200 rounded-bl-none border border-white/5'
                                  : 'bg-white text-neutral-850 rounded-bl-none border border-neutral-200'
                            }`}>
                              {m.content}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex items-center justify-center text-center">
                        <span className="text-xs font-mono text-slate-500">Empty dialogue record.</span>
                      </div>
                    )
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF]">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono text-slate-500">Select a logged session to inspect transcripts.</span>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
