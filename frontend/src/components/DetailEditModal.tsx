/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Edit, 
  Trash2, 
  Save, 
  Eye, 
  Github, 
  ExternalLink, 
  Award, 
  Calendar, 
  Tag, 
  Plus, 
  ArrowRight, 
  Loader2,
  Mail,
  Linkedin,
  MapPin,
  Clock,
  Cpu,
  Cloud,
  Database,
  Zap,
  Infinity as InfinityIcon,
  ShieldCheck,
  CheckCircle2,
  Copy
} from 'lucide-react';

interface DetailEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'project' | 'certification' | 'blog' | 'homeCard' | 'coordinates' | 'strength' | 'skills';
  item: any; // If null, acts as "Add New" mode
  onSave: (updatedItem: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  isAdmin: boolean;
  isDark: boolean;
}

// Icon renderer based on string name
const renderDynamicIcon = (iconName: string, className = "w-6 h-6") => {
  switch (iconName?.toLowerCase()) {
    case 'cpu': return <Cpu className={className} />;
    case 'cloud': return <Cloud className={className} />;
    case 'database': return <Database className={className} />;
    case 'zap': return <Zap className={className} />;
    case 'infinity': return <InfinityIcon className={className} />;
    case 'shieldcheck':
    case 'shield-check': return <ShieldCheck className={className} />;
    case 'mail': return <Mail className={className} />;
    case 'linkedin': return <Linkedin className={className} />;
    case 'github': return <Github className={className} />;
    case 'mappin':
    case 'map-pin': return <MapPin className={className} />;
    case 'clock': return <Clock className={className} />;
    default: return <Award className={className} />;
  }
};

// Brand SVGs for verified credentials in modal
const MicrosoftLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h11v11H0z" fill="#F25022"/>
    <path d="M12 0h11v11H12z" fill="#7FBA00"/>
    <path d="M0 12h11v11H0z" fill="#00A4EF"/>
    <path d="M12 12h11v11H12z" fill="#FFB900"/>
  </svg>
);

const GoogleCloudLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.04 20.73L3.82 16v-9.5l8.22-4.73 8.22 4.73V16l-8.22 4.73z" fill="#F4B400" opacity="0.15" />
    <path d="M12.04 2.23L3.82 6.97v9.49l8.22 4.75 8.22-4.75V6.97l-8.22-4.74zm0 2.87l5.72 3.3v6.61l-5.72 3.3-5.72-3.3V8.4l5.72-3.3z" fill="#4285F4" />
    <path d="M12.04 5.1L6.32 8.4v6.61l5.72 3.3V5.1z" fill="#34A853" />
    <path d="M12.04 11.7l5.72-3.3v6.61l-5.72 3.3v-6.61z" fill="#EA4335" />
  </svg>
);

const AWSLogo = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.2 20.9c-4.9 0-8.9-3-8.9-6.7 0-2.3 1.6-4.3 4.1-5.4.3-.1.6.1.6.4v.1c0 .2-.1.4-.4.5C5.5 10.7 4.3 12.3 4.3 14.2c0 3 3.5 5.5 7.9 5.5.9 0 1.8-.1 2.6-.4.3-.1.6.1.7.3.1.2 0 .5-.2.6-.9.4-2 .7-3.1.7zm5.5-3.6c-.3 0-.6-.2-.7-.4l-2.4-3.8c-.1-.2-.1-.4 0-.6s.3-.3.5-.3h4.7c.3 0 .5.1.6.3s.1.4 0 .6l-2.4 3.8c-.1.2-.2.4-.3.4zm.5-8.5v3.1c0 .4-.3.7-.7.7h-3.1c-.4 0-.7-.3-.7-.7V8.8c0-.4.3-.7.7-.7H17.5c.4 0 .7.3.7.7z" fill="#FF9900"/>
  </svg>
);

const CourseraLogo = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fill="#0056B3"/>
    <path d="M14.5 15.5a3.5 3.5 0 0 1-3.5-3.5 3.5 3.5 0 0 1 3.5-3.5h1v-2h-1a5.5 5.5 0 0 0-5.5 5.5 5.5 5.5 0 0 0 5.5 5.5h1v-2h-1z" fill="#FFFFFF"/>
  </svg>
);

