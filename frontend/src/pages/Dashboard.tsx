import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Search, 
  Database, 
  Lock, 
  Unlock, 
  MessageSquare, 
  Users, 
  ThumbsUp, 
  Clock, 
  Cpu, 
  DollarSign, 
  ArrowRight,
  Sparkles,
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';
import PortfolioService from '../services/api';

interface DashboardProps {
  isDark: boolean;
}

type TabType = 'analytics' | 'rag' | 'unanswered';

export default function Dashboard({ isDark }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any>({ sessions: [], leads: [] });
  const [unanswered, setUnanswered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Passcode State
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcodeError, setPasscodeError] = useState(false);
  
  // RAG Search State
  const [ragQuery, setRagQuery] = useState('');
  const [ragResults, setRagResults] = useState<any[]>([]);
  const [ragSearching, setRagSearching] = useState(false);
  
  // Selected Chat Session details
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Load stats, logs and unanswered questions
  const fetchData = async (currentPasscode?: string) => {
    setLoading(true);
    try {
      const statsData = await PortfolioService.getAnalyticsStats();
      setStats(statsData);
      
      const logsData = await PortfolioService.getAnalyticsLogs(currentPasscode);
      setLogs(logsData);
      setIsUnlocked(logsData.is_admin);

      if (logsData.is_admin || currentPasscode) {
        const unansweredData = await PortfolioService.getUnansweredQuestions(currentPasscode || passcode);
        setUnanswered(unansweredData);
      }
      
      setError(null);
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to sync core analytics telemetry. Ensure python backend is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(false);
    try {
      const res = await PortfolioService.verifyPasscode(passcode);
      if (res.success) {
        setIsUnlocked(true);
        fetchData(passcode);
      } else {
        setPasscodeError(true);
        setTimeout(() => setPasscodeError(false), 2000);
      }
    } catch (err) {
      console.error("Verification failed:", err);
      setPasscodeError(true);
    }
  };

  const handleResolveQuestion = async (q_id: number) => {
    try {
      const res = await PortfolioService.resolveUnansweredQuestion(q_id, passcode);
      if (res.success) {
        setUnanswered(prev => prev.filter(q => q.id !== q_id));
      }
    } catch (err) {
      console.error("Failed to resolve question:", err);
    }
  };

  const handleRagSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;
    setRagSearching(true);
    try {
      const results = await PortfolioService.testRagSearch(ragQuery);
      setRagResults(results);
    } catch (err) {
      console.error("RAG search failed:", err);
    } finally {
      setRagSearching(false);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const getSelectedSession = () => {
    return logs.sessions.find((s: any) => s.id === selectedSessionId);
  };

  return (
    <div className="min-h-screen py-28 px-4 md:px-12 max-w-7xl mx-auto w-full select-none font-sans">
      
      {/* 1. HERO HEADER */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-[0.2em] uppercase w-fit mb-6 ${
              isDark 
                ? 'bg-[#007AFF15] border-[#007AFF30] text-[#007AFF]' 
                : 'bg-[#007AFF10] border-[#007AFF20] text-[#007AFF]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>OPERATIONAL TELEMETRY</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-semibold tracking-tight leading-none mb-4"
          >
            System &amp; RAG Insights<br />
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
              isDark 
                ? 'from-white via-white/80 to-white/40' 
                : 'from-neutral-950 via-neutral-900 to-neutral-500'
            } italic font-serif font-medium`}>Chatbot Analytics &amp; Context Retrieval</span>
          </motion.h1>
        </div>

        {/* Tab Selection Glassmorphic Control */}
        <div className={`p-1 rounded-2xl border flex items-center gap-1 backdrop-blur-xl ${
          isDark ? 'bg-white/5 border-white/[0.08]' : 'bg-slate-100 border-slate-200'
        }`}>
          {(['analytics', 'rag', 'unanswered'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const label = 
              tab === 'analytics' ? 'Interaction Analytics' : 
              tab === 'rag' ? 'RAG Semantic Explorer' : 
              'Unresolved Queries';
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-2 rounded-xl text-xs font-mono font-medium tracking-wide transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? isDark ? 'text-black' : 'text-white'
                    : isDark ? 'text-white/60 hover:text-white' : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="dashboard-tab-pill"
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
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-xl border border-rose-500/25 bg-rose-500/10 text-rose-500 flex items-center gap-3 text-xs md:text-sm font-mono">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
          <button onClick={() => fetchData(passcode)} className="underline ml-auto font-bold hover:text-rose-400">Retry Sync</button>
        </div>
      )}

      {loading && !stats ? (
        <div className="h-[400px] flex flex-col justify-center items-center gap-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <span className="font-mono text-xs opacity-60">Synchronizing secure telemetry streams...</span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'analytics' ? (
            <motion.div
              key="analytics-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-10"
            >
              {/* 2. STATS GRID BENTO LAYOUT */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Session Card */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between group transition-all duration-300 ${
                  isDark ? 'bg-slate-950/45 border-slate-900 hover:border-slate-800' : 'bg-white border-slate-200 hover:shadow-md'
                }`}>
                  <div className="flex items-center justify-between text-slate-400 mb-4">
                    <MessageSquare className="w-5 h-5 text-cyan-400" />
                    <span className="text-[10px] font-mono opacity-50">SESSIONS</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{stats?.total_sessions || 0}</h2>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono font-semibold">Total chats</p>
                  </div>
                </div>

                {/* Messages Card */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
                  isDark ? 'bg-slate-950/45 border-slate-900 hover:border-slate-800' : 'bg-white border-slate-200 hover:shadow-md'
                }`}>
                  <div className="flex items-center justify-between text-slate-400 mb-4">
                    <Database className="w-5 h-5 text-indigo-400" />
                    <span className="text-[10px] font-mono opacity-50">MESSAGES</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{stats?.total_messages || 0}</h2>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono font-semibold">Logged exchanges</p>
                  </div>
                </div>

                {/* Helpful percentage */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
                  isDark ? 'bg-slate-950/45 border-slate-900 hover:border-slate-800' : 'bg-white border-slate-200 hover:shadow-md'
                }`}>
                  <div className="flex items-center justify-between text-slate-400 mb-4">
                    <ThumbsUp className="w-5 h-5 text-emerald-400" />
                    <span className="text-[10px] font-mono opacity-50">FEEDBACK</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-emerald-500">
                      {stats?.helpful_percentage || 100}%
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono font-semibold">
                      Helpful ratio ({stats?.feedback_stats?.helpful || 0}👍 / {stats?.feedback_stats?.unhelpful || 0}👎)
                    </p>
                  </div>
                </div>

                {/* Average Latency */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
                  isDark ? 'bg-slate-950/45 border-slate-900 hover:border-slate-800' : 'bg-white border-slate-200 hover:shadow-md'
                }`}>
                  <div className="flex items-center justify-between text-slate-400 mb-4">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span className="text-[10px] font-mono opacity-50">LATENCY</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{stats?.avg_latency_ms || 0}ms</h2>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono font-semibold">Avg LLM response</p>
                  </div>
                </div>

                {/* Tokens Used */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
                  isDark ? 'bg-slate-950/45 border-slate-900 hover:border-slate-800' : 'bg-white border-slate-200 hover:shadow-md'
                }`}>
                  <div className="flex items-center justify-between text-slate-400 mb-4">
                    <Cpu className="w-5 h-5 text-purple-400" />
                    <span className="text-[10px] font-mono opacity-50">TELEMETRY</span>
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold tracking-tight truncate">
                      {stats?.tokens_used?.total ? Math.round(stats.tokens_used.total / 1000) : 0}k
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1.5 uppercase tracking-wider font-mono font-semibold">Total tokens processed</p>
                  </div>
                </div>

                {/* Cost Card */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
                  isDark ? 'bg-slate-950/45 border-slate-900 hover:border-slate-800' : 'bg-white border-slate-200 hover:shadow-md'
                }`}>
                  <div className="flex items-center justify-between text-slate-400 mb-4">
                    <DollarSign className="w-5 h-5 text-pink-500" />
                    <span className="text-[10px] font-mono opacity-50">API BILLING</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-emerald-500">
                      ${stats?.estimated_cost_usd ? stats.estimated_cost_usd.toFixed(4) : "0.0000"}
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono font-semibold">Estimated cost</p>
                  </div>
                </div>
              </div>

              {/* 3. CHARTS BREAKDOWN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chatbot Mode Distribution */}
                <div className={`p-6 rounded-2xl border ${
                  isDark ? 'bg-slate-950/40 border-slate-900' : 'bg-white border-slate-200'
                }`}>
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono opacity-60 mb-6">Chat Session Toggle Distribution</h3>
                  <div className="space-y-4">
                    {['general', 'data-engineer', 'ai-engineer'].map((mode) => {
                      const count = stats?.mode_distribution?.[mode] || 0;
                      const total = stats?.total_sessions || 1;
                      const pct = Math.round((count / total) * 100);
                      const labels: any = {
                        general: { label: "General AI/Data Portfolio", color: "bg-cyan-400" },
                        "data-engineer": { label: "Data Engineer Resume Mode", color: "bg-indigo-500" },
                        "ai-engineer": { label: "Gen AI Engineer Resume Mode", color: "bg-purple-500" }
                      };
                      return (
                        <div key={mode} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-300 font-semibold">{labels[mode].label}</span>
                            <span>{count} chats ({pct}%)</span>
                          </div>
                          <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                            <div className={`h-full rounded-full ${labels[mode].color}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recruiter Outreach Intent Distribution */}
                <div className={`p-6 rounded-2xl border ${
                  isDark ? 'bg-slate-950/40 border-slate-900' : 'bg-white border-slate-200'
                }`}>
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono opacity-60 mb-6">AI-Categorized Outreach Intent</h3>
                  <div className="space-y-4">
                    {['Hiring Inquiry', 'Collaboration', 'General Question', 'Other'].map((intent) => {
                      const count = stats?.intent_distribution?.[intent] || 0;
                      const total = stats?.total_leads || 1;
                      const pct = Math.round((count / total) * 100);
                      const colors: any = {
                        "Hiring Inquiry": "bg-emerald-500",
                        "Collaboration": "bg-amber-500",
                        "General Question": "bg-blue-500",
                        "Other": "bg-slate-500"
                      };
                      return (
                        <div key={intent} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-300 font-semibold">{intent}</span>
                            <span>{count} leads ({pct}%)</span>
                          </div>
                          <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                            <div className={`h-full rounded-full ${colors[intent]}`} style={{ width: `${total > 0 ? pct : 0}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 4. CONVERSATION LOGS & OUTBOX LEADS PANEL */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* 4.1 Chat Sessions Column (Left - 5 cols) */}
                <div className={`lg:col-span-5 p-6 rounded-2xl border flex flex-col h-[550px] ${
                  isDark ? 'bg-slate-950/40 border-slate-900' : 'bg-white border-slate-200'
                }`}>
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono opacity-60 mb-4">Live Conversation Log Streams</h3>
                  <div className="flex-grow overflow-y-auto space-y-2 custom-scrollbar pr-1">
                    {logs.sessions && logs.sessions.length > 0 ? (
                      logs.sessions.map((session: any) => {
                        const isSelected = selectedSessionId === session.id;
                        const assistantMsgs = session.messages.filter((m: any) => m.role === 'model');
                        const ratingAvg = assistantMsgs.filter((m: any) => m.rating === 1).length;
                        return (
                          <div
                            key={session.id}
                            onClick={() => setSelectedSessionId(session.id)}
                            className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                              isSelected 
                                ? isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'
                                : isDark ? 'bg-slate-950/50 border-slate-900/50 hover:bg-slate-900/40' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/50'
                            }`}
                          >
                            <div className="flex justify-between items-center text-[10px] font-mono opacity-60 mb-2">
                              <span>{formatTime(session.created_at)}</span>
                              <span className={`px-2 py-0.5 rounded uppercase font-bold text-[8px] ${
                                session.role_mode === 'data-engineer'
                                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                  : session.role_mode === 'ai-engineer'
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              }`}>
                                {session.role_mode}
                              </span>
                            </div>
                            <div className="text-xs truncate font-medium text-slate-350">
                              {session.messages[0]?.content || "Empty chat session"}
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-mono opacity-40 mt-3.5">
                              <span>{session.messages.length} exchanges</span>
                              {ratingAvg > 0 && (
                                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                                  <ThumbsUp className="w-2.5 h-2.5" />
                                  <span>Helpful</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs opacity-50 font-mono text-center">
                        No chat logs recorded yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* 4.2 Chat Conversation Details (Right - 7 cols) */}
                <div className={`lg:col-span-7 p-6 rounded-2xl border flex flex-col h-[550px] relative ${
                  isDark ? 'bg-slate-950/40 border-slate-900' : 'bg-white border-slate-200'
                }`}>
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono opacity-60 mb-4">Conversation Transcript</h3>
                  
                  {selectedSessionId ? (
                    <div className="flex-grow overflow-y-auto space-y-4 custom-scrollbar pr-1">
                      {getSelectedSession()?.messages.map((m: any, idx: number) => (
                        <div key={m.id || idx} className="space-y-1">
                          <div className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-xl text-xs max-w-[85%] ${
                              m.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : isDark
                                  ? 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                                  : 'bg-slate-100 border border-slate-200 text-slate-900 rounded-tl-none'
                            }`}>
                              <p className="whitespace-pre-wrap">{m.content}</p>
                            </div>
                          </div>
                          
                          {/* Display RAG metadata for Assistant responses */}
                          {m.role === 'model' && (
                            <div className="pl-2 flex flex-col gap-1 text-[9px] font-mono opacity-60">
                              <div className="flex flex-wrap gap-2 text-[9px]">
                                {m.latency_ms && <span>Latency: {m.latency_ms}ms</span>}
                                {m.cost_est && <span>Cost: ${m.cost_est.toFixed(5)}</span>}
                                {m.rating && (
                                  <span className={m.rating === 1 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                                    User Feedback: {m.rating === 1 ? "👍 Helpful" : "👎 Unhelpful"}
                                  </span>
                                )}
                              </div>
                              {m.retrieved_chunks && m.retrieved_chunks.length > 0 && (
                                <details className="cursor-pointer">
                                  <summary className="hover:text-cyan-400 transition-colors">View Retrieved Chunks ({m.retrieved_chunks.length})</summary>
                                  <div className="mt-1 pl-2 space-y-1 text-[8px] max-w-[90%]">
                                    {m.retrieved_chunks.map((c: any, cidx: number) => (
                                      <div key={cidx} className="p-1 rounded bg-slate-900/50 border border-slate-850 flex justify-between">
                                        <span>[{c.source}] {c.title}</span>
                                        <span className="text-cyan-400">{(c.similarity * 100).toFixed(0)}%</span>
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-grow flex items-center justify-center text-xs opacity-50 font-mono text-center">
                      Select a conversation stream to inspect metadata.
                    </div>
                  )}
                </div>
              </div>

              {/* 5. OUTBOX LEADS PANEL (PASSCODE MASKED) */}
              <div className={`p-6 rounded-2xl border space-y-6 ${
                isDark ? 'bg-slate-950/40 border-slate-900' : 'bg-white border-slate-200'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/40 pb-4">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider font-mono opacity-60">Outbox Recruiter Outreach Gateway</h3>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Contact form submissions catalogued by intent category.</p>
                  </div>
                  
                  {/* Password entry widget */}
                  <form onSubmit={handleUnlock} className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="password"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        placeholder="Enter Developer Code"
                        disabled={isUnlocked}
                        className={`pl-8 pr-3 py-1.5 text-xs font-mono rounded-lg border focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                          isUnlocked 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : passcodeError 
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 animate-shake'
                              : isDark 
                                ? 'bg-slate-900 border-slate-800 text-white' 
                                : 'bg-white border-slate-250 text-slate-900'
                        }`}
                      />
                      {isUnlocked ? (
                        <Unlock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-emerald-400" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                      )}
                    </div>
                    {!isUnlocked && (
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-medium rounded-lg cursor-pointer transition-all"
                      >
                        Decrypt Leads
                      </button>
                    )}
                  </form>
                </div>

                {/* Leads lists */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className={`border-b border-slate-800/40 text-[10px] uppercase tracking-wider opacity-60 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        <th className="py-3 px-2">Timestamp</th>
                        <th className="py-3 px-2">Sender Name</th>
                        <th className="py-3 px-2">Email Address</th>
                        <th className="py-3 px-2">AI Intent Routing</th>
                        <th className="py-3 px-2">Subject / Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/20">
                      {logs.leads && logs.leads.length > 0 ? (
                        logs.leads.map((lead: any) => {
                          const intentColors: any = {
                            "Hiring Inquiry": "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                            "Collaboration": "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                            "General Question": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
                            "Other": "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                          };
                          return (
                            <tr key={lead.id} className="hover:bg-slate-900/10 transition-colors">
                              <td className="py-3 px-2 opacity-60 whitespace-nowrap">{formatTime(lead.created_at)}</td>
                              <td className="py-3 px-2 font-semibold text-slate-200">{lead.name}</td>
                              <td className="py-3 px-2 text-slate-350">{lead.email}</td>
                              <td className="py-3 px-2 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${intentColors[lead.intent_category] || intentColors["Other"]}`}>
                                  {lead.intent_category}
                                </span>
                              </td>
                              <td className="py-3 px-2 max-w-xs md:max-w-md">
                                <div className="font-semibold text-slate-250 truncate mb-0.5">{lead.subject}</div>
                                <div className={`text-[10px] whitespace-pre-wrap leading-relaxed ${isDark ? 'text-slate-450' : 'text-slate-550'}`}>
                                  {lead.message}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center opacity-50">
                            No outreach submissions received yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'rag' ? (
            <motion.div
              key="rag-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* RAG PLAYGROUND SEARCH BAR */}
              <div className={`p-6 rounded-2xl border text-center space-y-6 ${
                isDark ? 'bg-slate-950/40 border-slate-900 shadow-xl shadow-cyan-950/5' : 'bg-white border-slate-200 shadow-md'
              }`}>
                <div className="max-w-2xl mx-auto space-y-3">
                  <h3 className="text-lg font-semibold tracking-tight">Dynamic RAG Retrieval Sandbox</h3>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Test how the AI vector indexing engine works. Type any query (e.g. "what is his experience with PySpark?") 
                    to compute live cosine similarity embeddings and retrieve matching database context chunks.
                  </p>
                </div>

                <form onSubmit={handleRagSearch} className="max-w-2xl mx-auto flex gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={ragQuery}
                      onChange={(e) => setRagQuery(e.target.value)}
                      placeholder="Type a test query (e.g. Kubernetes projects, Education, Python experience...)"
                      className={`w-full pl-10 pr-4 py-2.5 text-xs md:text-sm rounded-xl border focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                        isDark 
                          ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' 
                          : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  </div>
                  <button
                    type="submit"
                    disabled={!ragQuery.trim() || ragSearching}
                    className="px-5 py-2.5 bg-gradient-to-tr from-[#00E5FF] to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs md:text-sm font-semibold rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/10 flex items-center gap-1.5"
                  >
                    {ragSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Query Embeddings</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* RAG SEARCH RESULTS GRID */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-semibold opacity-60 flex items-center gap-1.5 font-mono px-1">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>Semantic Database Matches</span>
                </h4>
                
                {ragResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ragResults.map((result: any, idx: number) => {
                      const scorePct = Math.round(result.similarity * 100);
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 hover:border-slate-700/80 transition-all ${
                            isDark ? 'bg-slate-950/40 border-slate-900 shadow-md shadow-cyan-950/5' : 'bg-white border-slate-200 shadow-sm'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-center gap-2">
                              <div className="flex items-center gap-2 truncate">
                                <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold shrink-0 ${
                                  result.source_file.endsWith('.json') 
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}>
                                  {result.source_file}
                                </span>
                                <span className="font-semibold text-xs md:text-sm text-slate-200 truncate">{result.chunk_title}</span>
                              </div>
                              <span className={`text-xs font-bold font-mono shrink-0 ${
                                scorePct >= 80 ? 'text-emerald-400' : scorePct >= 65 ? 'text-amber-400' : 'text-slate-450'
                              }`}>
                                {scorePct}% Cosine Match
                              </span>
                            </div>
                            
                            <div className={`relative h-1 w-full rounded-full overflow-hidden ${
                              isDark ? 'bg-slate-900' : 'bg-slate-100'
                            }`}>
                              <div
                                className={`absolute left-0 top-0 h-full rounded-full ${
                                  scorePct >= 80 ? 'bg-emerald-400' : scorePct >= 65 ? 'bg-amber-400' : 'bg-slate-400'
                                }`}
                                style={{ width: `${scorePct}%` }}
                              />
                            </div>
                          </div>

                          <div className={`p-4 rounded-xl font-mono text-[10px] md:text-xs border whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-48 custom-scrollbar ${
                            isDark ? 'bg-[#060608]/80 border-slate-900/60 text-slate-350' : 'bg-slate-50 border-slate-150 text-slate-650'
                          }`}>
                            {result.content}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={`py-16 text-center border border-dashed rounded-2xl opacity-60 ${
                    isDark ? 'border-slate-800' : 'border-slate-200'
                  }`}>
                    <div className="max-w-xs mx-auto space-y-2 font-mono text-xs">
                      <AlertCircle className="w-6 h-6 text-slate-500 mx-auto" />
                      <p>Run a search query to index and display cosine-matched context chunks.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="unanswered-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Unanswered Queries Telemetry Panel */}
              <div className="space-y-4">
                <div className="mb-6 px-1">
                  <h3 className="text-lg font-semibold tracking-tight">Unresolved Recruiter &amp; Visitor Queries</h3>
                  <p className="text-xs opacity-60 mt-1 font-mono">
                    Questions asked in the chatbot where the AI twin lacked specific RAG context. Review them to upload context to the portfolio.
                  </p>
                </div>

                {!isUnlocked ? (
                  <div className={`p-8 rounded-2xl border text-center font-mono text-xs ${
                    isDark ? 'bg-slate-950/45 border-slate-900 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <Lock className="w-5 h-5 mx-auto mb-2 text-rose-450" />
                    <p>Enter your developer passcode at the top to decrypt unresolved queries.</p>
                  </div>
                ) : unanswered.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {unanswered.map((q: any, idx: number) => (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                          isDark ? 'bg-slate-950/40 border-slate-900 shadow-md hover:border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className={`text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded ${
                            isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            PENDING CONTEXT
                          </span>
                          <h4 className={`text-sm font-semibold leading-relaxed mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            "{q.question}"
                          </h4>
                          <div className="flex items-center gap-3 text-[10px] opacity-50 font-mono mt-1">
                            <span>Session ID: {q.session_id.substring(0, 8)}...</span>
                            <span>&bull;</span>
                            <span>{formatTime(q.created_at)}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleResolveQuestion(q.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 border shrink-0 cursor-pointer ${
                            isDark 
                              ? 'bg-slate-900 border-slate-800 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30' 
                              : 'bg-slate-50 border-slate-200 text-emerald-600 hover:bg-slate-50'
                          }`}
                        >
                          Mark Resolved
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className={`py-16 text-center border border-dashed rounded-2xl opacity-60 ${
                    isDark ? 'border-slate-800' : 'border-slate-200'
                  }`}>
                    <div className="max-w-xs mx-auto space-y-2 font-mono text-xs">
                      <ThumbsUp className="w-6 h-6 text-emerald-400 mx-auto" />
                      <p>All queries fully resolved! Recruiters have found all context they searched for.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
