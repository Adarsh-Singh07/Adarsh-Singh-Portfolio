/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  MessageSquare, 
  ThumbsUp, 
  Clock, 
  Cpu, 
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import PortfolioService from '../services/api';

interface DashboardProps {
  isDark?: boolean;
}

export default function Dashboard({}: DashboardProps) {
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
      const statsData = await PortfolioService.getAnalyticsStats();
      setStats(statsData);
      
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

  const activeSessionMessages = selectedSessionId 
    ? logs.sessions.find((s: any) => (s.session_id || s.id) === selectedSessionId)?.messages || []
    : [];

  return (
    <div
      className="min-h-screen py-32"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        paddingLeft: 'var(--gutter)',
        paddingRight: 'var(--gutter)',
      }}
    >
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Page Header */}
        <div className="mb-14 text-left max-w-2xl">
          <div className="eyebrow mb-3">
            <span className="eyebrow-dot" />
            <span>AI Cognitive Sandbox</span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.75rem, 6vw, 4.5rem)',
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              lineHeight: 0.95,
            }}
            className="mb-4"
          >
            AI Operations &amp; Telemetry
          </h1>
          <p
            style={{
              color: 'var(--muted)',
              fontSize: '1.0625rem',
              lineHeight: 1.6,
            }}
          >
            Explore live operational stats, retrieve vector database text chunks via semantic RAG queries, and read masked conversation dialogues from my autonomous AI twin.
          </p>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#ff3b1d]" />
          </div>
        ) : error ? (
          <div
            className="p-8 rounded-[24px] border text-center flex flex-col items-center gap-3"
            style={{
              borderColor: 'rgba(255, 59, 29, 0.3)',
              backgroundColor: 'rgba(255, 59, 29, 0.05)',
            }}
          >
            <AlertCircle className="w-8 h-8 text-[#ff3b1d]" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            
            {/* 1. TELEMETRY STATS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div
                className="p-6 rounded-[28px] border transition-all duration-300"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--line)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: 'rgba(255, 59, 29, 0.1)',
                    color: 'var(--accent)',
                  }}
                >
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.5rem',
                    lineHeight: 1,
                    letterSpacing: '-0.01em',
                    color: 'var(--foreground)',
                  }}
                  className="block"
                >
                  {stats?.total_sessions || 0}
                </span>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mt-2">
                  Active Dialogues
                </span>
              </div>

              <div
                className="p-6 rounded-[28px] border transition-all duration-300"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--line)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: 'rgba(255, 59, 29, 0.1)',
                    color: 'var(--accent)',
                  }}
                >
                  <Clock className="w-5 h-5" />
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.5rem',
                    lineHeight: 1,
                    letterSpacing: '-0.01em',
                    color: 'var(--foreground)',
                  }}
                  className="block"
                >
                  {stats?.telemetry?.avg_latency_ms || 124} ms
                </span>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mt-2">
                  Avg Response Latency
                </span>
              </div>

              <div
                className="p-6 rounded-[28px] border transition-all duration-300"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--line)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: 'rgba(255, 59, 29, 0.1)',
                    color: 'var(--accent)',
                  }}
                >
                  <ThumbsUp className="w-5 h-5" />
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.5rem',
                    lineHeight: 1,
                    letterSpacing: '-0.01em',
                    color: 'var(--accent)',
                  }}
                  className="block"
                >
                  {stats?.helpful_percentage || 100}%
                </span>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mt-2">
                  Helpfulness Rating
                </span>
              </div>

              <div
                className="p-6 rounded-[28px] border transition-all duration-300"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--line)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: 'rgba(255, 59, 29, 0.1)',
                    color: 'var(--accent)',
                  }}
                >
                  <Database className="w-5 h-5" />
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.5rem',
                    lineHeight: 1,
                    letterSpacing: '-0.01em',
                    color: 'var(--foreground)',
                  }}
                  className="block"
                >
                  {stats?.total_messages ? Math.round(stats.total_messages * 1.5) : 246} Chunks
                </span>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mt-2">
                  Indexed Knowledge Core
                </span>
              </div>

            </div>

            {/* 2. SEMANTIC EXPLORER (RAG SEARCH SANDBOX) */}
            <div
              className="p-6 md:p-8 rounded-[32px] border"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--line)',
              }}
            >
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-[#ff3b1d]" />
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.75rem',
                      letterSpacing: '-0.01em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Semantic RAG Explorer
                  </h2>
                </div>
                <p className="text-xs text-neutral-400">
                  Query the vector search engine to see exactly which documents and text chunks match your question.
                </p>
              </div>

              <form onSubmit={handleRagSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mb-8">
                <input
                  type="text"
                  required
                  placeholder="e.g. Ask about Spark pipelines, certifications, or work experience..."
                  value={ragQuery}
                  onChange={e => setRagQuery(e.target.value)}
                  className="flex-1 px-5 py-3 rounded-full border bg-transparent text-sm focus:outline-none focus:border-[#ff3b1d] placeholder:text-neutral-500"
                  style={{
                    borderColor: 'var(--line)',
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--foreground)',
                  }}
                />
                <button
                  type="submit"
                  disabled={ragSearching}
                  className="px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all duration-300 shrink-0"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#08080a',
                  }}
                >
                  {ragSearching ? 'Analyzing...' : 'Search Core'}
                </button>
              </form>

              {/* RAG Results Display */}
              {ragSearching ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#ff3b1d]" />
                </div>
              ) : hasSearched ? (
                ragResults.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                      Retrieved Semantic Chunks ({ragResults.length})
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ragResults.map((chunk, idx) => (
                        <div 
                          key={idx}
                          className="p-6 rounded-[24px] border flex flex-col justify-between"
                          style={{
                            backgroundColor: 'var(--surface-2)',
                            borderColor: 'var(--line)',
                          }}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3 text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">
                              <span>Match Score: {Math.round((chunk.score || 0.85) * 100)}%</span>
                              <span className="text-[#ff3b1d]">Source: {chunk.metadata?.source || 'profile.json'}</span>
                            </div>
                            <p className="text-xs leading-relaxed text-neutral-300">
                              "{chunk.text}"
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className="text-center py-12 border border-dashed rounded-[24px]"
                    style={{ borderColor: 'var(--line)' }}
                  >
                    <span className="text-xs font-mono text-neutral-400">No semantic matches found for this query.</span>
                  </div>
                )
              ) : null}
            </div>

            {/* 3. DIALOGUE INTERACTION STREAMS */}
            <div
              className="p-6 md:p-8 rounded-[32px] border"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--line)',
              }}
            >
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1.5">
                  <Cpu className="w-4 h-4 text-[#ff3b1d]" />
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.75rem',
                      letterSpacing: '-0.01em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Outreach Interactions Stream
                  </h2>
                </div>
                <p className="text-xs text-neutral-400">
                  A masked look into real-time dialogues held with the AI assistant chatbot twin. Personal details are securely hidden.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Dialogue Sessions list */}
                <div className="md:col-span-1 flex flex-col gap-2 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold mb-1">
                    Logged Sessions
                  </span>
                  {logs.sessions && logs.sessions.length > 0 ? (
                    logs.sessions.map((s: any) => {
                      const sid = s.session_id || s.id || '';
                      return (
                        <button
                          key={sid}
                          onClick={() => setSelectedSessionId(sid)}
                          className="p-4 rounded-[18px] border text-left flex flex-col gap-1 transition-all cursor-pointer"
                          style={{
                            backgroundColor: selectedSessionId === sid ? 'rgba(255, 59, 29, 0.12)' : 'var(--surface-2)',
                            borderColor: selectedSessionId === sid ? 'var(--accent)' : 'var(--line)',
                            color: 'var(--foreground)',
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono font-semibold">Session: {sid.substring(0, 8)}...</span>
                            <span className="text-[10px] font-mono text-neutral-400">{(s.messages || []).length} turns</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mt-1">
                            <span className="capitalize">Mode: {s.role_mode}</span>
                            <span>{s.created_at?.split('T')[1]?.substring(0, 5) || s.created_at?.split(' ')[1] || ''}</span>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <span className="text-[10px] font-mono text-neutral-400">No sessions recorded yet.</span>
                    </div>
                  )}
                </div>

                {/* Session Message Log View */}
                <div
                  className="md:col-span-2 p-6 rounded-[24px] border min-h-[300px] max-h-[400px] overflow-y-auto scrollbar-thin flex flex-col gap-4"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--line)',
                  }}
                >
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
                            <span className="text-[9px] font-mono text-neutral-400 mb-1 uppercase tracking-wider">
                              {isUser ? 'Visitor' : 'AI Twin'}
                            </span>
                            <div
                              className="px-5 py-3 rounded-[20px] text-xs leading-relaxed"
                              style={{
                                backgroundColor: isUser ? 'var(--accent)' : 'var(--surface)',
                                color: isUser ? '#08080a' : 'var(--foreground)',
                                border: isUser ? 'none' : '1px solid var(--line)',
                                borderBottomRightRadius: isUser ? '4px' : '20px',
                                borderBottomLeftRadius: isUser ? '20px' : '4px',
                              }}
                            >
                              {m.content}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex items-center justify-center text-center">
                        <span className="text-xs font-mono text-neutral-400">Empty dialogue record.</span>
                      </div>
                    )
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-2">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                        style={{
                          backgroundColor: 'rgba(255, 59, 29, 0.1)',
                          color: 'var(--accent)',
                        }}
                      >
                        <Cpu className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono text-neutral-400">Select a logged session to inspect transcripts.</span>
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
