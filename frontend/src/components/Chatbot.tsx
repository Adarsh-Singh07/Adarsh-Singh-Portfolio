import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Bot, 
  User, 
  Loader2,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Search,
  Database,
  Cpu,
  Clock,
  DollarSign
} from 'lucide-react';
import PortfolioService from '../services/api';

// Futuristic custom bot icon with glowing concentric animate rings
const CustomBotIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <div className={`relative ${className} flex items-center justify-center`}>
    <div className="absolute inset-0 rounded-full border border-cyan-400/25 animate-[spin_6s_linear_infinite] pointer-events-none" />
    <div className="absolute inset-1 rounded-full border border-dashed border-indigo-400/35 animate-[spin_10s_linear_infinite_reverse] pointer-events-none" />
    <svg viewBox="0 0 24 24" fill="none" className="w-5.5 h-5.5 z-10 drop-shadow-[0_0_8px_rgba(0,229,255,0.85)]" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2a10 10 0 0 0-10 10c0 3.3.8 4.7 1.8 5.6v2.4a1 1 0 0 0 1.5.8l2.7-1.6c1.2.5 2.6.8 4 .8a10 10 0 0 0 10-10A10 10 0 0 0 12 2z" fill="url(#botGrad)" />
      <circle cx="9" cy="12" r="1.5" fill="#FFFFFF" />
      <circle cx="15" cy="12" r="1.5" fill="#FFFFFF" />
      <path d="M9 15.5c1.5 0.8 4.5 0.8 6 0" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="botGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

// Formatting component to handle markdown links, bold formatting, headers, list items and code tags
function FormattedMessage({ text, isDark }: { text: string; isDark: boolean }) {
  const blocks = text.split('\n');
  
  return (
    <div className="space-y-1.5 text-xs md:text-sm leading-relaxed font-sans select-text">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (trimmed === '') return <div key={idx} className="h-1.5" />;
        
        // 1. Headers Check (### or ####)
        const isHeader3 = trimmed.startsWith('###');
        const isHeader4 = trimmed.startsWith('####');
        if (isHeader3 || isHeader4) {
          const title = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 
              key={idx} 
              className={`font-semibold tracking-tight mt-3 mb-1 text-sm md:text-base ${
                isDark ? 'text-cyan-400' : 'text-sky-700'
              }`}
            >
              {title}
            </h4>
          );
        }
        
        // 2. Bullet Points Check
        const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ');
        let content = trimmed;
        if (isBullet) {
          content = content.replace(/^[*•-]\s*/, '');
        }

        const parsedElements: React.ReactNode[] = [];
        let cursor = 0;
        const tokenRegex = /(\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`)/g;
        let match;
        let keyCounter = 0;
        
        while ((match = tokenRegex.exec(content)) !== null) {
          const matchIndex = match.index;
          
          if (matchIndex > cursor) {
            parsedElements.push(
              <span key={`txt-${keyCounter++}`}>{content.substring(cursor, matchIndex)}</span>
            );
          }
          
          if (match[0].startsWith('**')) {
            parsedElements.push(
              <strong 
                key={`bold-${keyCounter++}`} 
                className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
              >
                {match[2]}
              </strong>
            );
          } else if (match[0].startsWith('`')) {
            parsedElements.push(
              <code 
                key={`code-${keyCounter++}`} 
                className={`px-1.5 py-0.5 rounded font-mono text-[10px] md:text-xs border ${
                  isDark 
                    ? 'bg-slate-950/80 border-slate-800 text-cyan-400' 
                    : 'bg-slate-100 border-slate-200 text-sky-700'
                }`}
              >
                {match[5]}
              </code>
            );
          } else {
            const label = match[3];
            const url = match[4];
            const isExternal = url.startsWith('http') || url.startsWith('mailto') || url.startsWith('tel');
            
            if (isExternal) {
              parsedElements.push(
                <a
                  key={`link-${keyCounter++}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 dark:text-cyan-400 dark:hover:text-cyan-300 light:text-sky-600 light:hover:text-sky-750 underline font-medium inline-flex items-center gap-0.5"
                >
                  {label}
                </a>
              );
            } else {
              parsedElements.push(
                <Link
                  key={`link-${keyCounter++}`}
                  to={url}
                  className="text-cyan-400 hover:text-cyan-300 dark:text-cyan-400 dark:hover:text-cyan-300 light:text-sky-600 light:hover:text-sky-750 underline font-medium transition-colors"
                >
                  {label}
                </Link>
              );
            }
          }
          
          cursor = tokenRegex.lastIndex;
        }
        
        if (cursor < content.length) {
          parsedElements.push(
            <span key={`txt-${keyCounter++}`}>{content.substring(cursor)}</span>
          );
        }
        
        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5 my-1">
              <span className="text-cyan-400 mt-2 shrink-0 block w-1.5 h-1.5 rounded-full bg-cyan-450 shadow-[0_0_6px_#00E5FF]" />
              <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                {parsedElements.length > 0 ? parsedElements : content}
              </span>
            </div>
          );
        }
        
        return (
          <p key={idx} className={isDark ? 'text-slate-200' : 'text-slate-700'}>
            {parsedElements.length > 0 ? parsedElements : block}
          </p>
        );
      })}
    </div>
  );
}

interface Message {
  role: 'user' | 'model';
  content: string;
  id?: string;
  trace?: any;
  feedback?: number; // 1 for up, -1 for down, undefined for none
}

const QUICK_STARTS = [
  "Tell me about your projects",
  "What is your core tech stack?",
  "Show me your certifications",
  "How can I contact you?"
];

export default function Chatbot({ isDark, currentMode = 'general' }: { isDark: boolean; currentMode?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [selectedTrace, setSelectedTrace] = useState<any | null>(null);
  const [models, setModels] = useState<Array<{ id: string; label: string; status: 'available' | 'exhausted' }>>([]);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Scroll to bottom on updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasNewMessage(false);
    }
  }, [messages, isOpen]);

  // Generate Session ID on load
  useEffect(() => {
    let sid = sessionStorage.getItem('portfolio-chatbot-session-id');
    if (!sid) {
      sid = 'session-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
      sessionStorage.setItem('portfolio-chatbot-session-id', sid);
    }
    setSessionId(sid);
  }, []);

  // Listen to open-chatbot custom event from spotlight cards
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
    };
    window.addEventListener('open-chatbot', handleOpenChat);
    return () => {
      window.removeEventListener('open-chatbot', handleOpenChat);
    };
  }, []);

  // Show a pulsing alert if there's a greeting reminder and chat is closed
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen && messages.length === 0) {
        setHasNewMessage(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [isOpen, messages]);

  // Fetch available models and status when chatbot is opened
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const mList = await PortfolioService.getChatModels();
        setModels(mList);
        
        // Auto-select first available model if current one is not in list or is exhausted
        const currentModelObj = mList.find(m => m.id === selectedModel);
        if (!currentModelObj || currentModelObj.status === 'exhausted') {
          const firstAvailable = mList.find(m => m.status === 'available');
          if (firstAvailable) {
            setSelectedModel(firstAvailable.id);
          }
        }
      } catch (err) {
        console.error("Failed to load models list:", err);
      }
    };
    
    if (isOpen) {
      fetchModels();
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Map history to backend format
      const historyPayload = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const res = await PortfolioService.chatWithAI(textToSend, historyPayload, sessionId, currentMode as any, selectedModel);
      
      const assistantMsg: Message = { 
        role: 'model', 
        content: res.response,
        id: res.message_id,
        trace: res.trace
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Chatbot API failed:", error);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'model', 
          content: "Addy, my AI Twin, is temporarily experiencing connection issues with Google's Gemini services (due to high demand). If you have an urgent inquiry, please feel free to email me directly at adarsh2001gop@gmail.com or submit a message through the Contact Page. A diagnostics report has been auto-sent to my email to resolve this issue." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (msgIndex: number, rating: number) => {
    const msg = messages[msgIndex];
    if (!msg.id) return;
    
    try {
      await PortfolioService.submitChatFeedback(msg.id, rating);
      setMessages(prev => {
        const next = [...prev];
        next[msgIndex] = { ...next[msgIndex], feedback: rating };
        return next;
      });
    } catch (err) {
      console.error("Failed to submit message feedback:", err);
    }
  };

  const handleQuickStart = (query: string) => {
    handleSendMessage(query);
  };

  const resetChat = () => {
    setMessages([]);
    setSelectedTrace(null);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {!isOpen && hasNewMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`mb-3 mr-1 px-4 py-2 rounded-xl shadow-xl text-xs font-medium border backdrop-blur-md flex items-center gap-1.5 ${
                isDark 
                  ? 'bg-slate-900/90 text-sky-400 border-slate-800' 
                  : 'bg-white/90 text-sky-600 border-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>Ask me anything about Adarsh!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => {
            setIsOpen(!isOpen);
            setHasNewMessage(false);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative p-3.5 rounded-full shadow-2xl flex items-center justify-center border cursor-pointer transition-all duration-300 ${
            isOpen 
              ? 'bg-slate-800 border-slate-700 text-white' 
              : 'bg-gradient-to-tr from-[#00E5FF]/95 to-indigo-600/95 text-white border-transparent shadow-[0_4px_25px_rgba(0,229,255,0.35)]'
          }`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <CustomBotIcon className="w-8 h-8" />}
          {!isOpen && hasNewMessage && (
            <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-pink-500 ring-2 ring-white animate-ping" />
          )}
        </motion.button>
      </div>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`fixed bottom-24 right-6 w-[360px] md:w-[400px] h-[550px] z-50 rounded-2xl flex flex-col shadow-2xl border overflow-hidden backdrop-blur-xl transition-all duration-300 ${
              isDark 
                ? 'bg-[#0a0a0c]/90 border-slate-800/80 text-slate-100 shadow-cyan-950/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]' 
                : 'bg-white/95 border-slate-200/80 text-slate-900 shadow-slate-300/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]'
            }`}
          >
            {/* Header */}
            <div className={`p-4 flex items-center justify-between border-b ${
              isDark ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-200 bg-slate-50/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/20 overflow-hidden">
                    <CustomBotIcon className="w-10 h-10 scale-125" />
                  </div>
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0a0a0c] animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-cyan-400">Addy</h3>
                  <p className="text-[10px] opacity-60 flex items-center gap-1">
                    <span>Adarsh's AI Twin Chatbot</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={resetChat}
                    title="Reset Chat"
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      isDark ? 'hover:bg-slate-850 text-slate-400 hover:text-white' : 'hover:bg-slate-150 text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-slate-850 text-slate-400 hover:text-white' : 'hover:bg-slate-150 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 custom-scrollbar relative">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center space-y-4 px-2">
                  <div className="p-3 rounded-full bg-sky-500/10 text-cyan-400 animate-bounce">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-semibold">Meet Addy, Adarsh's AI Twin</h4>
                    <p className={`text-xs max-w-[280px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      I'm Addy, a digital copy of Adarsh trained on his skills, experience, and certifications. Let's chat!
                    </p>
                  </div>
                  
                  {/* Suggested Chips */}
                  <div className="w-full pt-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-wider font-semibold opacity-40 text-left px-1">Suggested Questions</p>
                    <div className="grid grid-cols-1 gap-2">
                      {QUICK_STARTS.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickStart(q)}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between group cursor-pointer ${
                            isDark 
                              ? 'bg-slate-900/50 hover:bg-slate-900 border-slate-800 text-slate-350 hover:text-white' 
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-650 hover:text-slate-900'
                          }`}
                        >
                          <span>{q}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pb-2">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className="group flex flex-col space-y-1"
                    >
                      <div className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role !== 'user' && (
                          <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/25 flex items-center justify-center shrink-0 mt-0.5">
                            <Bot className="w-4 h-4 text-cyan-400" />
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 shadow-sm max-w-[80%] ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-tr from-sky-600 to-indigo-600 text-white rounded-tr-none'
                              : isDark
                                ? 'bg-slate-900/70 border border-slate-800/40 text-slate-100 rounded-tl-none'
                                : 'bg-slate-100/80 border border-slate-200/60 text-slate-900 rounded-tl-none'
                          }`}
                        >
                          <FormattedMessage text={msg.content} isDark={isDark} />
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center shrink-0 mt-0.5">
                            <User className="w-4 h-4 text-indigo-400" />
                          </div>
                        )}
                      </div>

                      {/* Developer feedback / RAG inspection bar */}
                      {msg.role !== 'user' && msg.id && (
                        <div className={`flex items-center gap-2 pl-9 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-250 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          <button
                            onClick={() => handleFeedback(index, 1)}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              msg.feedback === 1 
                                ? 'text-emerald-400 bg-emerald-500/15' 
                                : isDark ? 'text-slate-500 hover:text-slate-350 hover:bg-slate-800/60' : 'text-slate-450 hover:text-slate-750 hover:bg-slate-200'
                            }`}
                            title="Helpful response"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleFeedback(index, -1)}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              msg.feedback === -1 
                                ? 'text-rose-400 bg-rose-500/15' 
                                : isDark ? 'text-slate-500 hover:text-slate-350 hover:bg-slate-800/60' : 'text-slate-450 hover:text-slate-750 hover:bg-slate-200'
                            }`}
                            title="Unhelpful response"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                          {msg.trace && (
                            <button
                              onClick={() => setSelectedTrace(msg.trace)}
                              className={`p-1 rounded transition-colors cursor-pointer flex items-center gap-1 font-mono text-[9px] ${
                                isDark ? 'text-cyan-400/80 hover:text-cyan-300 hover:bg-slate-800/60' : 'text-sky-600/80 hover:text-sky-500 hover:bg-slate-200'
                              }`}
                              title="Inspect RAG Trace"
                            >
                              <Search className="w-3 h-3" />
                              <span>Inspect RAG</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-2.5 justify-start">
                      <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/25 flex items-center justify-center shrink-0">
                        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                      </div>
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 rounded-tl-none max-w-[80%] border ${
                          isDark 
                            ? 'bg-slate-900/50 border-slate-800/40' 
                            : 'bg-slate-100/50 border-slate-200/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs opacity-60">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                          <span className="ml-1 text-[9px] uppercase tracking-wider font-semibold animate-pulse text-cyan-400">Addy is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className={`p-3 border-t ${
              isDark ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-200 bg-slate-50/50'
            }`}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className={`flex-grow px-3 py-2 text-xs md:text-sm rounded-xl border focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                    isDark 
                      ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' 
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                    input.trim() && !isLoading
                      ? 'bg-gradient-to-tr from-cyan-400 to-indigo-600 text-white shadow-md shadow-cyan-500/10'
                      : isDark
                        ? 'bg-slate-900 text-slate-600 border border-slate-800'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              {models.length > 0 ? (
                <div className="mt-2 flex items-center justify-between gap-2 px-1">
                  <div className="text-[8px] opacity-45 uppercase tracking-wider font-mono">
                    LLM ENGINE
                  </div>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className={`text-[9px] font-mono font-semibold bg-transparent border-0 focus:ring-0 focus:outline-none cursor-pointer text-right max-w-[180px] p-0 ${
                      isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-sky-600 hover:text-sky-500'
                    }`}
                  >
                    {models.map((m) => (
                      <option
                        key={m.id}
                        value={m.id}
                        disabled={m.status === 'exhausted'}
                        className={isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}
                      >
                        {m.label} {m.status === 'exhausted' ? '⚠️ (EXHAUSTED)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="mt-2 text-[8px] opacity-40 text-center">
                  Powered by Gemini & RAG
                </div>
              )}
            </div>

            {/* RAG Trace Inspector Overlay Slide-up */}
            <AnimatePresence>
              {selectedTrace && (
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 220 }}
                  className={`absolute inset-0 z-30 flex flex-col ${
                    isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
                  }`}
                >
                  {/* Trace Header */}
                  <div className={`p-4 flex items-center justify-between border-b ${
                    isDark ? 'border-slate-800' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold">
                      <Search className="w-4 h-4" />
                      <span>RAG TELEMETRY INSPECTOR</span>
                    </div>
                    <button
                      onClick={() => setSelectedTrace(null)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Trace Content */}
                  <div className="flex-grow p-4 overflow-y-auto space-y-4 font-mono text-[10px] md:text-xs">
                    {/* Model banner */}
                    {selectedTrace.model_used && (
                      <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                        isDark ? 'bg-slate-900/60 border-slate-800/80 text-cyan-400' : 'bg-slate-50 border-slate-200 text-sky-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4" />
                          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold opacity-85">AI LLM Model Engine</span>
                        </div>
                        <span className="font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">{selectedTrace.model_used}</span>
                      </div>
                    )}

                    {/* Performance metrics grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center ${
                        isDark ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <Clock className="w-3.5 h-3.5 text-amber-400 mb-1" />
                        <span className="opacity-60 text-[9px] uppercase tracking-wider">Latency</span>
                        <span className="font-semibold text-xs mt-0.5">{selectedTrace.latency_ms}ms</span>
                      </div>
                      <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center ${
                        isDark ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <Cpu className="w-3.5 h-3.5 text-indigo-400 mb-1" />
                        <span className="opacity-60 text-[9px] uppercase tracking-wider">Tokens</span>
                        <span className="font-semibold text-xs mt-0.5">{selectedTrace.tokens_input + selectedTrace.tokens_output}</span>
                      </div>
                      <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center ${
                        isDark ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400 mb-1" />
                        <span className="opacity-60 text-[9px] uppercase tracking-wider">Cost (Est)</span>
                        <span className="font-semibold text-xs mt-0.5 text-emerald-500">
                          ${selectedTrace.cost_est.toFixed(6)}
                        </span>
                      </div>
                    </div>

                    {/* Retrieved context chunks */}
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] uppercase tracking-wider font-semibold opacity-60 flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Retrieved Context Chunks</span>
                      </h4>
                      <div className="space-y-2">
                        {selectedTrace.chunks && selectedTrace.chunks.length > 0 ? (
                          selectedTrace.chunks.map((chunk: any, idx: number) => {
                            const scorePct = Math.round(chunk.similarity * 100);
                            return (
                              <div
                                key={idx}
                                className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
                                  isDark ? 'bg-slate-900/35 border-slate-800/50 hover:bg-slate-900/50' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold shrink-0 ${
                                      chunk.source.endsWith('.json') 
                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    }`}>
                                      {chunk.source}
                                    </span>
                                    <span className="font-semibold truncate text-slate-350">{chunk.title}</span>
                                  </div>
                                  <span className={`text-[10px] font-bold shrink-0 ${
                                    scorePct >= 80 ? 'text-emerald-400' : scorePct >= 65 ? 'text-amber-400' : 'text-slate-450'
                                  }`}>
                                    {scorePct}% match
                                  </span>
                                </div>
                                <div className={`relative h-1 w-full rounded-full overflow-hidden ${
                                  isDark ? 'bg-slate-800' : 'bg-slate-200'
                                }`}>
                                  <div
                                    className={`absolute left-0 top-0 h-full rounded-full ${
                                      scorePct >= 80 ? 'bg-emerald-400' : scorePct >= 65 ? 'bg-amber-400' : 'bg-slate-400'
                                    }`}
                                    style={{ width: `${scorePct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-4 opacity-50">No RAG chunks retrieved.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