const getIssuerTheme = (issuer: string, isDark: boolean) => {
  const norm = (issuer || '').toLowerCase();
  
  if (norm.includes('google') || norm.includes('gcp') || norm.includes('cloud')) {
    return {
      logoBtn: (
        <div className="w-20 h-20 rounded-3xl bg-[#4285F4]/10 border border-[#4285F4]/20 flex items-center justify-center text-[#4285F4] transition-all duration-300">
          <GoogleCloudLogo className="w-10 h-10" />
        </div>
      )
    };
  }
  
  if (norm.includes('microsoft') || norm.includes('azure')) {
    return {
      logoBtn: (
        <div className="w-20 h-20 rounded-3xl bg-[#7FBA00]/10 border border-[#7FBA00]/20 flex items-center justify-center text-[#7FBA00] transition-all duration-300">
          <MicrosoftLogo className="w-9 h-9" />
        </div>
      )
    };
  }
  
  if (norm.includes('amazon') || norm.includes('aws') || norm.includes('services')) {
    return {
      logoBtn: (
        <div className="w-20 h-20 rounded-3xl bg-[#FF9900]/10 border border-[#FF9900]/20 flex items-center justify-center text-[#FF9900] transition-all duration-300">
          <AWSLogo className="w-11 h-11" />
        </div>
      )
    };
  }
  
  if (norm.includes('coursera')) {
    return {
      logoBtn: (
        <div className="w-20 h-20 rounded-3xl bg-[#0056B3]/10 border border-[#0056B3]/25 flex items-center justify-center text-[#0056B3] transition-all duration-300">
          <CourseraLogo className="w-10 h-10" />
        </div>
      )
    };
  }
  
  return {
    logoBtn: (
      <div className="w-20 h-20 rounded-3xl bg-[#007AFF]/10 border border-[#007AFF]/20 flex items-center justify-center text-[#007AFF] transition-all duration-300">
        <Award className="w-10 h-10" />
      </div>
    )
  };
};

