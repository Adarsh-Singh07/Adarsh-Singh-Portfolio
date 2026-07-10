import React, { useState, useEffect, useRef } from 'react';
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
  Loader2,
  Edit,
  Trash2,
  Plus,
  Check,
  LogOut,
  FileText,
  Award,
  Eye,
  EyeOff,
  Save,
  Upload,
  User,
  Settings,
  Layers
} from 'lucide-react';
import PortfolioService from '../services/api';
import { ProfileMode, ProfileData } from '../types';

interface DashboardProps {
  isDark: boolean;
}

type TabType = 'analytics' | 'rag' | 'unanswered' | 'config' | 'projects' | 'certifications' | 'blogs' | 'skills' | 'uploads' | 'settings';

export default function Dashboard({ isDark }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any>({ sessions: [], leads: [] });
  const [unanswered, setUnanswered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Auth State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loginError, setLoginError] = useState(false);
  
  // RAG Search State
  const [ragQuery, setRagQuery] = useState('');
  const [ragResults, setRagResults] = useState<any[]>([]);
  const [ragSearching, setRagSearching] = useState(false);
  
  // Selected Chat Session details
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Admin Config States
  const [adminConfig, setAdminConfig] = useState<any>(null);
  const [originalConfig, setOriginalConfig] = useState<any>(null);
  const [selectedHeroMode, setSelectedHeroMode] = useState<ProfileMode>('general');

  // Publishing Status
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // File Upload State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadAvatarSuccess, setUploadAvatarSuccess] = useState(false);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [uploadCvSuccess, setUploadCvSuccess] = useState(false);

  // Account settings state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingCredentials, setChangingCredentials] = useState(false);
  const [changeCredSuccess, setChangeCredSuccess] = useState(false);
  const [changeCredError, setChangeCredError] = useState<string | null>(null);

  // Project Form States
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projId, setProjId] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projStatus, setProjStatus] = useState<'Deployed' | 'Beta' | 'In Progress'>('In Progress');
  const [projFeatured, setProjFeatured] = useState(false);
  const [projGithubUrl, setProjGithubUrl] = useState('');
  const [projDemoUrl, setProjDemoUrl] = useState('');
  const [projTechs, setProjTechs] = useState('');
  const [projMetrics, setProjMetrics] = useState<Array<{ label: string, value: string }>>([]);
  const [projShowGeneral, setProjShowGeneral] = useState(false);
  const [projShowData, setProjShowData] = useState(false);
  const [projShowAi, setProjShowAi] = useState(false);
  const [projPriorityGeneral, setProjPriorityGeneral] = useState(1);
  const [projPriorityData, setProjPriorityData] = useState(1);
  const [projPriorityAi, setProjPriorityAi] = useState(1);

  // Certification Form States
  const [showCertForm, setShowCertForm] = useState(false);
  const [editingCert, setEditingCert] = useState<any | null>(null);
  const [certTitle, setCertTitle] = useState('');
  const [certId, setCertId] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certCode, setCertCode] = useState('');
  const [certDate, setCertDate] = useState('');
  const [certCredUrl, setCertCredUrl] = useState('');
  const [certBadgeUrl, setCertBadgeUrl] = useState('');
  const [certFeatured, setCertFeatured] = useState(false);
  const [certShowGeneral, setCertShowGeneral] = useState(false);
  const [certShowData, setCertShowData] = useState(false);
  const [certShowAi, setCertShowAi] = useState(false);
  const [certPriorityGeneral, setCertPriorityGeneral] = useState(1);
  const [certPriorityData, setCertPriorityData] = useState(1);
  const [certPriorityAi, setCertPriorityAi] = useState(1);

  // Blog Form States
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogId, setBlogId] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogReadTime, setBlogReadTime] = useState('');
  const [blogCategory, setBlogCategory] = useState('');
  const [blogDate, setBlogDate] = useState('');
  const [blogUrl, setBlogUrl] = useState('');
  const [blogShowGeneral, setBlogShowGeneral] = useState(false);
  const [blogShowData, setBlogShowData] = useState(false);
  const [blogShowAi, setBlogShowAi] = useState(false);
  const [blogPriorityGeneral, setBlogPriorityGeneral] = useState(1);
  const [blogPriorityData, setBlogPriorityData] = useState(1);
  const [blogPriorityAi, setBlogPriorityAi] = useState(1);

  // Skills Form States
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingSkillCat, setEditingSkillCat] = useState<any | null>(null);
  const [skillCatTitle, setSkillCatTitle] = useState('');
  const [skillList, setSkillList] = useState<Array<{ name: string, level: string }>>([]);
  const [skillShowGeneral, setSkillShowGeneral] = useState(false);
  const [skillShowData, setSkillShowData] = useState(false);
  const [skillShowAi, setSkillShowAi] = useState(false);
  const [skillPriorityGeneral, setSkillPriorityGeneral] = useState(1);
  const [skillPriorityData, setSkillPriorityData] = useState(1);
  const [skillPriorityAi, setSkillPriorityAi] = useState(1);

  // Load telemetry stats and admin configs
  const fetchData = async (currentPasscode?: string) => {
    setLoading(true);
    try {
      const statsData = await PortfolioService.getAnalyticsStats();
      setStats(statsData);
      
      const logsData = await PortfolioService.getAnalyticsLogs(currentPasscode);
      setLogs(logsData);
      setIsUnlocked(logsData.is_admin);

      if (logsData.is_admin || currentPasscode) {
        const unansweredData = await PortfolioService.getUnansweredQuestions(currentPasscode || token || '');
        setUnanswered(unansweredData);
        
        const configData = await PortfolioService.getAdminConfig(currentPasscode || token || '');
        setAdminConfig(configData);
        setOriginalConfig(JSON.parse(JSON.stringify(configData))); // Deep clone
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
    const savedToken = sessionStorage.getItem('admin-token') || localStorage.getItem('admin-token');
    if (savedToken) {
      setToken(savedToken);
      setIsUnlocked(true);
      fetchData(savedToken);
    } else {
      setLoading(false);
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
        await fetchData(res.token);
      } else {
        setLoginError(true);
      }
    } catch (err) {
      console.error("Login failed:", err);
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
    setStats(null);
    setLogs({ sessions: [], leads: [] });
    setUnanswered([]);
    setAdminConfig(null);
    setOriginalConfig(null);
    setActiveTab('analytics');
  };

  const handlePublish = async () => {
    if (!token || !adminConfig) return;
    setPublishing(true);
    setPublishSuccess(false);
    try {
      const res = await PortfolioService.saveAdminConfig(token, adminConfig);
      if (res.success) {
        setOriginalConfig(JSON.parse(JSON.stringify(adminConfig)));
        setPublishSuccess(true);
        setTimeout(() => setPublishSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to publish configuration:", err);
      alert("Failed to publish configuration to the server.");
    } finally {
      setPublishing(false);
    }
  };

  const hasUnsavedChanges = () => {
    if (!adminConfig || !originalConfig) return false;
    return JSON.stringify(adminConfig) !== JSON.stringify(originalConfig);
  };

  const handleResolveQuestion = async (q_id: number) => {
    try {
      const res = await PortfolioService.resolveUnansweredQuestion(q_id, token || '');
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

  // CRUD helpers to consolidate lists of items across profiles
  const getUniqueProjects = () => {
    if (!adminConfig) return [];
    const projectMap: Record<string, any> = {};
    (['general', 'data-engineer', 'ai-engineer'] as const).forEach(mode => {
      if (adminConfig[mode]?.projects) {
        adminConfig[mode].projects.forEach((proj: any) => {
          projectMap[proj.id] = proj;
        });
      }
    });
    return Object.values(projectMap);
  };

  const getUniqueCertifications = () => {
    if (!adminConfig) return [];
    const certMap: Record<string, any> = {};
    (['general', 'data-engineer', 'ai-engineer'] as const).forEach(mode => {
      if (adminConfig[mode]?.certifications) {
        adminConfig[mode].certifications.forEach((cert: any) => {
          certMap[cert.id] = cert;
        });
      }
    });
    return Object.values(certMap);
  };

  const getUniqueBlogs = () => {
    if (!adminConfig) return [];
    const blogMap: Record<string, any> = {};
    (['general', 'data-engineer', 'ai-engineer'] as const).forEach(mode => {
      if (adminConfig[mode]?.blogs) {
        adminConfig[mode].blogs.forEach((blog: any) => {
          blogMap[blog.id] = blog;
        });
      }
    });
    return Object.values(blogMap);
  };

  const getUniqueSkills = () => {
    if (!adminConfig) return [];
    const skillMap: Record<string, any> = {};
    (['general', 'data-engineer', 'ai-engineer'] as const).forEach(mode => {
      if (adminConfig[mode]?.skills) {
        adminConfig[mode].skills.forEach((skillCat: any) => {
          skillMap[skillCat.title] = skillCat;
        });
      }
    });
    return Object.values(skillMap);
  };

  // Avatar Photo & CV Uploader Handlers
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile || !token) return;
    setUploadingAvatar(true);
    setUploadAvatarSuccess(false);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await PortfolioService.uploadAvatar(token, base64Data);
          if (res.success) {
            setUploadAvatarSuccess(true);
            setTimeout(() => setUploadAvatarSuccess(false), 3000);
          }
        } catch (err) {
          alert("Failed to upload avatar image.");
        } finally {
          setUploadingAvatar(false);
        }
      };
      reader.readAsDataURL(avatarFile);
    } catch (err) {
      console.error(err);
      setUploadingAvatar(false);
    }
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleUploadCv = async () => {
    if (!cvFile || !token) return;
    setUploadingCv(true);
    setUploadCvSuccess(false);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await PortfolioService.uploadCv(token, base64Data);
          if (res.success) {
            setUploadCvSuccess(true);
            setTimeout(() => setUploadCvSuccess(false), 3000);
          }
        } catch (err) {
          alert("Failed to upload CV PDF.");
        } finally {
          setUploadingCv(false);
        }
      };
      reader.readAsDataURL(cvFile);
    } catch (err) {
      console.error(err);
      setUploadingCv(false);
    }
  };

  // Change Credentials Handler
  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeCredError(null);
    setChangeCredSuccess(false);

    if (newPassword !== confirmPassword) {
      setChangeCredError("New passwords do not match.");
      return;
    }

    setChangingCredentials(true);
    try {
      const res = await PortfolioService.changeCredentials(token || '', currentPassword, newUsername, newPassword);
      if (res.success) {
        setChangeCredSuccess(true);
        setCurrentPassword('');
        setNewUsername('');
        setNewPassword('');
        setConfirmPassword('');
        // Log out user so they can login again
        setTimeout(() => {
          handleLogout();
        }, 2000);
      }
    } catch (err: any) {
      setChangeCredError(err.message || "Failed to update admin credentials.");
    } finally {
      setChangingCredentials(false);
    }
  };

  // Project CRUD Actions
  const handleAddProject = () => {
    setEditingProject(null);
    setProjTitle('');
    setProjId('');
    setProjDesc('');
    setProjStatus('In Progress');
    setProjFeatured(false);
    setProjGithubUrl('');
    setProjDemoUrl('');
    setProjTechs('');
    setProjMetrics([]);
    setProjShowGeneral(true);
    setProjShowData(false);
    setProjShowAi(false);
    setProjPriorityGeneral(1);
    setProjPriorityData(1);
    setProjPriorityAi(1);
    setShowProjectForm(true);
  };

  const handleEditProject = (proj: any) => {
    setEditingProject(proj);
    setProjTitle(proj.title || '');
    setProjId(proj.id || '');
    setProjDesc(proj.description || '');
    setProjStatus(proj.status || 'In Progress');
    setProjFeatured(!!proj.featured);
    setProjGithubUrl(proj.githubUrl || '');
    setProjDemoUrl(proj.demoUrl || '');
    setProjTechs(proj.technologies ? proj.technologies.join(', ') : '');
    setProjMetrics(proj.metrics || []);

    const showGeneral = !!adminConfig.general?.projects?.some((p: any) => p.id === proj.id);
    const showData = !!adminConfig['data-engineer']?.projects?.some((p: any) => p.id === proj.id);
    const showAi = !!adminConfig['ai-engineer']?.projects?.some((p: any) => p.id === proj.id);

    setProjShowGeneral(showGeneral);
    setProjShowData(showData);
    setProjShowAi(showAi);

    const priGeneral = adminConfig.general?.projects?.find((p: any) => p.id === proj.id)?.priority?.general ?? 1;
    const priData = adminConfig['data-engineer']?.projects?.find((p: any) => p.id === proj.id)?.priority?.['data-engineer'] ?? 1;
    const priAi = adminConfig['ai-engineer']?.projects?.find((p: any) => p.id === proj.id)?.priority?.['ai-engineer'] ?? 1;

    setProjPriorityGeneral(priGeneral);
    setProjPriorityData(priData);
    setProjPriorityAi(priAi);

    setShowProjectForm(true);
  };

  const handleSaveProject = () => {
    if (!projTitle.trim()) return;
    const cleanId = projId.trim() || projTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const updatedProj: any = {
      id: cleanId,
      title: projTitle.trim(),
      description: projDesc.trim(),
      status: projStatus,
      featured: projFeatured,
      githubUrl: projGithubUrl.trim(),
      demoUrl: projDemoUrl.trim() || undefined,
      technologies: projTechs.split(',').map(s => s.trim()).filter(Boolean),
      metrics: projMetrics.filter(m => m.label.trim() && m.value.trim()),
      priority: {
        general: projShowGeneral ? Number(projPriorityGeneral) : 99,
        'data-engineer': projShowData ? Number(projPriorityData) : 99,
        'ai-engineer': projShowAi ? Number(projPriorityAi) : 99
      }
    };

    setAdminConfig((prev: any) => {
      const next = { ...prev };
      const modes = ['general', 'data-engineer', 'ai-engineer'] as const;
      const shows = [projShowGeneral, projShowData, projShowAi];
      const priorities = [projPriorityGeneral, projPriorityData, projPriorityAi];

      modes.forEach((mode, idx) => {
        const isVisible = shows[idx];
        let projectsList = next[mode]?.projects ? [...next[mode].projects] : [];
        projectsList = projectsList.filter((p: any) => p.id !== cleanId);

        if (isVisible) {
          const modeSpecificProj = { 
            ...updatedProj,
            priority: {
              ...updatedProj.priority,
              [mode]: Number(priorities[idx])
            }
          };
          projectsList.push(modeSpecificProj);
          projectsList.sort((a: any, b: any) => (a.priority?.[mode] ?? 99) - (b.priority?.[mode] ?? 99));
        }
        
        next[mode] = {
          ...next[mode],
          projects: projectsList
        };
      });

      return next;
    });

    setShowProjectForm(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (projIdToDelete: string) => {
    if (!window.confirm("Are you sure you want to delete this project from all profiles?")) return;
    setAdminConfig((prev: any) => {
      const next = { ...prev };
      const modes = ['general', 'data-engineer', 'ai-engineer'] as const;
      modes.forEach(mode => {
        if (next[mode]?.projects) {
          next[mode].projects = next[mode].projects.filter((p: any) => p.id !== projIdToDelete);
        }
      });
      return next;
    });
  };

  // Certification CRUD Actions
  const handleAddCert = () => {
    setEditingCert(null);
    setCertTitle('');
    setCertId('');
    setCertIssuer('');
    setCertCode('');
    setCertDate('');
    setCertCredUrl('');
    setCertBadgeUrl('');
    setCertFeatured(false);
    setCertShowGeneral(true);
    setCertShowData(false);
    setCertShowAi(false);
    setCertPriorityGeneral(1);
    setCertPriorityData(1);
    setCertPriorityAi(1);
    setShowCertForm(true);
  };

  const handleEditCert = (cert: any) => {
    setEditingCert(cert);
    setCertTitle(cert.title || '');
    setCertId(cert.id || '');
    setCertIssuer(cert.issuer || '');
    setCertCode(cert.code || '');
    setCertDate(cert.date || '');
    setCertCredUrl(cert.credentialUrl || '');
    setCertBadgeUrl(cert.badgeUrl || '');
    setCertFeatured(!!cert.featured);

    const showGeneral = !!adminConfig.general?.certifications?.some((c: any) => c.id === cert.id);
    const showData = !!adminConfig['data-engineer']?.certifications?.some((c: any) => c.id === cert.id);
    const showAi = !!adminConfig['ai-engineer']?.certifications?.some((c: any) => c.id === cert.id);

    setCertShowGeneral(showGeneral);
    setCertShowData(showData);
    setCertShowAi(showAi);

    const priGeneral = adminConfig.general?.certifications?.find((c: any) => c.id === cert.id)?.priority?.general ?? 1;
    const priData = adminConfig['data-engineer']?.certifications?.find((c: any) => c.id === cert.id)?.priority?.['data-engineer'] ?? 1;
    const priAi = adminConfig['ai-engineer']?.certifications?.find((c: any) => c.id === cert.id)?.priority?.['ai-engineer'] ?? 1;

    setCertPriorityGeneral(priGeneral);
    setCertPriorityData(priData);
    setCertPriorityAi(priAi);

    setShowCertForm(true);
  };

  const handleSaveCert = () => {
    if (!certTitle.trim()) return;
    const cleanId = certId.trim() || certTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const updatedCert: any = {
      id: cleanId,
      title: certTitle.trim(),
      issuer: certIssuer.trim(),
      code: certCode.trim() || undefined,
      date: certDate.trim(),
      credentialUrl: certCredUrl.trim() || undefined,
      badgeUrl: certBadgeUrl.trim() || undefined,
      featured: certFeatured,
      priority: {
        general: certShowGeneral ? Number(certPriorityGeneral) : 99,
        'data-engineer': certShowData ? Number(certPriorityData) : 99,
        'ai-engineer': certShowAi ? Number(certPriorityAi) : 99
      }
    };

    setAdminConfig((prev: any) => {
      const next = { ...prev };
      const modes = ['general', 'data-engineer', 'ai-engineer'] as const;
      const shows = [certShowGeneral, certShowData, certShowAi];
      const priorities = [certPriorityGeneral, certPriorityData, certPriorityAi];

      modes.forEach((mode, idx) => {
        const isVisible = shows[idx];
        let certsList = next[mode]?.certifications ? [...next[mode].certifications] : [];
        certsList = certsList.filter((c: any) => c.id !== cleanId);

        if (isVisible) {
          const modeSpecificCert = {
            ...updatedCert,
            priority: {
              ...updatedCert.priority,
              [mode]: Number(priorities[idx])
            }
          };
          certsList.push(modeSpecificCert);
          certsList.sort((a: any, b: any) => (a.priority?.[mode] ?? 99) - (b.priority?.[mode] ?? 99));
        }

        next[mode] = {
          ...next[mode],
          certifications: certsList
        };
      });
      return next;
    });

    setShowCertForm(false);
    setEditingCert(null);
  };

  const handleDeleteCert = (certIdToDelete: string) => {
    if (!window.confirm("Are you sure you want to delete this certification from all profiles?")) return;
    setAdminConfig((prev: any) => {
      const next = { ...prev };
      const modes = ['general', 'data-engineer', 'ai-engineer'] as const;
      modes.forEach(mode => {
        if (next[mode]?.certifications) {
          next[mode].certifications = next[mode].certifications.filter((c: any) => c.id !== certIdToDelete);
        }
      });
      return next;
    });
  };

  // Blog CRUD Actions
  const handleAddBlog = () => {
    setEditingBlog(null);
    setBlogTitle('');
    setBlogId('');
    setBlogExcerpt('');
    setBlogReadTime('');
    setBlogCategory('');
    setBlogDate('');
    setBlogUrl('');
    setBlogShowGeneral(true);
    setBlogShowData(false);
    setBlogShowAi(false);
    setBlogPriorityGeneral(1);
    setBlogPriorityData(1);
    setBlogPriorityAi(1);
    setShowBlogForm(true);
  };

  const handleEditBlog = (blog: any) => {
    setEditingBlog(blog);
    setBlogTitle(blog.title || '');
    setBlogId(blog.id || '');
    setBlogExcerpt(blog.excerpt || '');
    setBlogReadTime(blog.readTime || '');
    setBlogCategory(blog.category || '');
    setBlogDate(blog.date || '');
    setBlogUrl(blog.url || '');

    const showGeneral = !!adminConfig.general?.blogs?.some((b: any) => b.id === blog.id);
    const showData = !!adminConfig['data-engineer']?.blogs?.some((b: any) => b.id === blog.id);
    const showAi = !!adminConfig['ai-engineer']?.blogs?.some((b: any) => b.id === blog.id);

    setBlogShowGeneral(showGeneral);
    setBlogShowData(showData);
    setBlogShowAi(showAi);

    const priGeneral = adminConfig.general?.blogs?.find((b: any) => b.id === blog.id)?.priority?.general ?? 1;
    const priData = adminConfig['data-engineer']?.blogs?.find((b: any) => b.id === blog.id)?.priority?.['data-engineer'] ?? 1;
    const priAi = adminConfig['ai-engineer']?.blogs?.find((b: any) => b.id === blog.id)?.priority?.['ai-engineer'] ?? 1;

    setBlogPriorityGeneral(priGeneral);
    setBlogPriorityData(priData);
    setBlogPriorityAi(priAi);

    setShowBlogForm(true);
  };

  const handleSaveBlog = () => {
    if (!blogTitle.trim()) return;
    const cleanId = blogId.trim() || blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const updatedBlog: any = {
      id: cleanId,
      title: blogTitle.trim(),
      excerpt: blogExcerpt.trim(),
      readTime: blogReadTime.trim(),
      category: blogCategory.trim(),
      date: blogDate.trim(),
      url: blogUrl.trim(),
      priority: {
        general: blogShowGeneral ? Number(blogPriorityGeneral) : 99,
        'data-engineer': blogShowData ? Number(blogPriorityData) : 99,
        'ai-engineer': blogShowAi ? Number(blogPriorityAi) : 99
      }
    };

    setAdminConfig((prev: any) => {
      const next = { ...prev };
      const modes = ['general', 'data-engineer', 'ai-engineer'] as const;
      const shows = [blogShowGeneral, blogShowData, blogShowAi];
      const priorities = [blogPriorityGeneral, blogPriorityData, blogPriorityAi];

      modes.forEach((mode, idx) => {
        const isVisible = shows[idx];
        let blogsList = next[mode]?.blogs ? [...next[mode].blogs] : [];
        blogsList = blogsList.filter((b: any) => b.id !== cleanId);

        if (isVisible) {
          const modeSpecificBlog = {
            ...updatedBlog,
            priority: {
              ...updatedBlog.priority,
              [mode]: Number(priorities[idx])
            }
          };
          blogsList.push(modeSpecificBlog);
          blogsList.sort((a: any, b: any) => (a.priority?.[mode] ?? 99) - (b.priority?.[mode] ?? 99));
        }

        next[mode] = {
          ...next[mode],
          blogs: blogsList
        };
      });
      return next;
    });

    setShowBlogForm(false);
    setEditingBlog(null);
  };

  const handleDeleteBlog = (blogIdToDelete: string) => {
    if (!window.confirm("Are you sure you want to delete this blog post from all profiles?")) return;
    setAdminConfig((prev: any) => {
      const next = { ...prev };
      const modes = ['general', 'data-engineer', 'ai-engineer'] as const;
      modes.forEach(mode => {
        if (next[mode]?.blogs) {
          next[mode].blogs = next[mode].blogs.filter((b: any) => b.id !== blogIdToDelete);
        }
      });
      return next;
    });
  };

  // Skills CRUD Actions
  const handleAddSkillCat = () => {
    setEditingSkillCat(null);
    setSkillCatTitle('');
    setSkillList([]);
    setSkillShowGeneral(true);
    setSkillShowData(false);
    setSkillShowAi(false);
    setSkillPriorityGeneral(1);
    setSkillPriorityData(1);
    setSkillPriorityAi(1);
    setShowSkillForm(true);
  };

  const handleEditSkillCat = (cat: any) => {
    setEditingSkillCat(cat);
    setSkillCatTitle(cat.title || '');
    setSkillList(cat.skills || []);

    const showGeneral = !!adminConfig.general?.skills?.some((s: any) => s.title === cat.title);
    const showData = !!adminConfig['data-engineer']?.skills?.some((s: any) => s.title === cat.title);
    const showAi = !!adminConfig['ai-engineer']?.skills?.some((s: any) => s.title === cat.title);

    setSkillShowGeneral(showGeneral);
    setSkillShowData(showData);
    setSkillShowAi(showAi);

    const priGeneral = adminConfig.general?.skills?.find((s: any) => s.title === cat.title)?.priority?.general ?? 1;
    const priData = adminConfig['data-engineer']?.skills?.find((s: any) => s.title === cat.title)?.priority?.['data-engineer'] ?? 1;
    const priAi = adminConfig['ai-engineer']?.skills?.find((s: any) => s.title === cat.title)?.priority?.['ai-engineer'] ?? 1;

    setSkillPriorityGeneral(priGeneral);
    setSkillPriorityData(priData);
    setSkillPriorityAi(priAi);

    setShowSkillForm(true);
  };

  const handleSaveSkillCat = () => {
    if (!skillCatTitle.trim()) return;

    const updatedCat: any = {
      title: skillCatTitle.trim(),
      skills: skillList.filter(s => s.name.trim()),
      priority: {
        general: skillShowGeneral ? Number(skillPriorityGeneral) : 99,
        'data-engineer': skillShowData ? Number(skillPriorityData) : 99,
        'ai-engineer': skillShowAi ? Number(skillPriorityAi) : 99
      }
    };

    setAdminConfig((prev: any) => {
      const next = { ...prev };
      const modes = ['general', 'data-engineer', 'ai-engineer'] as const;
      const shows = [skillShowGeneral, skillShowData, skillShowAi];
      const priorities = [skillPriorityGeneral, skillPriorityData, skillPriorityAi];

      modes.forEach((mode, idx) => {
        const isVisible = shows[idx];
        let skillsList = next[mode]?.skills ? [...next[mode].skills] : [];
        
        // Remove existing category with this title
        skillsList = skillsList.filter((s: any) => s.title !== skillCatTitle.trim());
        if (editingSkillCat && editingSkillCat.title !== skillCatTitle.trim()) {
          skillsList = skillsList.filter((s: any) => s.title !== editingSkillCat.title);
        }

        if (isVisible) {
          const modeSpecificCat = {
            ...updatedCat,
            priority: {
              ...updatedCat.priority,
              [mode]: Number(priorities[idx])
            }
          };
          skillsList.push(modeSpecificCat);
          skillsList.sort((a: any, b: any) => (a.priority?.[mode] ?? 99) - (b.priority?.[mode] ?? 99));
        }

        next[mode] = {
          ...next[mode],
          skills: skillsList
        };
      });
      return next;
    });

    setShowSkillForm(false);
    setEditingSkillCat(null);
  };

  const handleDeleteSkillCat = (titleToDelete: string) => {
    if (!window.confirm("Are you sure you want to delete this skills category from all profiles?")) return;
    setAdminConfig((prev: any) => {
      const next = { ...prev };
      const modes = ['general', 'data-engineer', 'ai-engineer'] as const;
      modes.forEach(mode => {
        if (next[mode]?.skills) {
          next[mode].skills = next[mode].skills.filter((s: any) => s.title !== titleToDelete);
        }
      });
      return next;
    });
  };

  // Secure full screen login gate
  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center py-28 px-4 font-sans relative overflow-hidden">
        {/* Soft Background Accents */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl -z-10" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={`max-w-md w-full p-8 rounded-3xl border backdrop-blur-2xl ${
            isDark ? 'bg-black/45 border-white/[0.08] text-white' : 'bg-white/80 border-slate-200 text-slate-900 shadow-xl'
          }`}
        >
          <div className="text-center mb-8">
            <div className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
              isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-100 border border-slate-250'
            }`}>
              <Lock className="w-6 h-6 text-sky-400" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Admin Console Gate</h2>
            <p className={`text-xs mt-2 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Verify credentials to unlock CRUD panel &amp; system telemetry.
            </p>
          </div>

          {loginError && (
            <div className="mb-6 p-3.5 rounded-xl border border-rose-500/25 bg-rose-500/10 text-rose-500 text-xs font-mono text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Authentication credentials invalid.</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Username"
                className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-6 bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Once authenticated: Render Admin control console
  return (
    <div className="min-h-screen py-28 px-4 md:px-12 max-w-7xl mx-auto w-full select-none font-sans relative">
      
      {/* Dynamic Unsaved Changes Floating Bar */}
      <AnimatePresence>
        {hasUnsavedChanges() && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-lg w-[90%] z-50 p-4 rounded-2xl border border-amber-500/30 bg-amber-950/90 text-white flex items-center justify-between gap-4 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
              <div>
                <p className="text-xs font-bold font-mono">Unpublished Draft Changes</p>
                <p className="text-[10px] opacity-75 mt-0.5">Modifications exist in local cache. Save to publish and re-index RAG.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setAdminConfig(JSON.parse(JSON.stringify(originalConfig)))}
                className="px-3 py-1.5 border border-white/20 hover:bg-white/10 rounded-lg text-[10px] font-semibold cursor-pointer"
              >
                Discard
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1"
              >
                {publishing ? (
                  <Loader2 className="w-3 h-3 animate-spin text-black" />
                ) : (
                  <>
                    <Save className="w-3 h-3" />
                    <span>Publish</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Publish Success Notification */}
      <AnimatePresence>
        {publishSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-md z-50 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/95 text-white flex items-center gap-3 shadow-2xl backdrop-blur-md"
          >
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-bold font-mono">Configuration Published</p>
              <p className="text-[10px] opacity-75 mt-0.5">Updates are live. RAG semantic re-indexing is running in the background.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO HEADER */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-[0.2em] uppercase w-fit ${
                isDark 
                  ? 'bg-[#007AFF15] border-[#007AFF30] text-[#007AFF]' 
                  : 'bg-[#007AFF10] border-[#007AFF20] text-[#007AFF]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>CONTROL CONSOLE</span>
            </motion.div>
            
            <button
              onClick={handleLogout}
              className="text-[10px] font-bold font-mono text-rose-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer shrink-0 uppercase tracking-wider animate-pulse"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-semibold tracking-tight leading-none mb-4 mt-6"
          >
            System &amp; CRUD Dashboard<br />
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
              isDark 
                ? 'from-white via-white/80 to-white/40' 
                : 'from-neutral-950 via-neutral-900 to-neutral-500'
            } italic font-serif font-medium`}>Dynamic Portfolio Configuration Manager</span>
          </motion.h1>
        </div>

        {/* Tab Selection Glassmorphic Control */}
        <div className={`p-1 rounded-2xl border flex items-center gap-1 backdrop-blur-xl overflow-x-auto max-w-full scrollbar-none shrink-0 ${
          isDark ? 'bg-white/5 border-white/[0.08]' : 'bg-slate-100 border-slate-200'
        }`}>
          {[
            { id: 'analytics', label: 'Analytics' },
            { id: 'rag', label: 'RAG Explorer' },
            { id: 'unanswered', label: 'Queries' },
            { id: 'config', label: 'Hero/Home' },
            { id: 'projects', label: 'Projects' },
            { id: 'skills', label: 'Skills' },
            { id: 'certifications', label: 'Certs' },
            { id: 'blogs', label: 'Blogs' },
            { id: 'uploads', label: 'Assets' },
            { id: 'settings', label: 'Settings' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setShowProjectForm(false);
                  setShowCertForm(false);
                  setShowBlogForm(false);
                  setShowSkillForm(false);
                  setActiveTab(tab.id as any);
                }}
                className={`relative px-3.5 py-2 rounded-xl text-[10px] md:text-xs font-mono font-medium tracking-wide transition-all duration-300 cursor-pointer shrink-0 ${
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
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-xl border border-rose-500/25 bg-rose-500/10 text-rose-500 flex items-center gap-3 text-xs md:text-sm font-mono">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
          <button onClick={() => fetchData()} className="underline ml-auto font-bold hover:text-rose-400">Retry Sync</button>
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
              {/* STATS Bento GRID */}
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

                {/* Helpful ratio */}
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

                {/* Latency */}
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

                {/* Telemetry Tokens */}
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
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono font-semibold">
                      Tokens ({stats?.tokens_used?.input ? Math.round(stats.tokens_used.input / 1000) : 0}k in / {stats?.tokens_used?.output ? Math.round(stats.tokens_used.output / 1000) : 0}k out)
                    </p>
                  </div>
                </div>

                {/* Estimated Cost */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
                  isDark ? 'bg-slate-950/45 border-slate-900 hover:border-slate-800' : 'bg-white border-slate-200 hover:shadow-md'
                }`}>
                  <div className="flex items-center justify-between text-slate-400 mb-4">
                    <DollarSign className="w-5 h-5 text-pink-500" />
                    <span className="text-[10px] font-mono opacity-50">COST</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">
                      ${stats?.estimated_cost_usd ? stats.estimated_cost_usd.toFixed(4) : "0.00"}
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono font-semibold">Gemini API spends</p>
                  </div>
                </div>
              </div>

              {/* Chat conversations and outreach gateway */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Conversations list (Left - 5 cols) */}
                <div className={`lg:col-span-5 p-6 rounded-2xl border flex flex-col h-[550px] overflow-hidden ${
                  isDark ? 'bg-slate-950/40 border-slate-900' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono opacity-60 mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>Chat Streams</span>
                  </h3>
                  
                  <div className="flex-grow overflow-y-auto space-y-3.5 custom-scrollbar pr-1">
                    {logs.sessions.length > 0 ? (
                      logs.sessions.map((session: any) => {
                        const isSelected = session.id === selectedSessionId;
                        const ratingAvg = session.messages.filter((m: any) => m.rating === 1).length;
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
                            <div className="text-xs truncate font-medium text-slate-355">
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

                {/* Chat transcript details (Right - 7 cols) */}
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

              {/* Outreach submissions logs */}
              <div className={`p-6 rounded-2xl border space-y-6 ${
                isDark ? 'bg-slate-950/40 border-slate-900' : 'bg-white border-slate-200'
              }`}>
                <div className="border-b border-slate-850 pb-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono opacity-60">Outbox Recruiter Outreach Gateway</h3>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Contact form submissions catalogued by intent category.</p>
                </div>

                <div className="overflow-x-auto">
                  {logs.leads.length > 0 ? (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="opacity-50 border-b border-slate-900/40 font-mono">
                          <th className="pb-3 pr-4 font-normal">SENDER</th>
                          <th className="pb-3 pr-4 font-normal">EMAIL</th>
                          <th className="pb-3 pr-4 font-normal">INTENT</th>
                          <th className="pb-3 pr-4 font-normal">SUBJECT &amp; MESSAGE</th>
                          <th className="pb-3 font-normal">TIMESTAMP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.leads.map((l: any) => (
                          <tr key={l.id} className="border-b border-slate-900/30 hover:bg-white/5 transition-colors">
                            <td className="py-4 pr-4 font-semibold">{l.name}</td>
                            <td className="py-4 pr-4 font-mono">{l.email}</td>
                            <td className="py-4 pr-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider ${
                                l.intent_category === 'Hiring Inquiry' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                l.intent_category === 'Collaboration' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                              }`}>
                                {l.intent_category}
                              </span>
                            </td>
                            <td className="py-4 pr-4 max-w-sm">
                              <p className="font-semibold text-slate-200">{l.subject}</p>
                              <p className="opacity-60 mt-1 whitespace-pre-wrap">{l.message}</p>
                            </td>
                            <td className="py-4 font-mono opacity-50">{formatTime(l.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-8 text-center text-xs opacity-50 font-mono">
                      No outreach inquiries received yet.
                    </div>
                  )}
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
              {/* RAG playground */}
              <div className={`p-6 rounded-2xl border space-y-6 ${
                isDark ? 'bg-slate-950/45 border-slate-900' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono opacity-60">RAG Semantic Search Playground</h3>
                  <p className="text-xs opacity-60 mt-1">Queries the cached vector chunks directly to inspect matching coefficients.</p>
                </div>

                <form onSubmit={handleRagSearch} className="flex gap-3">
                  <div className="relative flex-grow">
                    <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={ragQuery}
                      onChange={(e) => setRagQuery(e.target.value)}
                      placeholder="Query vector index (e.g. 'Do you know Python?')"
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-250 text-slate-900'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={ragSearching}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
                  >
                    {ragSearching ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Search Chunks</span>
                      </>
                    )}
                  </button>
                </form>

                {ragResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ragResults.map((result: any, index: number) => {
                      const scorePct = Math.round(result.similarity * 100);
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.04 }}
                          className={`p-4 rounded-xl border flex flex-col gap-3 transition-colors ${
                            isDark ? 'bg-slate-950/70 border-slate-900/60 hover:border-slate-850' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[10px] font-mono opacity-50 px-2 py-0.5 rounded bg-slate-900/40 border border-slate-800 uppercase font-bold tracking-wider">
                                {result.source_file}
                              </span>
                              <h4 className="text-xs font-bold mt-2 truncate max-w-[250px]">{result.chunk_title}</h4>
                            </div>
                            <div className="text-right shrink-0">
                              <span className={`text-xs font-bold ${
                                scorePct >= 80 ? 'text-emerald-400' : scorePct >= 65 ? 'text-amber-400' : 'text-slate-400'
                              }`}>{scorePct}% Match</span>
                              <div className={`relative h-1 w-full rounded-full overflow-hidden mt-1 ${
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
                          </div>

                          <div className={`p-4 rounded-xl font-mono text-[10px] md:text-xs border whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-48 custom-scrollbar ${
                            isDark ? 'bg-[#060608]/80 border-slate-900/60 text-slate-300' : 'bg-slate-50 border-slate-150 text-slate-700'
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
          ) : activeTab === 'unanswered' ? (
            <motion.div
              key="unanswered-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="mb-6 px-1">
                  <h3 className="text-lg font-semibold tracking-tight">Unresolved Recruiter &amp; Visitor Queries</h3>
                  <p className="text-xs opacity-60 mt-1 font-mono">
                    Questions asked in the chatbot where the AI twin lacked specific RAG context. Review them to upload context to the portfolio.
                  </p>
                </div>

                {unanswered.length > 0 ? (
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
                            <span>Session ID: {q.session_id ? q.session_id.substring(0, 8) : "none"}...</span>
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
          ) : activeTab === 'config' ? (
            <motion.div
              key="config-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className={`p-6 rounded-2xl border space-y-6 ${
                isDark ? 'bg-slate-950/45 border-slate-900' : 'bg-white border-slate-200'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-900/30">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider font-mono opacity-60">Hero Configuration &amp; Home Page Editor</h3>
                    <p className="text-xs opacity-60 mt-1">Configure profile-specific branding headlines and overall philosophy statement.</p>
                  </div>

                  {/* Profile Mode Selector */}
                  <select
                    value={selectedHeroMode}
                    onChange={(e) => setSelectedHeroMode(e.target.value as ProfileMode)}
                    className={`px-3 py-1.5 text-xs rounded-xl border font-mono font-bold focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="general">GENERAL PROFILE</option>
                    <option value="data-engineer">DATA ENGINEER PROFILE</option>
                    <option value="ai-engineer">AI ENGINEER PROFILE</option>
                  </select>
                </div>

                {adminConfig && adminConfig[selectedHeroMode] ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Badge Text</label>
                        <input
                          type="text"
                          value={adminConfig[selectedHeroMode].hero?.badge || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminConfig((prev: any) => {
                              const next = { ...prev };
                              next[selectedHeroMode].hero.badge = val;
                              return next;
                            });
                          }}
                          className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Full Title Name</label>
                        <input
                          type="text"
                          value={adminConfig[selectedHeroMode].hero?.titleName || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminConfig((prev: any) => {
                              const next = { ...prev };
                              next[selectedHeroMode].hero.titleName = val;
                              return next;
                            });
                          }}
                          className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Main Title Headline</label>
                      <input
                        type="text"
                        value={adminConfig[selectedHeroMode].hero?.headline || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdminConfig((prev: any) => {
                            const next = { ...prev };
                            next[selectedHeroMode].hero.headline = val;
                            return next;
                          });
                        }}
                        className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Hero Subtext Description</label>
                      <textarea
                        rows={3}
                        value={adminConfig[selectedHeroMode].hero?.subtext || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdminConfig((prev: any) => {
                            const next = { ...prev };
                            next[selectedHeroMode].hero.subtext = val;
                            return next;
                          });
                        }}
                        className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Trust Row Tags (Comma-separated)</label>
                      <input
                        type="text"
                        value={adminConfig[selectedHeroMode].hero?.trustRow ? adminConfig[selectedHeroMode].hero.trustRow.join(', ') : ''}
                        onChange={(e) => {
                          const val = e.target.value.split(',').map(s => s.trim());
                          setAdminConfig((prev: any) => {
                            const next = { ...prev };
                            next[selectedHeroMode].hero.trustRow = val;
                            return next;
                          });
                        }}
                        className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                      {/* Tags Preview */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {adminConfig[selectedHeroMode].hero?.trustRow?.map((tag: string, i: number) => tag && (
                          <span key={i} className="text-[9px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Philosophy Statement</label>
                      <textarea
                        rows={4}
                        value={adminConfig[selectedHeroMode].philosophy || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdminConfig((prev: any) => {
                            const next = { ...prev };
                            next[selectedHeroMode].philosophy = val;
                            return next;
                          });
                        }}
                        className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          ) : activeTab === 'projects' ? (
            <motion.div
              key="projects-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {showProjectForm ? (
                <div className={`p-6 rounded-2xl border space-y-6 ${
                  isDark ? 'bg-slate-950/45 border-slate-900' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-900/30">
                    <h3 className="text-sm font-semibold uppercase tracking-wider font-mono opacity-60">
                      {editingProject ? `Edit Project: ${projTitle}` : 'Create New Project'}
                    </h3>
                    <button
                      onClick={() => setShowProjectForm(false)}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono hover:bg-white/10 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Project Title</label>
                        <input
                          type="text"
                          required
                          value={projTitle}
                          onChange={(e) => setProjTitle(e.target.value)}
                          placeholder="e.g. My Delta ETL Pipeline"
                          className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Project ID / Slug (Read-only after creation)</label>
                        <input
                          type="text"
                          disabled={!!editingProject}
                          value={projId || projTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
                          onChange={(e) => setProjId(e.target.value)}
                          placeholder="Auto-generated from title"
                          className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white opacity-60' : 'bg-slate-50 border-slate-200 text-slate-900 opacity-60'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Project Description</label>
                      <textarea
                        rows={3}
                        required
                        value={projDesc}
                        onChange={(e) => setProjDesc(e.target.value)}
                        placeholder="Describe the architecture, metrics, and business value of the project..."
                        className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Project Status</label>
                        <select
                          value={projStatus}
                          onChange={(e) => setProjStatus(e.target.value as any)}
                          className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none transition-all ${
                            isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        >
                          <option value="Deployed">Deployed</option>
                          <option value="Beta">Beta</option>
                          <option value="In Progress">In Progress</option>
                        </select>
                      </div>

                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-semibold">
                          <input
                            type="checkbox"
                            checked={projFeatured}
                            onChange={(e) => setProjFeatured(e.target.checked)}
                            className="rounded border-slate-805 text-sky-505 w-4 h-4 bg-transparent"
                          />
                          <span>Featured Project</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">GitHub URL</label>
                        <input
                          type="url"
                          value={projGithubUrl}
                          onChange={(e) => setProjGithubUrl(e.target.value)}
                          placeholder="https://github.com/..."
                          className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Demo URL (Optional)</label>
                        <input
                          type="url"
                          value={projDemoUrl}
                          onChange={(e) => setProjDemoUrl(e.target.value)}
                          placeholder="https://..."
                          className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Technologies (Comma-separated)</label>
                      <input
                        type="text"
                        value={projTechs}
                        onChange={(e) => setProjTechs(e.target.value)}
                        placeholder="Python, Spark, Databricks, Delta Lake"
                        className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                      {/* Tech Preview */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {projTechs.split(',').map((tag, i) => tag.trim() && (
                          <span key={i} className="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{tag.trim()}</span>
                        ))}
                      </div>
                    </div>

                    {/* Metrics list */}
                    <div className="border border-white/5 p-4 rounded-xl space-y-3 bg-white/[0.01]">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase opacity-60">Project Success Metrics</label>
                        <button
                          type="button"
                          onClick={() => setProjMetrics(prev => [...prev, { label: '', value: '' }])}
                          className="text-[9px] font-mono px-2 py-1 rounded bg-white/5 hover:bg-white/10 flex items-center gap-1 cursor-pointer border border-white/10 text-sky-400 font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Metric</span>
                        </button>
                      </div>

                      {projMetrics.length > 0 ? (
                        <div className="space-y-2">
                          {projMetrics.map((metric, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={metric.label}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setProjMetrics(prev => prev.map((m, i) => i === idx ? { ...m, label: val } : m));
                                }}
                                placeholder="Metric Label (e.g. Query speed uplift)"
                                className={`flex-grow px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                                  isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                              />
                              <input
                                type="text"
                                value={metric.value}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setProjMetrics(prev => prev.map((m, i) => i === idx ? { ...m, value: val } : m));
                                }}
                                placeholder="Value (e.g. 40%)"
                                className={`w-32 px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                                  isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => setProjMetrics(prev => prev.filter((_, i) => i !== idx))}
                                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer border border-rose-500/20"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] opacity-40 font-mono text-center">No metrics defined for this project.</p>
                      )}
                    </div>

                    {/* Visibility & Priorities grid */}
                    <div className="border border-white/5 p-4 rounded-xl bg-white/[0.01]">
                      <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-3 opacity-60">Profile Visibility &amp; Ordering Priority</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* General checkbox/priority */}
                        <div className={`p-4 rounded-xl border ${
                          isDark ? 'bg-[#060608]/40 border-white/[0.04]' : 'bg-slate-50 border-slate-150'
                        }`}>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-bold">
                            <input
                              type="checkbox"
                              checked={projShowGeneral}
                              onChange={(e) => setProjShowGeneral(e.target.checked)}
                              className="rounded border-slate-805 text-sky-505 w-4 h-4"
                            />
                            <span>General View</span>
                          </label>
                          {projShowGeneral && (
                            <div className="mt-3">
                              <label className="block text-[8px] font-mono opacity-50 mb-1">General Priority Order</label>
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={projPriorityGeneral}
                                onChange={(e) => setProjPriorityGeneral(Number(e.target.value))}
                                className={`w-full px-2.5 py-1.5 text-xs rounded-lg border focus:outline-none ${
                                  isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                }`}
                              />
                            </div>
                          )}
                        </div>

                        {/* Data Engineer checkbox/priority */}
                        <div className={`p-4 rounded-xl border ${
                          isDark ? 'bg-[#060608]/40 border-white/[0.04]' : 'bg-slate-50 border-slate-150'
                        }`}>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-bold">
                            <input
                              type="checkbox"
                              checked={projShowData}
                              onChange={(e) => setProjShowData(e.target.checked)}
                              className="rounded border-slate-805 text-sky-505 w-4 h-4"
                            />
                            <span>Data Eng View</span>
                          </label>
                          {projShowData && (
                            <div className="mt-3">
                              <label className="block text-[8px] font-mono opacity-50 mb-1">Data Eng Priority Order</label>
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={projPriorityData}
                                onChange={(e) => setProjPriorityData(Number(e.target.value))}
                                className={`w-full px-2.5 py-1.5 text-xs rounded-lg border focus:outline-none ${
                                  isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                }`}
                              />
                            </div>
                          )}
                        </div>

                        {/* AI Engineer checkbox/priority */}
                        <div className={`p-4 rounded-xl border ${
                          isDark ? 'bg-[#060608]/40 border-white/[0.04]' : 'bg-slate-50 border-slate-150'
                        }`}>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-bold">
                            <input
                              type="checkbox"
                              checked={projShowAi}
                              onChange={(e) => setProjShowAi(e.target.checked)}
                              className="rounded border-slate-805 text-sky-505 w-4 h-4"
                            />
                            <span>AI Eng View</span>
                          </label>
                          {projShowAi && (
                            <div className="mt-3">
                              <label className="block text-[8px] font-mono opacity-50 mb-1">AI Eng Priority Order</label>
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={projPriorityAi}
                                onChange={(e) => setProjPriorityAi(Number(e.target.value))}
                                className={`w-full px-2.5 py-1.5 text-xs rounded-lg border focus:outline-none ${
                                  isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                }`}
                              />
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProject}
                    className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                  >
                    Save Project Draft
                  </button>
                </div>
              ) : (
                <div className={`p-6 rounded-2xl border space-y-6 ${
                  isDark ? 'bg-slate-950/45 border-slate-900' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-900/30">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider font-mono opacity-60">Dynamic Projects List</h3>
                      <p className="text-xs opacity-60 mt-1">Manage project descriptions, links, and priorities globally across views.</p>
                    </div>

                    <button
                      onClick={handleAddProject}
                      className="px-4 py-2 bg-gradient-to-tr from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Project</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    {getUniqueProjects().length > 0 ? (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="opacity-50 border-b border-slate-900/40 font-mono">
                            <th className="pb-3 pr-4 font-normal">PROJECT NAME</th>
                            <th className="pb-3 pr-4 font-normal">STATUS</th>
                            <th className="pb-3 pr-4 font-normal">PROFILES VISIBLE</th>
                            <th className="pb-3 pr-4 font-normal">TECHNOLOGIES</th>
                            <th className="pb-3 font-normal text-right">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getUniqueProjects().map((proj: any) => {
                            const showG = adminConfig.general?.projects?.some((p: any) => p.id === proj.id);
                            const showD = adminConfig['data-engineer']?.projects?.some((p: any) => p.id === proj.id);
                            const showA = adminConfig['ai-engineer']?.projects?.some((p: any) => p.id === proj.id);
                            return (
                              <tr key={proj.id} className="border-b border-slate-900/30 hover:bg-white/5 transition-colors">
                                <td className="py-4 pr-4 font-semibold text-slate-200">
                                  <span>{proj.title}</span>
                                  {proj.featured && <span className="ml-2 text-[8px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1 py-0.5 rounded">FEATURED</span>}
                                </td>
                                <td className="py-4 pr-4">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold ${
                                    proj.status === 'Deployed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    proj.status === 'Beta' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                  }`}>
                                    {proj.status}
                                  </span>
                                </td>
                                <td className="py-4 pr-4 flex flex-wrap gap-1 pt-4">
                                  {showG && <span className="text-[8px] font-mono bg-sky-500/10 border border-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded">General</span>}
                                  {showD && <span className="text-[8px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">DataEng</span>}
                                  {showA && <span className="text-[8px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">AIEng</span>}
                                </td>
                                <td className="py-4 pr-4 max-w-xs truncate font-mono opacity-70">
                                  {proj.technologies ? proj.technologies.join(', ') : 'None'}
                                </td>
                                <td className="py-4 text-right">
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      onClick={() => handleEditProject(proj)}
                                      className="p-1.5 text-sky-400 hover:bg-sky-500/10 rounded-lg cursor-pointer border border-sky-500/20"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProject(proj.id)}
                                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer border border-rose-500/20"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="py-8 text-center text-xs opacity-50 font-mono">
                        No projects mapped in the database.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'skills' ? (
            <motion.div
              key="skills-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {showSkillForm ? (
                <div className={`p-6 rounded-2xl border space-y-6 ${
                  isDark ? 'bg-slate-950/45 border-slate-900' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-900/30">
                    <h3 className="text-sm font-semibold uppercase tracking-wider font-mono opacity-60">
                      {editingSkillCat ? `Edit Category: ${skillCatTitle}` : 'Create Skill Category'}
                    </h3>
                    <button
                      onClick={() => setShowSkillForm(false)}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono hover:bg-white/10 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Category Name</label>
                      <input
                        type="text"
                        required
                        value={skillCatTitle}
                        onChange={(e) => setSkillCatTitle(e.target.value)}
                        placeholder="e.g. Languages, Databases, Cloud &amp; Architectures"
                        className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    {/* Skill tags builder */}
                    <div className="border border-white/5 p-4 rounded-xl space-y-3 bg-white/[0.01]">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase opacity-60">Associated Skill Tags</label>
                        <button
                          type="button"
                          onClick={() => setSkillList(prev => [...prev, { name: '', level: 'Expert' }])}
                          className="text-[9px] font-mono px-2 py-1 rounded bg-white/5 hover:bg-white/10 flex items-center gap-1 cursor-pointer border border-white/10 text-sky-400 font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Skill</span>
                        </button>
                      </div>

                      {skillList.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {skillList.map((skill, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={skill.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSkillList(prev => prev.map((s, i) => i === idx ? { ...s, name: val } : s));
                                }}
                                placeholder="Skill keyword (e.g. Python)"
                                className={`flex-grow px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                                  isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                              />
                              <select
                                value={skill.level}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSkillList(prev => prev.map((s, i) => i === idx ? { ...s, level: val } : s));
                                }}
                                className={`w-32 px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                                  isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                }`}
                              >
                                <option value="Expert">Expert</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Intermediate">Intermediate</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => setSkillList(prev => prev.filter((_, i) => i !== idx))}
                                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer border border-rose-500/20"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] opacity-40 font-mono text-center">No individual skill keywords added yet.</p>
                      )}
                    </div>

                    {/* Visibility & Priorities grid */}
                    <div className="border border-white/5 p-4 rounded-xl bg-white/[0.01]">
                      <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-3 opacity-60">Profile Visibility &amp; Ordering Priority</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        <div className={`p-4 rounded-xl border ${
                          isDark ? 'bg-[#060608]/40 border-white/[0.04]' : 'bg-slate-50 border-slate-150'
                        }`}>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-bold">
                            <input
                              type="checkbox"
                              checked={skillShowGeneral}
                              onChange={(e) => setSkillShowGeneral(e.target.checked)}
                              className="rounded border-slate-805 text-sky-505 w-4 h-4"
                            />
                            <span>General View</span>
                          </label>
                          {skillShowGeneral && (
                            <div className="mt-3">
                              <label className="block text-[8px] font-mono opacity-50 mb-1">General Priority Order</label>
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={skillPriorityGeneral}
                                onChange={(e) => setSkillPriorityGeneral(Number(e.target.value))}
                                className={`w-full px-2.5 py-1.5 text-xs rounded-lg border focus:outline-none ${
                                  isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                }`}
                              />
                            </div>
                          )}
                        </div>

                        <div className={`p-4 rounded-xl border ${
                          isDark ? 'bg-[#060608]/40 border-white/[0.04]' : 'bg-slate-50 border-slate-150'
                        }`}>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-bold">
                            <input
                              type="checkbox"
                              checked={skillShowData}
                              onChange={(e) => setSkillShowData(e.target.checked)}
                              className="rounded border-slate-805 text-sky-505 w-4 h-4"
                            />
                            <span>Data Eng View</span>
                          </label>
                          {skillShowData && (
                            <div className="mt-3">
                              <label className="block text-[8px] font-mono opacity-50 mb-1">Data Eng Priority Order</label>
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={skillPriorityData}
                                onChange={(e) => setSkillPriorityData(Number(e.target.value))}
                                className={`w-full px-2.5 py-1.5 text-xs rounded-lg border focus:outline-none ${
                                  isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                }`}
                              />
                            </div>
                          )}
                        </div>

                        <div className={`p-4 rounded-xl border ${
                          isDark ? 'bg-[#060608]/40 border-white/[0.04]' : 'bg-slate-50 border-slate-150'
                        }`}>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-bold">
                            <input
                              type="checkbox"
                              checked={skillShowAi}
                              onChange={(e) => setSkillShowAi(e.target.checked)}
                              className="rounded border-slate-805 text-sky-505 w-4 h-4"
                            />
                            <span>AI Eng View</span>
                          </label>
                          {skillShowAi && (
                            <div className="mt-3">
                              <label className="block text-[8px] font-mono opacity-50 mb-1">AI Eng Priority Order</label>
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={skillPriorityAi}
                                onChange={(e) => setSkillPriorityAi(Number(e.target.value))}
                                className={`w-full px-2.5 py-1.5 text-xs rounded-lg border focus:outline-none ${
                                  isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                }`}
                              />
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveSkillCat}
                    className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                  >
                    Save Category Draft
                  </button>
                </div>
              ) : (
                <div className={`p-6 rounded-2xl border space-y-6 ${
                  isDark ? 'bg-slate-950/45 border-slate-900' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-900/30">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider font-mono opacity-60">Dynamic Skills Category Grid</h3>
                      <p className="text-xs opacity-60 mt-1">Manage skill subsets, levels (Expert/Advanced), and visibility priorities.</p>
                    </div>

                    <button
                      onClick={handleAddSkillCat}
                      className="px-4 py-2 bg-gradient-to-tr from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Category</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getUniqueSkills().map((cat: any) => {
                      const showG = adminConfig.general?.skills?.some((s: any) => s.title === cat.title);
                      const showD = adminConfig['data-engineer']?.skills?.some((s: any) => s.title === cat.title);
                      const showA = adminConfig['ai-engineer']?.skills?.some((s: any) => s.title === cat.title);
                      return (
                        <div
                          key={cat.title}
                          className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all hover:shadow-md ${
                            isDark ? 'bg-[#060608]/40 border-slate-900 hover:border-slate-800' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-sm font-bold text-slate-200">{cat.title}</h4>
                              <div className="flex justify-end gap-1.5 shrink-0">
                                <button
                                  onClick={() => handleEditSkillCat(cat)}
                                  className="p-1.5 text-sky-400 hover:bg-sky-500/10 rounded-lg cursor-pointer border border-sky-500/20"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSkillCat(cat.title)}
                                  className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer border border-rose-500/20"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Skills details preview */}
                            <div className="flex flex-wrap gap-1 mt-3">
                              {cat.skills?.map((s: any, idx: number) => (
                                <span key={idx} className={`text-[8px] font-mono px-2 py-0.5 rounded border ${
                                  s.level === 'Expert' ? 'bg-cyan-500/5 border-cyan-500/15 text-cyan-400' :
                                  s.level === 'Advanced' ? 'bg-indigo-500/5 border-indigo-500/15 text-indigo-400' :
                                  'bg-slate-500/5 border-slate-500/15 text-slate-400'
                                }`}>
                                  {s.name} ({s.level[0]})
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-white/[0.03] text-[9px] font-mono opacity-65">
                            <span>VISIBLE IN:</span>
                            {showG && <span className="text-sky-400">General</span>}
                            {showD && <span className="text-indigo-400">DataEng</span>}
                            {showA && <span className="text-purple-400">AIEng</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'certifications' ? (
            <motion.div
              key="certs-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {showCertForm ? (
                <div className={`p-6 rounded-2xl border space-y-6 ${
                  isDark ? 'bg-slate-950/45 border-slate-900' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-900/30">
                    <h3 className="text-sm font-semibold uppercase tracking-wider font-mono opacity-60">
                      {editingCert ? `Edit Certification: ${certTitle}` : 'Create New Certification'}
                    </h3>
                    <button
                      onClick={() => setShowCertForm(false)}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono hover:bg-white/10 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Certification Title</label>
                        <input
                          type="text"
                          required
                          value={certTitle}
                          onChange={(e) => setCertTitle(e.target.value)}
                          placeholder="e.g. Azure Solutions Architect"
                          className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Certification ID / Slug (Read-only)</label>
                        <input
                          type="text"
                          disabled={!!editingCert}
                          value={certId || certTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
                          onChange={(e) => setCertId(e.target.value)}
                          placeholder="Auto-generated ID"
                          className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white opacity-60' : 'bg-slate-50 border-slate-200 text-slate-900 opacity-60'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Issuer</label>
                        <input
                          type="text"
                          required
                          value={certIssuer}
                          onChange={(e) => setCertIssuer(e.target.value)}
                          placeholder="e.g. Microsoft, Databricks"
                          className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Credential Code / Verification ID (Optional)</label>
                        <input
                          type="text"
                          value={certCode}
                          onChange={(e) => setCertCode(e.target.value)}
                          placeholder="e.g. E123-4567"
                          className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Issue Date (e.g. Jan 2026)</label>
                        <input
                          type="text"
                          required
                          value={certDate}
                          onChange={(e) => setCertDate(e.target.value)}
                          placeholder="Jan 2026"
                          className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-semibold">
                          <input
                            type="checkbox"
                            checked={certFeatured}
                            onChange={(e) => setCertFeatured(e.target.checked)}
                            className="rounded border-slate-805 text-sky-505 w-4 h-4"
                          />
                          <span>Featured Credential</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Verification Link URL</label>
                        <input
                          type="url"
                          value={certCredUrl}
                          onChange={(e) => setCertCredUrl(e.target.value)}
                          placeholder="https://..."
                          className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Badge Image URL</label>
                        <input
                          type="url"
                          value={certBadgeUrl}
                          onChange={(e) => setCertBadgeUrl(e.target.value)}
                          placeholder="https://..."
                          className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Visibility & Priorities grid */}
                    <div className="border border-white/5 p-4 rounded-xl bg-white/[0.01]">
                      <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-3 opacity-60">Profile Visibility &amp; Ordering Priority</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        <div className={`p-4 rounded-xl border ${
                          isDark ? 'bg-[#060608]/40 border-white/[0.04]' : 'bg-slate-50 border-slate-150'
                        }`}>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-bold">
                            <input
                              type="checkbox"
                              checked={certShowGeneral}
                              onChange={(e) => setCertShowGeneral(e.target.checked)}
                              className="rounded border-slate-805 text-sky-505 w-4 h-4"
                            />
                            <span>General View</span>
                          </label>
                          {certShowGeneral && (
                            <div className="mt-3">
                              <label className="block text-[8px] font-mono opacity-50 mb-1">General Priority Order</label>
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={certPriorityGeneral}
                                onChange={(e) => setCertPriorityGeneral(Number(e.target.value))}
                                className={`w-full px-2.5 py-1.5 text-xs rounded-lg border focus:outline-none ${
                                  isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                }`}
                              />
                            </div>
                          )}
                        </div>

                        <div className={`p-4 rounded-xl border ${
                          isDark ? 'bg-[#060608]/40 border-white/[0.04]' : 'bg-slate-50 border-slate-150'
                        }`}>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-bold">
                            <input
                              type="checkbox"
                              checked={certShowData}
                              onChange={(e) => setCertShowData(e.target.checked)}
                              className="rounded border-slate-805 text-sky-505 w-4 h-4"
                            />
                            <span>Data Eng View</span>
                          </label>
                          {certShowData && (
                            <div className="mt-3">
                              <label className="block text-[8px] font-mono opacity-50 mb-1">Data Eng Priority Order</label>
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={certPriorityData}
                                onChange={(e) => setCertPriorityData(Number(e.target.value))}
                                className={`w-full px-2.5 py-1.5 text-xs rounded-lg border focus:outline-none ${
                                  isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                }`}
                              />
                            </div>
                          )}
                        </div>

                        <div className={`p-4 rounded-xl border ${
                          isDark ? 'bg-[#060608]/40 border-white/[0.04]' : 'bg-slate-50 border-slate-150'
                        }`}>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-bold">
                            <input
                              type="checkbox"
                              checked={certShowAi}
                              onChange={(e) => setCertShowAi(e.target.checked)}
                              className="rounded border-slate-805 text-sky-505 w-4 h-4"
                            />
                            <span>AI Eng View</span>
                          </label>
                          {certShowAi && (
                            <div className="mt-3">
                              <label className="block text-[8px] font-mono opacity-50 mb-1">AI Eng Priority Order</label>
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={certPriorityAi}
                                onChange={(e) => setCertPriorityAi(Number(e.target.value))}
                                className={`w-full px-2.5 py-1.5 text-xs rounded-lg border focus:outline-none ${
                                  isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                }`}
                              />
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveCert}
                    className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                  >
                    Save Certification Draft
                  </button>
                </div>
              ) : (
                <div className={`p-6 rounded-2xl border space-y-6 ${
                  isDark ? 'bg-slate-950/45 border-slate-900' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-900/30">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider font-mono opacity-60">Dynamic Certifications List</h3>
                      <p className="text-xs opacity-60 mt-1">Manage certification details, links, and visibility priorities.</p>
                    </div>

                    <button
                      onClick={handleAddCert}
                      className="px-4 py-2 bg-gradient-to-tr from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Cert</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    {getUniqueCertifications().length > 0 ? (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="opacity-50 border-b border-slate-900/40 font-mono">
                            <th className="pb-3 pr-4 font-normal">CERTIFICATION NAME</th>
                            <th className="pb-3 pr-4 font-normal">ISSUER</th>
                            <th className="pb-3 pr-4 font-normal">PROFILES VISIBLE</th>
                            <th className="pb-3 pr-4 font-normal">DATE</th>
                            <th className="pb-3 font-normal text-right">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getUniqueCertifications().map((cert: any) => {
                            const showG = adminConfig.general?.certifications?.some((c: any) => c.id === cert.id);
                            const showD = adminConfig['data-engineer']?.certifications?.some((c: any) => c.id === cert.id);
                            const showA = adminConfig['ai-engineer']?.certifications?.some((c: any) => c.id === cert.id);
                            return (
                              <tr key={cert.id} className="border-b border-slate-900/30 hover:bg-white/5 transition-colors">
                                <td className="py-4 pr-4 font-semibold text-slate-205 font-sans">
                                  <span>{cert.title}</span>
                                  {cert.featured && <span className="ml-2 text-[8px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1 py-0.5 rounded">FEATURED</span>}
                                </td>
                                <td className="py-4 pr-4">{cert.issuer}</td>
                                <td className="py-4 pr-4 flex flex-wrap gap-1 pt-4">
                                  {showG && <span className="text-[8px] font-mono bg-sky-500/10 border border-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded">General</span>}
                                  {showD && <span className="text-[8px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">DataEng</span>}
                                  {showA && <span className="text-[8px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">AIEng</span>}
                                </td>
                                <td className="py-4 pr-4 font-mono opacity-70">{cert.date}</td>
                                <td className="py-4 text-right">
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      onClick={() => handleEditCert(cert)}
                                      className="p-1.5 text-sky-400 hover:bg-sky-500/10 rounded-lg cursor-pointer border border-sky-500/20"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCert(cert.id)}
                                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer border border-rose-500/20"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="py-8 text-center text-xs opacity-50 font-mono">
                        No certifications mapped in the database.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'blogs' ? (
            <motion.div
              key="blogs-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {showBlogForm ? (
                <div className={`p-6 rounded-2xl border space-y-6 ${
                  isDark ? 'bg-slate-950/45 border-slate-900' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-900/30">
                    <h3 className="text-sm font-semibold uppercase tracking-wider font-mono opacity-60">
                      {editingBlog ? `Edit Blog: ${blogTitle}` : 'Write New Blog Post'}
                    </h3>
                    <button
                      onClick={() => setShowBlogForm(false)}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono hover:bg-white/10 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Blog Title</label>
                        <input
                          type="text"
                          required
                          value={blogTitle}
                          onChange={(e) => setBlogTitle(e.target.value)}
                          placeholder="e.g. Building Agents with Gemini"
                          className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Blog ID / Slug (Read-only)</label>
                        <input
                          type="text"
                          disabled={!!editingBlog}
                          value={blogId || blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
                          onChange={(e) => setBlogId(e.target.value)}
                          placeholder="Auto-generated ID"
                          className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white opacity-60' : 'bg-slate-50 border-slate-200 text-slate-900 opacity-60'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Excerpt / Summary Card text</label>
                      <textarea
                        rows={2}
                        required
                        value={blogExcerpt}
                        onChange={(e) => setBlogExcerpt(e.target.value)}
                        placeholder="Brief summary sentence that shows up on the card bento..."
                        className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Read Time (e.g. 5 min read)</label>
                        <input
                          type="text"
                          required
                          value={blogReadTime}
                          onChange={(e) => setBlogReadTime(e.target.value)}
                          placeholder="5 min read"
                          className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Category / Tag</label>
                        <input
                          type="text"
                          required
                          value={blogCategory}
                          onChange={(e) => setBlogCategory(e.target.value)}
                          placeholder="e.g. GenAI, Spark"
                          className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Date (e.g. July 2026)</label>
                        <input
                          type="text"
                          required
                          value={blogDate}
                          onChange={(e) => setBlogDate(e.target.value)}
                          placeholder="July 2026"
                          className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">External URL / Internal Content Slug</label>
                      <input
                        type="text"
                        required
                        value={blogUrl}
                        onChange={(e) => setBlogUrl(e.target.value)}
                        placeholder="https://medium.com/... or /blog/my-post"
                        className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    {/* Visibility & Priorities grid */}
                    <div className="border border-white/5 p-4 rounded-xl bg-white/[0.01]">
                      <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-3 opacity-60">Profile Visibility &amp; Ordering Priority</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        <div className={`p-4 rounded-xl border ${
                          isDark ? 'bg-[#060608]/40 border-white/[0.04]' : 'bg-slate-50 border-slate-150'
                        }`}>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-bold">
                            <input
                              type="checkbox"
                              checked={blogShowGeneral}
                              onChange={(e) => setBlogShowGeneral(e.target.checked)}
                              className="rounded border-slate-805 text-sky-505 w-4 h-4"
                            />
                            <span>General View</span>
                          </label>
                          {blogShowGeneral && (
                            <div className="mt-3">
                              <label className="block text-[8px] font-mono opacity-50 mb-1">General Priority Order</label>
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={blogPriorityGeneral}
                                onChange={(e) => setBlogPriorityGeneral(Number(e.target.value))}
                                className={`w-full px-2.5 py-1.5 text-xs rounded-lg border focus:outline-none ${
                                  isDark ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                }`}
                              />
                            </div>
                          )}
                        </div>

                        <div className={`p-4 rounded-xl border ${
                          isDark ? 'bg-[#060608]/40 border-white/[0.04]' : 'bg-slate-50 border-slate-150'
                        }`}>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-bold">
                            <input
                              type="checkbox"
                              checked={blogShowData}
                              onChange={(e) => setBlogShowData(e.target.checked)}
                              className="rounded border-slate-805 text-sky-505 w-4 h-4"
                            />
                            <span>Data Eng View</span>
                          </label>
                          {blogShowData && (
                            <div className="mt-3">
                              <label className="block text-[8px] font-mono opacity-50 mb-1">Data Eng Priority Order</label>
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={blogPriorityData}
                                onChange={(e) => setBlogPriorityData(Number(e.target.value))}
                                className={`w-full px-2.5 py-1.5 text-xs rounded-lg border focus:outline-none ${
                                  isDark ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                }`}
                              />
                            </div>
                          )}
                        </div>

                        <div className={`p-4 rounded-xl border ${
                          isDark ? 'bg-[#060608]/40 border-white/[0.04]' : 'bg-slate-50 border-slate-150'
                        }`}>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-bold">
                            <input
                              type="checkbox"
                              checked={blogShowAi}
                              onChange={(e) => setBlogShowAi(e.target.checked)}
                              className="rounded border-slate-805 text-sky-505 w-4 h-4"
                            />
                            <span>AI Eng View</span>
                          </label>
                          {blogShowAi && (
                            <div className="mt-3">
                              <label className="block text-[8px] font-mono opacity-50 mb-1">AI Eng Priority Order</label>
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={blogPriorityAi}
                                onChange={(e) => setBlogPriorityAi(Number(e.target.value))}
                                className={`w-full px-2.5 py-1.5 text-xs rounded-lg border focus:outline-none ${
                                  isDark ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                }`}
                              />
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveBlog}
                    className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                  >
                    Save Blog Post Draft
                  </button>
                </div>
              ) : (
                <div className={`p-6 rounded-2xl border space-y-6 ${
                  isDark ? 'bg-slate-950/45 border-slate-900' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-900/30">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider font-mono opacity-60">Dynamic Blog Posts List</h3>
                      <p className="text-xs opacity-60 mt-1">Manage technical writings, excerpt summary cards, and visibility priorities.</p>
                    </div>

                    <button
                      onClick={handleAddBlog}
                      className="px-4 py-2 bg-gradient-to-tr from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Write Post</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    {getUniqueBlogs().length > 0 ? (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="opacity-50 border-b border-slate-900/40 font-mono">
                            <th className="pb-3 pr-4 font-normal">BLOG TITLE</th>
                            <th className="pb-3 pr-4 font-normal">CATEGORY</th>
                            <th className="pb-3 pr-4 font-normal">PROFILES VISIBLE</th>
                            <th className="pb-3 pr-4 font-normal">READ TIME</th>
                            <th className="pb-3 font-normal text-right">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getUniqueBlogs().map((blog: any) => {
                            const showG = adminConfig.general?.blogs?.some((b: any) => b.id === blog.id);
                            const showD = adminConfig['data-engineer']?.blogs?.some((b: any) => b.id === blog.id);
                            const showA = adminConfig['ai-engineer']?.blogs?.some((b: any) => b.id === blog.id);
                            return (
                              <tr key={blog.id} className="border-b border-slate-900/30 hover:bg-white/5 transition-colors">
                                <td className="py-4 pr-4 font-semibold text-slate-205">{blog.title}</td>
                                <td className="py-4 pr-4">
                                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                                    {blog.category || 'Writing'}
                                  </span>
                                </td>
                                <td className="py-4 pr-4 flex flex-wrap gap-1 pt-4">
                                  {showG && <span className="text-[8px] font-mono bg-sky-500/10 border border-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded">General</span>}
                                  {showD && <span className="text-[8px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">DataEng</span>}
                                  {showA && <span className="text-[8px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">AIEng</span>}
                                </td>
                                <td className="py-4 pr-4 font-mono opacity-70">{blog.readTime || '5 min read'}</td>
                                <td className="py-4 text-right">
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      onClick={() => handleEditBlog(blog)}
                                      className="p-1.5 text-sky-400 hover:bg-sky-500/10 rounded-lg cursor-pointer border border-sky-500/20"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBlog(blog.id)}
                                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer border border-rose-500/20"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="py-8 text-center text-xs opacity-50 font-mono">
                        No blog posts mapped in the database.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'uploads' ? (
            <motion.div
              key="uploads-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* 1. Upload Profile Photo */}
                <div className={`p-6 rounded-2xl border space-y-6 ${
                  isDark ? 'bg-slate-950/45 border-slate-900' : 'bg-white border-slate-200'
                }`}>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider font-mono opacity-60 flex items-center gap-2">
                      <User className="w-4 h-4 text-sky-400" />
                      <span>Upload Profile Picture</span>
                    </h3>
                    <p className="text-xs opacity-60 mt-1">Upload a JPG or PNG photo. Replaces the default /avatar.jpg image on GCS FUSE.</p>
                  </div>

                  <div className="flex flex-col items-center gap-4 border border-dashed border-white/10 p-6 rounded-xl bg-white/[0.01]">
                    <div className={`w-28 h-28 rounded-full overflow-hidden border flex items-center justify-center bg-white/5 ${
                      isDark ? 'border-white/10' : 'border-slate-200'
                    }`}>
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs opacity-40 font-mono">No Image</span>
                      )}
                    </div>

                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-file-input"
                    />
                    
                    <div className="flex gap-2">
                      <label
                        htmlFor="avatar-file-input"
                        className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Select Photo</span>
                      </label>
                      
                      {avatarFile && (
                        <button
                          onClick={handleUploadAvatar}
                          disabled={uploadingAvatar}
                          className="px-4 py-2 bg-gradient-to-tr from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1.5"
                        >
                          {uploadingAvatar ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload photo</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {uploadAvatarSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-xl text-center">
                      ✓ Profile photo uploaded and updated successfully!
                    </div>
                  )}
                </div>

                {/* 2. Upload CV PDF */}
                <div className={`p-6 rounded-2xl border space-y-6 ${
                  isDark ? 'bg-slate-950/45 border-slate-900' : 'bg-white border-slate-200'
                }`}>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider font-mono opacity-60 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span>Upload CV Resume PDF</span>
                    </h3>
                    <p className="text-xs opacity-60 mt-1">Upload an updated PDF resume. Replaces the default Adarsh_Singh_CV.pdf.</p>
                  </div>

                  <div className="flex flex-col items-center gap-4 border border-dashed border-white/10 p-6 rounded-xl bg-white/[0.01] h-[166px] justify-center">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleCvChange}
                      className="hidden"
                      id="cv-file-input"
                    />

                    {cvFile ? (
                      <div className="text-center space-y-1">
                        <FileText className="w-8 h-8 text-cyan-400 mx-auto" />
                        <p className="text-xs font-mono font-bold max-w-[200px] truncate">{cvFile.name}</p>
                        <p className="text-[10px] opacity-50 font-mono">{(cvFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div className="text-center opacity-40 space-y-1">
                        <FileText className="w-8 h-8 mx-auto" />
                        <p className="text-xs font-mono">No PDF selected</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <label
                        htmlFor="cv-file-input"
                        className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Select PDF</span>
                      </label>
                      
                      {cvFile && (
                        <button
                          onClick={handleUploadCv}
                          disabled={uploadingCv}
                          className="px-4 py-2 bg-gradient-to-tr from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1.5"
                        >
                          {uploadingCv ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload PDF</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {uploadCvSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-xl text-center">
                      ✓ CV PDF uploaded and updated successfully!
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          ) : (
            <motion.div
              key="settings-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className={`p-6 rounded-2xl border space-y-6 max-w-xl mx-auto ${
                isDark ? 'bg-slate-950/45 border-slate-900' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono opacity-60 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-sky-450" />
                    <span>Change Admin Credentials</span>
                  </h3>
                  <p className="text-xs opacity-60 mt-1">Modify your secure admin username and password. After saving, you will be logged out.</p>
                </div>

                {changeCredError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-mono rounded-xl text-center flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>{changeCredError}</span>
                  </div>
                )}

                {changeCredSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-xl text-center">
                    ✓ Credentials updated! Redirecting to login...
                  </div>
                )}

                <form onSubmit={handleChangeCredentials} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Verify current password"
                      className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">New Username</label>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter new username"
                      className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 opacity-60">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={changingCredentials}
                    className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    {changingCredentials ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Update Credentials</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
