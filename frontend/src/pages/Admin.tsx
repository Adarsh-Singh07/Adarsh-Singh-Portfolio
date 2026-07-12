/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Unlock, 
  Loader2, 
  LogOut, 
  Save, 
  Plus, 
  Trash2, 
  Settings, 
  Layers, 
  Cpu, 
  Database,
  Mail,
  User,
  PlusCircle,
  FileText,
  HelpCircle,
  MessageSquare,
  Sparkles,
  BookOpen,
  Award,
  AlertCircle,
  Edit
} from 'lucide-react';
import PortfolioService from '../services/api';
import { ProfileMode, ProfileData, RoleDefinition } from '../types';

interface AdminProps {
  isDark: boolean;
  onRefreshData?: () => void;
}

type AdminTab = 'unanswered' | 'config' | 'projects' | 'skills' | 'certifications' | 'blogs' | 'uploads' | 'roles' | 'settings';

export default function Admin({ isDark, onRefreshData }: AdminProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('unanswered');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auth State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loginError, setLoginError] = useState(false);

  // Data States
  const [unanswered, setUnanswered] = useState<any[]>([]);
  const [logs, setLogs] = useState<any>({ sessions: [], leads: [] });
  const [adminConfig, setAdminConfig] = useState<any>(null);
  const [selectedHeroMode, setSelectedHeroMode] = useState<ProfileMode>('general');
  const [roles, setRoles] = useState<RoleDefinition[]>([]);

  // Publishing State
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // SMTP States
  const [smtpConfig, setSmtpConfig] = useState<any>({
    SMTP_HOST: '',
    SMTP_PORT: 587,
    SMTP_USER: '',
    SMTP_PASSWORD: '',
    SMTP_TO: '',
    RESEND_API_KEY: '',
    RESEND_FROM: ''
  });
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [smtpSuccess, setSmtpSuccess] = useState(false);

  // Role creation State
  const [newRoleId, setNewRoleId] = useState('');
  const [newRoleLabel, setNewRoleLabel] = useState('');
  const [newRoleIcon, setNewRoleIcon] = useState('Layers');
  const [copyFromRole, setCopyFromRole] = useState('general');
  const [creatingRole, setCreatingRole] = useState(false);
  const [roleSuccess, setRoleSuccess] = useState(false);
  const [answersMap, setAnswersMap] = useState<Record<number, string>>({});
  const [isEditingRole, setIsEditingRole] = useState(false);

  // File Upload State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadAvatarSuccess, setUploadAvatarSuccess] = useState(false);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [uploadCvSuccess, setUploadCvSuccess] = useState(false);

  // Account Settings Credentials
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingCreds, setChangingCreds] = useState(false);
  const [changeCredSuccess, setChangeCredSuccess] = useState(false);
  const [changeCredError, setChangeCredError] = useState<string | null>(null);

  // Fetch admin panel data
  const fetchAdminData = async (adminToken: string) => {
    setLoading(true);
    try {
      // 1. Get dynamic roles switcher list
      const rolesList = await PortfolioService.getRoles();
      setRoles(rolesList);

      // 2. Fetch unanswered recruiter questions
      const unansweredData = await PortfolioService.getUnansweredQuestions(adminToken);
      setUnanswered(unansweredData);

      // 3. Fetch unmasked recruiter interaction logs
      const logsData = await PortfolioService.getAnalyticsLogs(adminToken);
      setLogs(logsData);

      // 4. Fetch editable JSON configuration
      const configData = await PortfolioService.getAdminConfig(adminToken);
      setAdminConfig(configData);

      // 5. Fetch SMTP settings
      const smtpData = await PortfolioService.getSmtpSettings(adminToken);
      setSmtpConfig(smtpData);

      setError(null);
    } catch (err: any) {
      console.error('Failed to retrieve backend admin console details:', err);
      setError('Connection to admin API failed. Verify that backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = sessionStorage.getItem('admin-token') || localStorage.getItem('admin-token');
    if (savedToken) {
      setToken(savedToken);
      setIsUnlocked(true);
      fetchAdminData(savedToken);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(false);
    setLoading(true);
    try {
      const res = await PortfolioService.adminLogin(username, password);
      if (res.success && res.token) {
        setToken(res.token);
        setIsUnlocked(true);
        sessionStorage.setItem('admin-token', res.token);
        await fetchAdminData(res.token);
      } else {
        setLoginError(true);
      }
    } catch (err) {
      console.error('Login failed:', err);
      setLoginError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin-token');
    localStorage.removeItem('admin-token');
    setToken(null);
    setIsUnlocked(false);
    setUnanswered([]);
    setLogs({ sessions: [], leads: [] });
    setAdminConfig(null);
    setActiveTab('unanswered');
  };

  // Publish dynamic config updates
  const handlePublishConfig = async () => {
    if (!token || !adminConfig) return;
    setPublishing(true);
    setPublishSuccess(false);
    try {
      const res = await PortfolioService.saveAdminConfig(token, adminConfig);
      if (res.success) {
        setPublishSuccess(true);
        if (onRefreshData) onRefreshData();
        setTimeout(() => setPublishSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save config:', err);
      alert('Failed to publish configuration.');
    } finally {
      setPublishing(false);
    }
  };

  // Resolve unanswered question
  const handleResolveQuestion = async (q_id: number) => {
    if (!token) return;
    if (!window.confirm('Mark this question as resolved?')) return;
    try {
      await PortfolioService.resolveUnansweredQuestion(q_id, token);
      setUnanswered(prev => prev.filter(q => q.id !== q_id));
    } catch (err) {
      console.error('Failed to resolve question:', err);
      alert('Failed to resolve query.');
    }
  };

  // Answer and Resolve unanswered question
  const handleAnswerQuestion = async (q_id: number, question: string, answer: string) => {
    if (!token) return;
    try {
      await PortfolioService.answerUnansweredQuestion(q_id, question, answer, token);
      setUnanswered(prev => prev.filter(q => q.id !== q_id));
      setAnswersMap(prev => {
        const copy = { ...prev };
        delete copy[q_id];
        return copy;
      });
      alert('Answer recorded! Q&A knowledge indexed into RAG memory.');
    } catch (err) {
      console.error('Failed to submit answer:', err);
      alert('Failed to save answer to knowledge base.');
    }
  };

  // Delete dynamic switcher role
  const handleDeleteRole = async (roleId: string) => {
    if (!token) return;
    if (!window.confirm(`Are you sure you want to delete the role profile '${roleId}'? This will permanently remove its switcher button and all associated custom config fields!`)) return;
    try {
      await PortfolioService.deleteRole(roleId, token);
      setRoles(prev => prev.filter(r => r.id !== roleId));
      alert('Role deleted successfully!');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Failed to delete role:', err);
      alert('Failed to delete role profile.');
    }
  };

  const handleSelectRoleForEdit = (role: RoleDefinition) => {
    setNewRoleId(role.id);
    setNewRoleLabel(role.label);
    setNewRoleIcon(role.icon as any);
    setIsEditingRole(true);
  };

  // Save SMTP Settings
  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingSmtp(true);
    setSmtpSuccess(false);
    try {
      const res = await PortfolioService.saveSmtpSettings(token, smtpConfig);
      if (res.success) {
        setSmtpSuccess(true);
        setTimeout(() => setSmtpSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save SMTP:', err);
      alert('Failed to update SMTP configurations.');
    } finally {
      setSavingSmtp(false);
    }
  };

  // Create new profile switcher role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreatingRole(true);
    setRoleSuccess(false);
    const safeId = newRoleId.toLowerCase().replace(/[^a-z0-9-]/g, '-').trim();
    try {
      const res = await PortfolioService.addOrUpdateRole(token, {
        id: safeId as any,
        label: newRoleLabel,
        icon: newRoleIcon,
        copy_from: copyFromRole
      });
      if (res.success) {
        setRoleSuccess(true);
        // Refresh roles
        const rolesList = await PortfolioService.getRoles();
        setRoles(rolesList);
        // Refresh admin config
        const configData = await PortfolioService.getAdminConfig(token);
        setAdminConfig(configData);
        
        // Reset form
        setNewRoleId('');
        setNewRoleLabel('');
        setIsEditingRole(false);
        if (onRefreshData) onRefreshData();
        setTimeout(() => setRoleSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to add role:', err);
      alert('Failed to create dynamic role switcher.');
    } finally {
      setCreatingRole(false);
    }
  };

  // Profile Image upload
  const handleAvatarUpload = async () => {
    if (!avatarFile || !token) return;
    setUploadingAvatar(true);
    setUploadAvatarSuccess(false);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];
        const res = await PortfolioService.uploadAvatar(token, base64Data);
        if (res.success) {
          setUploadAvatarSuccess(true);
          setAvatarFile(null);
          if (onRefreshData) onRefreshData();
        }
      } catch (err) {
        console.error('Avatar upload failed:', err);
        alert('Failed to upload photo.');
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(avatarFile);
  };

  // CV PDF upload
  const handleCvUpload = async () => {
    if (!cvFile || !token) return;
    setUploadingCv(true);
    setUploadCvSuccess(false);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];
        const res = await PortfolioService.uploadCv(token, base64Data);
        if (res.success) {
          setUploadCvSuccess(true);
          setCvFile(null);
          if (onRefreshData) onRefreshData();
        }
      } catch (err) {
        console.error('CV upload failed:', err);
        alert('Failed to upload CV PDF.');
      } finally {
        setUploadingCv(false);
      }
    };
    reader.readAsDataURL(cvFile);
  };

  // Credentials updating
  const handleCredentialsChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setChangeCredError('Passwords do not match.');
      return;
    }
    setChangingCreds(true);
    setChangeCredSuccess(false);
    setChangeCredError(null);
    try {
      const res = await PortfolioService.changeCredentials(token || '', currentPassword, newUsername, newPassword);
      if (res.success) {
        setChangeCredSuccess(true);
        setCurrentPassword('');
        setNewUsername('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      console.error('Failed to change credentials:', err);
      setChangeCredError(err.message || 'Credentials change failed.');
    } finally {
      setChangingCreds(false);
    }
  };

  if (!isUnlocked) {
    return (
      <div className={`min-h-screen flex items-center justify-center py-24 px-6 transition-colors duration-1000 ${
        isDark ? 'bg-[#050505] text-white' : 'bg-slate-50 text-neutral-900'
      }`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-md p-8 rounded-[32px] border backdrop-blur-xl ${
            isDark 
              ? 'bg-neutral-950/60 border-white/10 shadow-2xl' 
              : 'bg-white border-slate-200 shadow-xl'
          }`}
        >
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF] mb-4">
              <Lock className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold font-sans tracking-tight">Admin Console Login</h1>
            <p className="text-xs text-slate-500 mt-1">Provide credential keys to customize portfolio details.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
              />
            </div>

            {loginError && (
              <span className="text-xs text-red-500 font-semibold block text-center">
                Authentication failed. Invalid password credentials.
              </span>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#007AFF] hover:bg-[#007AFF]/90 disabled:opacity-60 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-semibold shadow-glow cursor-pointer transition-colors mt-2"
            >
              {loading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Unlock className="w-4.5 h-4.5" />}
              <span>Verify Access Credentials</span>
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-24 px-6 md:px-12 transition-colors duration-1000 ${
      isDark ? 'bg-[#050505] text-white' : 'bg-slate-50 text-neutral-900'
    }`}>
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Header Console Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 mb-8 border-neutral-800/80 gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#007AFF] block mb-1">
              Control Panel
            </span>
            <h1 className="text-3xl font-bold font-sans tracking-tight">Admin Portal</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePublishConfig}
              disabled={publishing}
              className={`px-5 py-2.5 rounded-full flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                publishSuccess
                  ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-[#007AFF] hover:bg-[#007AFF]/90 text-white shadow-glow disabled:opacity-50'
              }`}
            >
              {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{publishSuccess ? 'Saved & Synced!' : 'Publish Changes'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-full border border-red-500/10 hover:border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer transition-all duration-300"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Sidebar tabs layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Tabs Menu List */}
          <div className="flex flex-col gap-1 lg:col-span-1">
            <button
              onClick={() => setActiveTab('unanswered')}
              className={`px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold tracking-wider text-left transition-colors cursor-pointer ${
                activeTab === 'unanswered' ? 'bg-[#007AFF]/15 text-[#007AFF] border-l-2 border-[#007AFF]' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Unresolved Qs ({unanswered.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold tracking-wider text-left transition-colors cursor-pointer ${
                activeTab === 'config' ? 'bg-[#007AFF]/15 text-[#007AFF] border-l-2 border-[#007AFF]' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Hero & Home Info</span>
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold tracking-wider text-left transition-colors cursor-pointer ${
                activeTab === 'roles' ? 'bg-[#007AFF]/15 text-[#007AFF] border-l-2 border-[#007AFF]' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Profile Switcher Roles</span>
            </button>
            <button
              onClick={() => setActiveTab('uploads')}
              className={`px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold tracking-wider text-left transition-colors cursor-pointer ${
                activeTab === 'uploads' ? 'bg-[#007AFF]/15 text-[#007AFF] border-l-2 border-[#007AFF]' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Assets (CV & Photo)</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold tracking-wider text-left transition-colors cursor-pointer ${
                activeTab === 'settings' ? 'bg-[#007AFF]/15 text-[#007AFF] border-l-2 border-[#007AFF]' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>SMTP & Credentials</span>
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="lg:col-span-3">
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
              <div className={`p-6 md:p-8 rounded-[32px] border ${
                isDark ? 'bg-neutral-950/60 border-white/10' : 'bg-white border-neutral-200'
              }`}>
                {/* 1. UNANSWERED RECIPENTS & LEADS LOGS */}
                {activeTab === 'unanswered' && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h2 className="text-lg font-bold font-sans tracking-tight mb-2">Unanswered Recruiter Questions</h2>
                      <p className="text-xs text-slate-500">Telemetry questions captured from the chatbot interface that Addy was unable to answer.</p>
                    </div>

                    {unanswered.length > 0 ? (
                      <div className="flex flex-col gap-4">
                        {unanswered.map((q) => (
                          <div 
                            key={q.id}
                            className={`p-5 rounded-2xl border flex flex-col gap-4 ${
                              isDark ? 'bg-neutral-900/50 border-white/5' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div>
                              <span className="block text-xs font-semibold mb-1 text-slate-400">Question Text:</span>
                              <p className="text-sm leading-relaxed text-slate-200 italic">"{q.question}"</p>
                              <span className="block text-[10px] font-mono text-slate-500 mt-2">Captured: {q.created_at}</span>
                            </div>

                            {/* Answer Input Block */}
                            <div className="flex flex-col gap-2 mt-2">
                              <textarea
                                placeholder="Provide the answer for the chatbot..."
                                value={answersMap[q.id] || ''}
                                onChange={e => setAnswersMap(prev => ({ ...prev, [q.id]: e.target.value }))}
                                rows={3}
                                className={`w-full px-4 py-3 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] resize-none ${
                                  isDark ? 'border-neutral-800 text-white' : 'border-slate-200 text-neutral-900'
                                }`}
                              />
                              <div className="flex justify-end gap-2.5">
                                <button
                                  onClick={() => handleResolveQuestion(q.id)}
                                  className="px-4 py-2 border border-slate-500/20 hover:border-slate-500/40 text-slate-400 text-xs font-semibold rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                                >
                                  Dismiss Without Answering
                                </button>
                                <button
                                  disabled={!answersMap[q.id]?.trim()}
                                  onClick={() => handleAnswerQuestion(q.id, q.question, answersMap[q.id])}
                                  className="px-4 py-2 bg-[#007AFF] hover:bg-[#007AFF]/90 text-white text-xs font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                >
                                  Save Answer to DB & Train Chatbot
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 border border-dashed rounded-2xl border-neutral-800">
                        <span className="text-xs font-mono text-slate-500">No unresolved recruiter questions logged!</span>
                      </div>
                    )}

                    {/* Unmasked Leads */}
                    <div className="border-t border-neutral-800 pt-6 mt-4">
                      <h2 className="text-lg font-bold font-sans tracking-tight mb-2">Unmasked Contact Outreach Leads</h2>
                      <p className="text-xs text-slate-500 mb-6">Real-time unmasked messages submitted by recruiters through the contact form.</p>
                      
                      {logs.leads && logs.leads.length > 0 ? (
                        <div className="flex flex-col gap-4">
                          {logs.leads.map((l: any, idx: number) => (
                            <div 
                              key={idx}
                              className={`p-5 rounded-2xl border flex flex-col gap-3 ${
                                isDark ? 'bg-neutral-900/50 border-white/5' : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-[#007AFF]">{l.name}</span>
                                <span className="text-[10px] font-mono text-slate-500">{l.created_at}</span>
                              </div>
                              <div className="text-xs font-mono text-slate-400">
                                <div>Email: <a href={`mailto:${l.email}`} className="text-sky-400 hover:underline">{l.email}</a></div>
                                <div>Subject: {l.subject}</div>
                                {l.intent_category && (
                                  <div className="mt-1">
                                    <span className="px-2 py-0.5 rounded-full text-[8.5px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                      {l.intent_category}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs leading-relaxed text-slate-300 border-t border-neutral-800/40 pt-2 mt-1">
                                {l.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border border-dashed rounded-2xl border-neutral-800">
                          <span className="text-xs font-mono text-slate-500">No contact messages logged yet.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. HERO PAGE EDITOR */}
                {activeTab === 'config' && adminConfig && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h2 className="text-lg font-bold font-sans tracking-tight mb-2">Home Page & Hero Configuration</h2>
                      <p className="text-xs text-slate-500">Customize the hero section philosophy headlines for each switcher mode profile.</p>
                    </div>

                    <div className="flex items-center gap-2 mb-4 p-1.5 rounded-2xl border border-neutral-800/60 bg-neutral-900/40 max-w-sm">
                      {roles.map(r => (
                        <button
                          key={r.id}
                          onClick={() => setSelectedHeroMode(r.id)}
                          className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            selectedHeroMode === r.id ? 'bg-[#007AFF] text-white shadow-glow' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>

                    {adminConfig[selectedHeroMode] ? (
                      <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Badge Title</label>
                            <input
                              type="text"
                              value={adminConfig[selectedHeroMode].hero.badge || ''}
                              onChange={e => {
                                const updated = { ...adminConfig };
                                updated[selectedHeroMode].hero.badge = e.target.value;
                                setAdminConfig(updated);
                              }}
                              className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Full Name</label>
                            <input
                              type="text"
                              value={adminConfig[selectedHeroMode].hero.titleName || ''}
                              onChange={e => {
                                const updated = { ...adminConfig };
                                updated[selectedHeroMode].hero.titleName = e.target.value;
                                setAdminConfig(updated);
                              }}
                              className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Hero Main Headline</label>
                          <textarea
                            rows={3}
                            value={adminConfig[selectedHeroMode].hero.headline || ''}
                            onChange={e => {
                              const updated = { ...adminConfig };
                              updated[selectedHeroMode].hero.headline = e.target.value;
                              setAdminConfig(updated);
                            }}
                            className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800 resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Subtext Intro Biography</label>
                          <textarea
                            rows={4}
                            value={adminConfig[selectedHeroMode].hero.subtext || ''}
                            onChange={e => {
                              const updated = { ...adminConfig };
                              updated[selectedHeroMode].hero.subtext = e.target.value;
                              setAdminConfig(updated);
                            }}
                            className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800 resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Key Tags/Skills trust row (Comma-separated)</label>
                          <input
                            type="text"
                            value={adminConfig[selectedHeroMode].hero.trustRow ? adminConfig[selectedHeroMode].hero.trustRow.join(', ') : ''}
                            onChange={e => {
                              const updated = { ...adminConfig };
                              updated[selectedHeroMode].hero.trustRow = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setAdminConfig(updated);
                            }}
                            className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Profile Philosophy Statement</label>
                          <textarea
                            rows={4}
                            value={adminConfig[selectedHeroMode].philosophy || ''}
                            onChange={e => {
                              const updated = { ...adminConfig };
                              updated[selectedHeroMode].philosophy = e.target.value;
                              setAdminConfig(updated);
                            }}
                            className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800 resize-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <span className="text-xs text-slate-500 font-mono">Select a role profile mode to edit config.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. DYNAMIC ROLES SWITCHER MANAGER */}
                {activeTab === 'roles' && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h2 className="text-lg font-bold font-sans tracking-tight mb-2">Dynamic Switcher Roles</h2>
                      <p className="text-xs text-slate-500">Configure your profile roles (e.g. Data Engineer, AI Architect) which appear in the dynamic navigation dropdown switcher.</p>
                    </div>

                    {/* Roles List */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">Active Switcher Roles</span>
                      {roles.map(r => (
                        <div 
                          key={r.id}
                          className={`px-4 py-3 rounded-xl border flex items-center justify-between text-xs font-semibold tracking-wider ${
                            isDark ? 'bg-neutral-900/50 border-white/5' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 rounded bg-[#007AFF]/15 text-[#007AFF] text-[10px] font-mono font-bold uppercase">{r.id}</span>
                            <span>{r.label} (Icon: {r.icon})</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSelectRoleForEdit(r)}
                              className="p-1.5 rounded-lg border border-slate-500/20 hover:border-[#007AFF]/40 hover:bg-[#007AFF]/10 text-slate-400 hover:text-[#007AFF] cursor-pointer transition-colors"
                              title="Edit Role label and icon"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {r.id !== 'general' && r.id !== 'data-engineer' && r.id !== 'ai-engineer' && (
                              <button
                                onClick={() => handleDeleteRole(r.id)}
                                className="p-1.5 rounded-lg border border-slate-500/20 hover:border-rose-500/40 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                                title="Delete Role Profile"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Create Role Form */}
                    <form onSubmit={handleCreateRole} className="border-t border-neutral-800 pt-6 flex flex-col gap-4 mt-2">
                      <span className="block text-[10px] font-mono uppercase text-[#007AFF] tracking-wider font-bold mb-1">
                        {isEditingRole ? 'Modify dynamic profile role metadata' : 'Create new dynamic profile role'}
                      </span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">
                            Role ID key (Lowercase, no spaces)
                          </label>
                          <input
                            type="text"
                            required
                            disabled={isEditingRole}
                            placeholder="e.g. ml-engineer"
                            value={newRoleId}
                            onChange={e => setNewRoleId(e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800 ${
                              isEditingRole ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Role Label (Visible name)</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Machine Learning Engineer"
                            value={newRoleLabel}
                            onChange={e => setNewRoleLabel(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">Lucide Icon name</label>
                          <select
                            value={newRoleIcon}
                            onChange={e => setNewRoleIcon(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border bg-neutral-900 text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                          >
                            <option value="Layers">Layers (General)</option>
                            <option value="Database">Database (Data Engineering)</option>
                            <option value="Cpu">Cpu (AI Systems)</option>
                            <option value="CpuIcon">CpuIcon</option>
                            <option value="FileText">FileText</option>
                            <option value="ShieldCheck">ShieldCheck</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1 text-slate-400">
                            {isEditingRole ? 'Data template source (Inherited)' : 'Initialize Data Template from'}
                          </label>
                          <select
                            value={copyFromRole}
                            disabled={isEditingRole}
                            onChange={e => setCopyFromRole(e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border bg-neutral-900 text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800 ${
                              isEditingRole ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {roles.map(r => (
                              <option key={r.id} value={r.id}>{r.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {roleSuccess && (
                        <span className="text-xs text-emerald-400 font-semibold block text-center mt-2">
                          Profile switcher role updated and saved successfully!
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={creatingRole}
                          className="px-6 py-2.5 bg-[#007AFF] hover:bg-[#007AFF]/90 disabled:opacity-60 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold shadow-glow cursor-pointer transition-colors"
                        >
                          {creatingRole ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isEditingRole ? (
                            <Edit className="w-3.5 h-3.5" />
                          ) : (
                            <PlusCircle className="w-3.5 h-3.5" />
                          )}
                          <span>{isEditingRole ? 'Save Changes' : 'Create Profile Role'}</span>
                        </button>
                        
                        {isEditingRole && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewRoleId('');
                              setNewRoleLabel('');
                              setNewRoleIcon('Layers');
                              setIsEditingRole(false);
                            }}
                            className="px-4 py-2.5 border border-neutral-800 text-slate-400 hover:bg-white/5 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                )}

                {/* 4. ASSETS MEDIA UPLOADS */}
                {activeTab === 'uploads' && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h2 className="text-lg font-bold font-sans tracking-tight mb-2">Assets Upload Manager</h2>
                      <p className="text-xs text-slate-500">Directly overwrite your homepage profile picture or CV resume PDF. These files serve dynamically across your portfolio.</p>
                    </div>

                    {/* Avatar Upload */}
                    <div className="flex flex-col gap-3 p-5 border rounded-2xl border-neutral-800 bg-neutral-900/20">
                      <span className="text-[10px] font-mono uppercase text-[#007AFF] tracking-wider font-semibold">Homepage Photo (avatar.jpg)</span>
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={e => {
                            if (e.target.files && e.target.files.length > 0) {
                              setAvatarFile(e.target.files[0]);
                              setUploadAvatarSuccess(false);
                            }
                          }}
                          className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-neutral-900 file:text-slate-300 hover:file:bg-neutral-800 file:cursor-pointer"
                        />
                        {avatarFile && (
                          <button
                            onClick={handleAvatarUpload}
                            disabled={uploadingAvatar}
                            className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-xs font-semibold shadow-glow cursor-pointer transition-opacity"
                          >
                            {uploadingAvatar ? 'Uploading...' : 'Confirm Upload'}
                          </button>
                        )}
                        {uploadAvatarSuccess && (
                          <span className="text-xs text-emerald-400 font-semibold">&bull; Upload success! Reload page to update caching.</span>
                        )}
                      </div>
                    </div>

                    {/* CV PDF Upload */}
                    <div className="flex flex-col gap-3 p-5 border rounded-2xl border-neutral-800 bg-neutral-900/20">
                      <span className="text-[10px] font-mono uppercase text-[#007AFF] tracking-wider font-semibold">Resume PDF (cv.pdf)</span>
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={e => {
                            if (e.target.files && e.target.files.length > 0) {
                              setCvFile(e.target.files[0]);
                              setUploadCvSuccess(false);
                            }
                          }}
                          className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-neutral-900 file:text-slate-300 hover:file:bg-neutral-800 file:cursor-pointer"
                        />
                        {cvFile && (
                          <button
                            onClick={handleCvUpload}
                            disabled={uploadingCv}
                            className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-xs font-semibold shadow-glow cursor-pointer transition-opacity"
                          >
                            {uploadingCv ? 'Uploading...' : 'Confirm Upload'}
                          </button>
                        )}
                        {uploadCvSuccess && (
                          <span className="text-xs text-emerald-400 font-semibold">&bull; Upload success! Resume PDF serves live dynamically.</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. SMTP & CREDENTIALS SETTINGS */}
                {activeTab === 'settings' && (
                  <div className="flex flex-col gap-6">
                    {/* SMTP Configuration */}
                    <div>
                      <h2 className="text-lg font-bold font-sans tracking-tight mb-2">SMTP Mail Configuration</h2>
                      <p className="text-xs text-slate-500 mb-5">Configure email transmission settings. These are parsed dynamically to dispatch outreach alerts securely.</p>
                      
                      <form onSubmit={handleSaveSmtp} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">SMTP Host</label>
                            <input
                              type="text"
                              required
                              value={smtpConfig.SMTP_HOST || ''}
                              onChange={e => setSmtpConfig({ ...smtpConfig, SMTP_HOST: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">SMTP Port</label>
                            <input
                              type="number"
                              required
                              value={smtpConfig.SMTP_PORT ?? 587}
                              onChange={e => setSmtpConfig({ ...smtpConfig, SMTP_PORT: parseInt(e.target.value) || 587 })}
                              className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">SMTP User / Auth Account</label>
                            <input
                              type="email"
                              required
                              value={smtpConfig.SMTP_USER || ''}
                              onChange={e => setSmtpConfig({ ...smtpConfig, SMTP_USER: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">SMTP Password</label>
                            <input
                              type="password"
                              required
                              value={smtpConfig.SMTP_PASSWORD || ''}
                              onChange={e => setSmtpConfig({ ...smtpConfig, SMTP_PASSWORD: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">Alert To Recipient Email</label>
                            <input
                              type="email"
                              required
                              value={smtpConfig.SMTP_TO || ''}
                              onChange={e => setSmtpConfig({ ...smtpConfig, SMTP_TO: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-neutral-800 pt-4 mt-2">
                          <div>
                            <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">Resend API Key (Optional)</label>
                            <input
                              type="password"
                              value={smtpConfig.RESEND_API_KEY || ''}
                              onChange={e => setSmtpConfig({ ...smtpConfig, RESEND_API_KEY: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">Resend Sender Email (Default: onboarding@resend.dev)</label>
                            <input
                              type="text"
                              value={smtpConfig.RESEND_FROM || ''}
                              onChange={e => setSmtpConfig({ ...smtpConfig, RESEND_FROM: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                            />
                          </div>
                        </div>

                        {smtpSuccess && (
                          <span className="text-xs text-emerald-400 font-semibold block text-center mt-2">
                            SMTP configuration variables saved successfully!
                          </span>
                        )}

                        <button
                          type="submit"
                          disabled={savingSmtp}
                          className="px-6 py-2.5 bg-[#007AFF] hover:bg-[#007AFF]/90 disabled:opacity-60 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold shadow-glow cursor-pointer self-start transition-colors"
                        >
                          {savingSmtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          <span>Save SMTP Config</span>
                        </button>
                      </form>
                    </div>

                    {/* Change Credentials Form */}
                    <div className="border-t border-neutral-800 pt-6 mt-4">
                      <h2 className="text-lg font-bold font-sans tracking-tight mb-2">Change Admin Credentials</h2>
                      <p className="text-xs text-slate-500 mb-5">Change the username or password keys used to secure this portfolio admin workspace.</p>
                      
                      <form onSubmit={handleCredentialsChange} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">New Username</label>
                            <input
                              type="text"
                              required
                              value={newUsername}
                              onChange={e => setNewUsername(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">Current Password (to verify)</label>
                            <input
                              type="password"
                              required
                              value={currentPassword}
                              onChange={e => setCurrentPassword(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">New Password</label>
                            <input
                              type="password"
                              required
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">Confirm New Password</label>
                            <input
                              type="password"
                              required
                              value={confirmPassword}
                              onChange={e => setConfirmPassword(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:border-[#007AFF] border-neutral-800"
                            />
                          </div>
                        </div>

                        {changeCredError && (
                          <span className="text-xs text-red-500 font-semibold block text-center">
                            {changeCredError}
                          </span>
                        )}

                        {changeCredSuccess && (
                          <span className="text-xs text-emerald-400 font-semibold block text-center">
                            Admin credentials updated successfully! Log in with new credentials on next session.
                          </span>
                        )}

                        <button
                          type="submit"
                          disabled={changingCreds}
                          className="px-6 py-2.5 bg-[#007AFF] hover:bg-[#007AFF]/90 disabled:opacity-60 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold shadow-glow cursor-pointer self-start transition-colors"
                        >
                          {changingCreds ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          <span>Save New Credentials</span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