export default function DetailEditModal({
  isOpen,
  onClose,
  type,
  item,
  onSave,
  onDelete,
  isAdmin,
  isDark
}: DetailEditModalProps) {
  const navigate = useNavigate();
  const isCreateMode = !item;
  const [isEditing, setIsEditing] = useState(isCreateMode);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [copied, setCopied] = useState(false);

  const handleHomeCardAction = () => {
    if (!item) return;
    onClose();
    if (item.id === 'ai-assistant') {
      window.dispatchEvent(new CustomEvent('open-chatbot'));
    } else if (item.id === 'availability') {
      navigate('/timeline');
    } else if (item.id === 'featured-stack') {
      navigate('/skills');
    } else if (item.id === 'quick-connect') {
      navigate('/contact');
    }
  };

  // Initialize form fields
  useEffect(() => {
    if (item) {
      setFormData(JSON.parse(JSON.stringify(item))); // Deep copy
      setIsEditing(false);
    } else {
      // Default templates for creation
      if (type === 'project') {
        setFormData({
          id: 'project-' + Date.now(),
          title: '',
          description: '',
          technologies: [],
          metrics: [],
          githubUrl: '',
          demoUrl: '',
          status: 'In Progress',
          featured: false,
          priority: { general: 5, 'data-engineer': 5, 'ai-engineer': 5 }
        });
      } else if (type === 'certification') {
        setFormData({
          id: 'cert-' + Date.now(),
          title: '',
          issuer: '',
          code: '',
          date: '',
          credentialUrl: '',
          badgeUrl: '',
          featured: false,
          priority: { general: 5, 'data-engineer': 5, 'ai-engineer': 5 }
        });
      } else if (type === 'blog') {
        setFormData({
          id: 'blog-' + Date.now(),
          title: '',
          excerpt: '',
          readTime: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          url: '#',
          content: '',
          priority: { general: 5, 'data-engineer': 5, 'ai-engineer': 5 }
        });
      } else if (type === 'homeCard') {
        setFormData({
          id: 'card-' + Date.now(),
          title: '',
          subtitle: '',
          description: '',
          buttonText: '',
          badge: '',
          extra: []
        });
      } else if (type === 'coordinates') {
        setFormData({
          email: '',
          linkedin: '',
          github: '',
          location: '',
          hours: ''
        });
      } else if (type === 'strength') {
        setFormData({
          id: 'strength-' + Date.now(),
          title: '',
          desc: '',
          signal: '',
          icon: 'Database'
        });
      } else if (type === 'skills') {
        setFormData({
          id: 'skills-' + Date.now(),
          title: '',
          skills: [
            { name: '', level: 'Expert' }
          ],
          priority: { general: 5, 'data-engineer': 5, 'ai-engineer': 5 }
        });
      }
      setIsEditing(true);
    }
    setCopied(false);
  }, [item, type, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      setIsEditing(false);
      if (isCreateMode) {
        onClose();
      }
    } catch (err) {
      console.error('Failed to save item:', err);
      alert('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !item) return;
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    setLoading(true);
    try {
      await onDelete(item.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper arrays editors
  const handleStringListChange = (field: string, val: string) => {
    const list = val.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: list }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as any }}
          className={`relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-[32px] border p-6 md:p-10 shadow-2xl z-10 scrollbar-thin ${
            isDark 
              ? 'bg-neutral-950/90 border-white/10 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]' 
              : 'bg-white border-neutral-200 text-neutral-900 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]'
          }`}
        >
          {/* Top Actions Row */}
          <div className="flex items-center justify-between border-b pb-4 mb-6 border-neutral-800">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#007AFF] font-bold">
              {type} details
            </span>
            <div className="flex items-center gap-2">
              {isAdmin && !isCreateMode && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold tracking-wider transition-all duration-300 ${
                    isEditing
                      ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                      : isDark
                        ? 'bg-neutral-900 border-white/10 hover:border-white/20 text-slate-300 hover:text-white'
                        : 'bg-slate-50 border-neutral-200 hover:border-neutral-300 text-slate-600'
                  }`}
                >
                  {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
                  <span>{isEditing ? 'View Mode' : 'Edit Mode'}</span>
                </button>
              )}
              <button
                onClick={onClose}
                className={`p-2 rounded-full border transition-all duration-300 ${
                  isDark 
                    ? 'border-white/10 bg-neutral-900 hover:border-white/20 hover:text-white text-slate-400' 
                    : 'border-neutral-200 bg-slate-50 hover:border-neutral-300 hover:text-neutral-950 text-slate-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form / Content Area */}
          <form onSubmit={handleSave}>
            {isEditing ? (
              // EDIT MODE FORM
              <div className="flex flex-col gap-5">
                {/* 1. PROJECT EDITOR */}
                {type === 'project' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Project Title</label>
                        <input
                          type="text"
                          required
                          value={formData.title || ''}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Status Badge</label>
                        <select
                          value={formData.status || 'In Progress'}
                          onChange={e => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-neutral-900 text-sm focus:outline-none focus:border-[#007AFF] border-neutral-850"
                        >
                          <option value="Deployed">Deployed</option>
                          <option value="Beta">Beta</option>
                          <option value="In Progress">In Progress</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Project Description</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.description || ''}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">GitHub Repository URL</label>
                        <input
                          type="url"
                          value={formData.githubUrl || ''}
                          onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Demo Endpoint URL</label>
                        <input
                          type="url"
                          value={formData.demoUrl || ''}
                          onChange={e => setFormData({ ...formData, demoUrl: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Technologies (Comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Python, PySpark, Azure Databricks"
                        value={formData.technologies ? formData.technologies.join(', ') : ''}
                        onChange={e => handleStringListChange('technologies', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                      />
                    </div>

                    {/* Impact Metrics Editor */}
                    <div className="border border-neutral-800 p-4 rounded-2xl bg-neutral-900/10">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">Operational Impact Metrics</label>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...(formData.metrics || [])];
                            updated.push({ value: '', label: '' });
                            setFormData({ ...formData, metrics: updated });
                          }}
                          className="px-2.5 py-1 bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF]/20 text-[10px] font-bold rounded-lg border border-[#007AFF]/25 flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Metric</span>
                        </button>
                      </div>
                      <div className="flex flex-col gap-2">
                        {(formData.metrics || []).map((m: any, idx: number) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input
                              type="text"
                              required
                              placeholder="Value (e.g. 98% or 3.2s)"
                              value={m.value || ''}
                              onChange={e => {
                                const updated = [...formData.metrics];
                                updated[idx] = { ...updated[idx], value: e.target.value };
                                setFormData({ ...formData, metrics: updated });
                              }}
                              className="w-1/3 px-3 py-2 rounded-lg border bg-transparent text-xs text-white focus:outline-none border-neutral-800"
                            />
                            <input
                              type="text"
                              required
                              placeholder="Label (e.g. Accuracy or Latency reduction)"
                              value={m.label || ''}
                              onChange={e => {
                                const updated = [...formData.metrics];
                                updated[idx] = { ...updated[idx], label: e.target.value };
                                setFormData({ ...formData, metrics: updated });
                              }}
                              className="flex-1 px-3 py-2 rounded-lg border bg-transparent text-xs text-white focus:outline-none border-neutral-800"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.metrics.filter((_: any, i: number) => i !== idx);
                                setFormData({ ...formData, metrics: updated });
                              }}
                              className="p-2 rounded-lg border border-red-500/10 hover:border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        {(!formData.metrics || formData.metrics.length === 0) && (
                          <span className="text-[10px] text-slate-500 font-mono italic block py-2">No impact metrics defined for this project.</span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* 2. CERTIFICATION EDITOR */}
                {type === 'certification' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Certificate Title</label>
                        <input
                          type="text"
                          required
                          value={formData.title || ''}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Issuer Institution</label>
                        <select
                          value={formData.issuer || ''}
                          onChange={e => setFormData({ ...formData, issuer: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-neutral-900 text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800 text-white"
                        >
                          <option value="">Select Issuer</option>
                          <option value="Microsoft">Microsoft</option>
                          <option value="AWS">AWS</option>
                          <option value="Google Cloud">Google Cloud</option>
                          <option value="Coursera">Coursera</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Credential ID / Code</label>
                        <input
                          type="text"
                          value={formData.code || ''}
                          onChange={e => setFormData({ ...formData, code: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Issue Date (YYYY-MM)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 2024-03"
                          value={formData.date || ''}
                          onChange={e => setFormData({ ...formData, date: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Verification URL</label>
                        <input
                          type="url"
                          value={formData.credentialUrl || ''}
                          onChange={e => setFormData({ ...formData, credentialUrl: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Badge Photo Path (Optional)</label>
                        <input
                          type="text"
                          value={formData.badgeUrl || ''}
                          onChange={e => setFormData({ ...formData, badgeUrl: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* 3. BLOG POST EDITOR */}
                {type === 'blog' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Blog Title</label>
                        <input
                          type="text"
                          required
                          value={formData.title || ''}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Blog Category</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Data Lakes or Neural Networks"
                          value={formData.category || ''}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Reading Time</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 5 min read"
                          value={formData.readTime || ''}
                          onChange={e => setFormData({ ...formData, readTime: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Publish Date</label>
                        <input
                          type="date"
                          required
                          value={formData.date || ''}
                          onChange={e => setFormData({ ...formData, date: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">External URL (Optional)</label>
                        <input
                          type="text"
                          value={formData.url || '#'}
                          onChange={e => setFormData({ ...formData, url: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Brief Excerpt</label>
                      <input
                        type="text"
                        required
                        value={formData.excerpt || ''}
                        onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Full Article Content (Markdown or Text)</label>
                      <textarea
                        rows={12}
                        value={formData.content || ''}
                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Write the full blog post content here..."
                        className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none font-mono focus:border-[#007AFF] border-neutral-800 resize-y"
                      />
                    </div>
                  </>
                )}

                {/* 4. HOME CARD EDITOR */}
                {type === 'homeCard' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Card Title</label>
                        <input
                          type="text"
                          required
                          value={formData.title || ''}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Subtitle / Tag</label>
                        <input
                          type="text"
                          required
                          value={formData.subtitle || ''}
                          onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Badge Name</label>
                        <input
                          type="text"
                          required
                          value={formData.badge || ''}
                          onChange={e => setFormData({ ...formData, badge: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Button Text</label>
                        <input
                          type="text"
                          required
                          value={formData.buttonText || ''}
                          onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Card Description</label>
                      <textarea
                        required
                        rows={3}
                        value={formData.description || ''}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Extra Details (Comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Email: adarsh@gmail.com, Resume: Available"
                        value={formData.extra ? formData.extra.join(', ') : ''}
                        onChange={e => handleStringListChange('extra', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                      />
                    </div>
                  </>
                )}

                {/* 5. COORDINATES EDITOR */}
                {type === 'coordinates' && (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Direct Mail Endpoint</label>
                      <input
                        type="text"
                        required
                        value={formData.email || ''}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Professional Network (LinkedIn URL)</label>
                      <input
                        type="text"
                        required
                        value={formData.linkedin || ''}
                        onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Source Repository (GitHub URL)</label>
                      <input
                        type="text"
                        required
                        value={formData.github || ''}
                        onChange={e => setFormData({ ...formData, github: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Operational Location</label>
                      <input
                        type="text"
                        required
                        value={formData.location || ''}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Response Hours</label>
                      <input
                        type="text"
                        required
                        value={formData.hours || ''}
                        onChange={e => setFormData({ ...formData, hours: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                      />
                    </div>
                  </>
                )}

                {/* 6. STRENGTH EDITOR */}
                {type === 'strength' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Strength Title</label>
                        <input
                          type="text"
                          required
                          value={formData.title || ''}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Trust Signal Badge</label>
                        <input
                          type="text"
                          required
                          value={formData.signal || ''}
                          onChange={e => setFormData({ ...formData, signal: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Dynamic Icon Name</label>
                      <select
                        value={formData.icon || 'Database'}
                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border bg-neutral-900 text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800 text-white"
                      >
                        <option value="Database">Database / Storage</option>
                        <option value="Cpu">CPU / AI Core</option>
                        <option value="Cloud">Cloud Infrastructure</option>
                        <option value="Zap">Zap / Fast APIs</option>
                        <option value="Infinity">Infinity / Automation</option>
                        <option value="ShieldCheck">ShieldCheck / CV Security</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Description</label>
                      <textarea
                        required
                        rows={3}
                        value={formData.desc || ''}
                        onChange={e => setFormData({ ...formData, desc: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800 resize-none"
                      />
                    </div>
                  </>
                )}

                {/* 7. SKILLS CATEGORY EDITOR */}
                {type === 'skills' && (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Category Title</label>
                      <input
                        type="text"
                        required
                        value={formData.title || ''}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                      />
                    </div>

                    <div className="space-y-3">
                      <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">Skills Tag List</span>
                      {(formData.skills || []).map((skill: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3">
                          <input
                            type="text"
                            required
                            placeholder="Skill name (e.g. Python)"
                            value={skill.name || ''}
                            onChange={e => {
                              const newSkills = [...(formData.skills || [])];
                              newSkills[idx] = { ...newSkills[idx], name: e.target.value };
                              setFormData({ ...formData, skills: newSkills });
                            }}
                            className="flex-grow px-3 py-2 text-xs rounded-xl border bg-transparent focus:outline-none focus:border-[#007AFF] border-neutral-850"
                          />
                          <select
                            value={skill.level || 'Expert'}
                            onChange={e => {
                              const newSkills = [...(formData.skills || [])];
                              newSkills[idx] = { ...newSkills[idx], level: e.target.value };
                              setFormData({ ...formData, skills: newSkills });
                            }}
                            className="w-32 px-3 py-2 text-xs rounded-xl border bg-neutral-900 focus:outline-none focus:border-[#007AFF] border-neutral-850 text-white animate-none"
                          >
                            <option value="Expert">Expert</option>
                            <option value="Proficient">Proficient</option>
                            <option value="Intermediate">Intermediate</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const newSkills = (formData.skills || []).filter((_: any, sIdx: number) => sIdx !== idx);
                              setFormData({ ...formData, skills: newSkills });
                            }}
                            className="p-2 border border-rose-500/20 hover:border-rose-500 text-rose-500 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newSkills = [...(formData.skills || []), { name: '', level: 'Expert' }];
                          setFormData({ ...formData, skills: newSkills });
                        }}
                        className="px-3 py-1.5 border border-dashed border-[#007AFF] text-[#007AFF] text-[10px] font-semibold rounded-lg hover:bg-[#007AFF]/10 cursor-pointer transition-colors flex items-center gap-1 w-fit"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Skill Tag</span>
                      </button>
                    </div>
                  </>
                )}

                {/* Priority Configurations with Checkbox Keep/Hide filters */}
                {type !== 'homeCard' && type !== 'coordinates' && type !== 'strength' && (
                  <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/30 flex flex-col gap-4">
                    <span className="text-[10px] font-mono uppercase text-[#007AFF] tracking-wider font-bold">Keep or Hide per Switcher Profile Role</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* General Column */}
                      <div className="flex flex-col gap-2 p-3 rounded-xl border border-neutral-800 bg-neutral-950/20">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={formData.priority?.general !== undefined && formData.priority?.general !== 99}
                            onChange={e => {
                              const isChecked = e.target.checked;
                              const updated = { ...(formData.priority || {}) };
                              updated.general = isChecked ? 1 : 99;
                              setFormData({ ...formData, priority: updated });
                            }}
                            className="w-4 h-4 rounded accent-[#007AFF]"
                          />
                          <span className="text-xs font-semibold text-slate-300">Show in General</span>
                        </label>
                        {formData.priority?.general !== undefined && formData.priority?.general !== 99 && (
                          <div className="mt-1">
                            <label className="block text-[9px] uppercase text-slate-500 mb-0.5">Priority Order Position</label>
                            <input
                              type="number"
                              min="1"
                              value={formData.priority?.general ?? 5}
                              onChange={e => setFormData({
                                ...formData,
                                priority: { ...(formData.priority || {}), general: parseInt(e.target.value) || 1 }
                              })}
                              className="w-full px-2.5 py-1 rounded border bg-transparent text-xs text-white focus:outline-none border-neutral-800"
                            />
                          </div>
                        )}
                      </div>

                      {/* Data Engineer Column */}
                      <div className="flex flex-col gap-2 p-3 rounded-xl border border-neutral-800 bg-neutral-950/20">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={formData.priority?.['data-engineer'] !== undefined && formData.priority?.['data-engineer'] !== 99}
                            onChange={e => {
                              const isChecked = e.target.checked;
                              const updated = { ...(formData.priority || {}) };
                              updated['data-engineer'] = isChecked ? 1 : 99;
                              setFormData({ ...formData, priority: updated });
                            }}
                            className="w-4 h-4 rounded accent-[#007AFF]"
                          />
                          <span className="text-xs font-semibold text-slate-300">Show in Data Eng</span>
                        </label>
                        {formData.priority?.['data-engineer'] !== undefined && formData.priority?.['data-engineer'] !== 99 && (
                          <div className="mt-1">
                            <label className="block text-[9px] uppercase text-slate-500 mb-0.5">Priority Order Position</label>
                            <input
                              type="number"
                              min="1"
                              value={formData.priority?.['data-engineer'] ?? 5}
                              onChange={e => setFormData({
                                ...formData,
                                priority: { ...(formData.priority || {}), 'data-engineer': parseInt(e.target.value) || 1 }
                              })}
                              className="w-full px-2.5 py-1 rounded border bg-transparent text-xs text-white focus:outline-none border-neutral-800"
                            />
                          </div>
                        )}
                      </div>

                      {/* AI Engineer Column */}
                      <div className="flex flex-col gap-2 p-3 rounded-xl border border-neutral-800 bg-neutral-950/20">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={formData.priority?.['ai-engineer'] !== undefined && formData.priority?.['ai-engineer'] !== 99}
                            onChange={e => {
                              const isChecked = e.target.checked;
                              const updated = { ...(formData.priority || {}) };
                              updated['ai-engineer'] = isChecked ? 1 : 99;
                              setFormData({ ...formData, priority: updated });
                            }}
                            className="w-4 h-4 rounded accent-[#007AFF]"
                          />
                          <span className="text-xs font-semibold text-slate-300">Show in Gen AI</span>
                        </label>
                        {formData.priority?.['ai-engineer'] !== undefined && formData.priority?.['ai-engineer'] !== 99 && (
                          <div className="mt-1">
                            <label className="block text-[9px] uppercase text-slate-500 mb-0.5">Priority Order Position</label>
                            <input
                              type="number"
                              min="1"
                              value={formData.priority?.['ai-engineer'] ?? 5}
                              onChange={e => setFormData({
                                ...formData,
                                priority: { ...(formData.priority || {}), 'ai-engineer': parseInt(e.target.value) || 1 }
                              })}
                              className="w-full px-2.5 py-1 rounded border bg-transparent text-xs text-white focus:outline-none border-neutral-800"
                            />
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex items-center justify-between border-t border-neutral-800 pt-5 mt-4">
                  {onDelete && !isCreateMode ? (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-4 py-2 border border-red-500/20 rounded-xl flex items-center gap-1.5 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    {!isCreateMode && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-neutral-800 text-slate-300 border-neutral-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-[#007AFF] hover:bg-[#007AFF]/90 disabled:opacity-60 text-white rounded-xl flex items-center gap-1.5 text-xs font-semibold shadow-glow cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : item ? (
              // READ ONLY DETAILS VIEW
              <div className="flex flex-col gap-6">
                
                {/* 1. PROJECT VIEW */}
                {type === 'project' && (
                  <>
                    <div className="flex items-start justify-between">
                      <h2 className="text-2xl font-bold font-sans tracking-tight">{item.title}</h2>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'Deployed' 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                          : item.status === 'Beta'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                            : 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-neutral-700'}`}>
                      {item.description}
                    </p>

                    {item.technologies && item.technologies.length > 0 && (
                      <div>
                        <span className="block text-[10px] uppercase font-mono tracking-widest text-[#007AFF] font-bold mb-3">Technologies Showcase</span>
                        <div className="flex flex-wrap gap-2">
                          {item.technologies.map((tech: string) => (
                            <span 
                              key={tech}
                              className={`px-3 py-1.5 rounded-xl text-xs border ${
                                isDark 
                                  ? 'bg-white/5 border-white/10 text-slate-300' 
                                  : 'bg-slate-50 border-neutral-200 text-neutral-800'
                              }`}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.metrics && item.metrics.length > 0 && (
                      <div>
                        <span className="block text-[10px] uppercase font-mono tracking-widest text-[#007AFF] font-bold mb-3">Operational Impact Metrics</span>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {item.metrics.map((met: any) => (
                            <div 
                              key={met.label}
                              className={`p-4 rounded-2xl border ${
                                isDark ? 'bg-neutral-900/40 border-white/5' : 'bg-slate-50 border-neutral-200/50'
                              }`}
                            >
                              <span className="block text-2xl font-bold tracking-tight text-[#007AFF]">{met.value}</span>
                              <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mt-1">{met.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-4 border-t border-neutral-800 pt-5">
                      {item.githubUrl && (
                        <a
                          href={item.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-white/10 rounded-xl flex items-center gap-2 text-xs font-semibold text-white transition-colors cursor-pointer"
                        >
                          <Github className="w-4 h-4" />
                          <span>Verify Source Code</span>
                        </a>
                      )}
                      {item.demoUrl && (
                        <a
                          href={item.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 bg-[#007AFF] hover:bg-[#007AFF]/90 rounded-xl flex items-center gap-2 text-xs font-semibold text-white transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Launch Live Demo</span>
                        </a>
                      )}
                    </div>
                  </>
                )}

                {/* 2. CERTIFICATION VIEW */}
                {type === 'certification' && (
                  <div className="flex flex-col items-center text-center py-4">
                    {item.badgeUrl ? (
                      <>
                        <img 
                          src={item.badgeUrl} 
                          alt="Badge" 
                          className="w-24 h-24 object-contain mb-6 drop-shadow-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = document.getElementById('modal-fallback-badge');
                            if (fallback) fallback.style.display = 'block';
                          }}
                        />
                        <div id="modal-fallback-badge" style={{ display: 'none' }} className="mb-6">
                          {getIssuerTheme(item.issuer, isDark).logoBtn}
                        </div>
                      </>
                    ) : (
                      <div className="mb-6">
                        {getIssuerTheme(item.issuer, isDark).logoBtn}
                      </div>
                    )}

                    <h2 className="text-xl font-bold font-sans tracking-tight mb-2">{item.title}</h2>
                    <span className="text-sm font-semibold text-[#007AFF] mb-1">{item.issuer}</span>
                    
                    {item.code && (
                      <span className="text-xs font-mono text-slate-500 mb-6">
                        Credential ID: <span className="text-slate-400">{item.code}</span>
                      </span>
                    )}

                    <div className={`p-4 rounded-2xl border w-full max-w-sm mb-6 flex items-center justify-between text-xs font-mono ${
                      isDark ? 'bg-neutral-900/50 border-white/5 text-slate-300' : 'bg-slate-50 border-neutral-200 text-neutral-800'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#007AFF]" />
                        <span>Issued On</span>
                      </div>
                      <span className="font-semibold">{item.date}</span>
                    </div>

                    {item.credentialUrl && (
                      <a
                        href={item.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-[#007AFF] hover:bg-[#007AFF]/90 text-xs font-bold uppercase tracking-widest text-white rounded-xl shadow-glow transition-all duration-300 cursor-pointer"
                      >
                        Verify Credential Authenticity
                      </a>
                    )}
                  </div>
                )}

                {/* 3. BLOG NOTE VIEW */}
                {type === 'blog' && (
                  <>
                    <div className="border-b border-neutral-800/50 pb-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#007AFF]/15 text-[#007AFF] border border-[#007AFF]/25">
                          {item.category}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{item.readTime}</span>
                        <span className="text-xs text-slate-500 font-mono">&bull;</span>
                        <span className="text-xs text-slate-500 font-mono">{item.date}</span>
                      </div>
                      <h1 className="text-3xl font-bold font-sans tracking-tight leading-tight">{item.title}</h1>
                    </div>

                    {/* Excerpt panel */}
                    <div className={`p-5 rounded-2xl border italic text-sm ${
                      isDark ? 'bg-neutral-900/40 border-white/5 text-slate-300' : 'bg-slate-50 border-neutral-200 text-neutral-800'
                    }`}>
                      <span className="font-mono text-[9px] block uppercase text-[#007AFF] font-bold not-italic tracking-wider mb-2">Executive Summary</span>
                      "{item.excerpt}"
                    </div>

                    {/* Full markdown article rendering */}
                    <div className={`mt-2 space-y-4 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-neutral-700'}`}>
                      {item.content ? (
                        item.content.split('\n\n').map((paragraph: string, idx: number) => {
                          if (paragraph.startsWith('###')) {
                            return <h3 key={idx} className="text-lg font-bold text-white font-sans mt-6 mb-2">{paragraph.replace('###', '').trim()}</h3>;
                          }
                          if (paragraph.startsWith('####')) {
                            return <h4 key={idx} className="text-base font-bold text-white font-sans mt-5 mb-2">{paragraph.replace('####', '').trim()}</h4>;
                          }
                          if (paragraph.startsWith('**')) {
                            return <p key={idx} className="font-semibold text-white mt-4">{paragraph.replace(/\*\*/g, '')}</p>;
                          }
                          return <p key={idx}>{paragraph}</p>;
                        })
                      ) : (
                        <p className="italic text-slate-500">No article contents loaded.</p>
                      )}
                    </div>
                  </>
                )}

                {/* 4. HOME CARD VIEW */}
                {type === 'homeCard' && (
                  <div className="flex flex-col items-center py-6 text-center">
                    {/* Glowing Accent Icon */}
                    <div className="w-20 h-20 rounded-3xl bg-[#007AFF]/10 border border-[#007AFF]/25 flex items-center justify-center text-[#007AFF] mb-6 shadow-[0_8px_30px_rgba(0,122,255,0.15)]">
                      {item.id === 'ai-assistant' ? <Cpu className="w-10 h-10" /> :
                       item.id === 'availability' ? <Award className="w-10 h-10" /> :
                       item.id === 'featured-stack' ? <Database className="w-10 h-10" /> :
                       <Mail className="w-10 h-10" />}
                    </div>

                    <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#007AFF]/15 text-[#007AFF] border border-[#007AFF]/20 mb-3">
                      {item.badge}
                    </span>

                    <h2 className="text-2xl font-bold font-sans tracking-tight mb-2">{item.title}</h2>
                    <span className="text-xs text-slate-450 font-mono block mb-6">{item.subtitle}</span>

                    <p className={`text-sm leading-relaxed max-w-lg mb-8 ${isDark ? 'text-slate-350' : 'text-neutral-700'}`}>
                      {item.description}
                    </p>

                    {/* Interactive Call to Action Button */}
                    <button
                      type="button"
                      onClick={handleHomeCardAction}
                      className="px-8 py-3.5 bg-gradient-to-r from-sky-500 to-[#007AFF] hover:from-sky-600 hover:to-[#007AFF]/90 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-[0_4px_20px_rgba(0,229,255,0.25)] hover:shadow-[0_4px_30px_rgba(0,229,255,0.4)] transition-all duration-300 flex items-center gap-2 cursor-pointer"
                    >
                      <span>{item.buttonText || 'Explore Detail'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {item.extra && item.extra.length > 0 && (
                      <div className={`w-full max-w-md p-5 rounded-2xl border flex flex-col gap-2.5 mt-8 text-left ${
                        isDark ? 'bg-neutral-900/40 border-white/5' : 'bg-slate-50 border-neutral-200'
                      }`}>
                        <span className="text-[9px] font-mono uppercase text-[#007AFF] tracking-wider font-bold mb-1">Key Context Parameters</span>
                        {item.extra.map((ext: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-xs font-mono text-slate-300">
                            <ArrowRight className="w-3.5 h-3.5 text-[#007AFF]" />
                            <span>{ext}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. COORDINATES VIEW */}
                {type === 'coordinates' && (
                  <div className="flex flex-col items-center py-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/25 flex items-center justify-center text-[#007AFF] mb-4">
                      {renderDynamicIcon('map-pin', "w-7 h-7")}
                    </div>
                    <h3 className="text-xl font-bold font-sans tracking-tight mb-2">Direct Contact Coordinates</h3>
                    <p className="text-xs text-slate-400 font-mono mb-6">Verify and copy individual contact channels</p>

                    <div className="w-full flex flex-col gap-3 max-w-md">
                      {/* Email coordinate */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/25">
                        <div className="flex items-center gap-3">
                          {renderDynamicIcon('mail', "w-4.5 h-4.5 text-[#007AFF]")}
                          <div className="text-left">
                            <span className="text-[9px] uppercase font-mono text-slate-500 block leading-none mb-1">Email Endpoint</span>
                            <span className="text-xs font-semibold">{item.email}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.email)}
                          className="p-1.5 rounded-lg border border-neutral-800 text-slate-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
                        >
                          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* LinkedIn coordinate */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/25">
                        <div className="flex items-center gap-3">
                          {renderDynamicIcon('linkedin', "w-4.5 h-4.5 text-[#007AFF]")}
                          <div className="text-left">
                            <span className="text-[9px] uppercase font-mono text-slate-500 block leading-none mb-1">Professional Link</span>
                            <span className="text-xs font-semibold">{item.linkedin}</span>
                          </div>
                        </div>
                        <a
                          href={item.linkedin.startsWith('http') ? item.linkedin : `https://${item.linkedin}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg border border-neutral-800 text-slate-400 hover:text-white hover:bg-neutral-800 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {/* GitHub coordinate */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/25">
                        <div className="flex items-center gap-3">
                          {renderDynamicIcon('github', "w-4.5 h-4.5 text-[#007AFF]")}
                          <div className="text-left">
                            <span className="text-[9px] uppercase font-mono text-slate-500 block leading-none mb-1">Source Repository</span>
                            <span className="text-xs font-semibold">{item.github}</span>
                          </div>
                        </div>
                        <a
                          href={item.github.startsWith('http') ? item.github : `https://${item.github}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg border border-neutral-800 text-slate-400 hover:text-white hover:bg-neutral-800 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {/* Location coordinate */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/25">
                        <div className="flex items-center gap-3">
                          {renderDynamicIcon('mappin', "w-4.5 h-4.5 text-[#007AFF]")}
                          <div className="text-left">
                            <span className="text-[9px] uppercase font-mono text-slate-500 block leading-none mb-1">Operational Location</span>
                            <span className="text-xs font-semibold">{item.location}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.location)}
                          className="p-1.5 rounded-lg border border-neutral-800 text-slate-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
                        >
                          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Hours coordinate */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/25">
                        <div className="flex items-center gap-3">
                          {renderDynamicIcon('clock', "w-4.5 h-4.5 text-[#007AFF]")}
                          <div className="text-left">
                            <span className="text-[9px] uppercase font-mono text-slate-500 block leading-none mb-1">Response Hours</span>
                            <span className="text-xs font-semibold">{item.hours}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.hours)}
                          className="p-1.5 rounded-lg border border-neutral-800 text-slate-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
                        >
                          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. STRENGTH VIEW */}
                {type === 'strength' && (
                  <div className="flex flex-col items-center py-6 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-[#007AFF]/10 border border-[#007AFF]/25 flex items-center justify-center text-[#007AFF] mb-6 shadow-[0_8px_30px_rgba(0,122,255,0.15)]">
                      {renderDynamicIcon(item.icon, "w-10 h-10")}
                    </div>
                    <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#007AFF]/15 text-[#007AFF] border border-[#007AFF]/20 mb-3">
                      {item.signal}
                    </span>
                    <h2 className="text-2xl font-bold font-sans tracking-tight mb-4">{item.title}</h2>
                    <p className={`text-sm leading-relaxed max-w-xl ${isDark ? 'text-slate-300' : 'text-neutral-700'}`}>
                      {item.desc}
                    </p>
                  </div>
                )}

                {/* 7. SKILLS VIEW */}
                {type === 'skills' && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#007AFF]/10 border border-[#007AFF]/25 flex items-center justify-center text-[#007AFF]">
                        {renderDynamicIcon('award', "w-6 h-6")}
                      </div>
                      <h2 className="text-2xl font-bold font-sans tracking-tight">{item.title}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {(item.skills || []).map((skill: any, idx: number) => (
                        <div 
                          key={idx}
                          className={`p-4 rounded-2xl border flex items-center justify-between ${
                            isDark ? 'bg-neutral-900/35 border-white/5' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <span className="font-semibold text-sm">{skill.name}</span>
                          <span className={`text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-lg border ${
                            skill.level === 'Expert'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : skill.level === 'Proficient'
                                ? 'bg-[#007AFF]/10 border-[#007AFF]/20 text-[#007AFF]'
                                : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                          }`}>
                            {skill.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : null}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
