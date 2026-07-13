/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ProfileMode, ProfileData, RoleDefinition } from './types';
import PortfolioService from './services/api';
import Navbar from './components/Navbar';
import Breadcrumbs from './components/Breadcrumbs';
import { Loader2 } from 'lucide-react';
import Chatbot from './components/Chatbot';

// Lazy load route pages for performance & LCP bundles optimizations
const Home = lazy(() => import('./pages/Home'));
const Projects = lazy(() => import('./pages/Projects'));
const Skills = lazy(() => import('./pages/Skills'));
const Certifications = lazy(() => import('./pages/Certifications'));
const Timeline = lazy(() => import('./pages/Timeline'));
const Contact = lazy(() => import('./pages/Contact'));
const Blog = lazy(() => import('./pages/Blog'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Resume = lazy(() => import('./pages/Resume'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));


declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Track page views dynamically on route transitions in a React SPA
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-5RCD25EYNQ', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}

// Wrapper component to enable useLocation for transitions
function AnimatedRoutes({ 
  profileData, 
  currentMode, 
  isDark, 
  onRefreshData 
}: { 
  profileData: ProfileData; 
  currentMode: ProfileMode; 
  isDark: boolean; 
  onRefreshData: () => void 
}) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full flex-grow"
      >
        <Routes location={location}>
          <Route path="/" element={<Home config={profileData.hero} homeCards={profileData.homeCards} currentMode={currentMode} isDark={isDark} onRefreshData={onRefreshData} />} />
          <Route path="/projects" element={<Projects projects={profileData.projects} currentMode={currentMode} isDark={isDark} onRefreshData={onRefreshData} />} />
          <Route path="/skills" element={<Skills categories={profileData.skills} strengths={profileData.strengths || []} currentMode={currentMode} isDark={isDark} onRefreshData={onRefreshData} />} />
          <Route path="/certifications" element={<Certifications certifications={profileData.certifications} currentMode={currentMode} isDark={isDark} onRefreshData={onRefreshData} />} />
          <Route path="/timeline" element={<Timeline journey={profileData.journey} currentMode={currentMode} isDark={isDark} />} />
          <Route path="/blog" element={<Blog blogs={profileData.blogs} currentMode={currentMode} isDark={isDark} onRefreshData={onRefreshData} />} />
          <Route path="/contact" element={<Contact isDark={isDark} coordinates={profileData.coordinates} currentMode={currentMode} onRefreshData={onRefreshData} />} />
          <Route path="/resume" element={<Resume profileData={profileData} isDark={isDark} />} />
          <Route path="/projects/:projectId" element={<ProjectDetail projects={profileData.projects} currentMode={currentMode} isDark={isDark} onRefreshData={onRefreshData} />} />
          <Route path="/blog/:blogId" element={<BlogDetail blogs={profileData.blogs} currentMode={currentMode} isDark={isDark} onRefreshData={onRefreshData} />} />
          <Route path="/dashboard" element={<Dashboard isDark={isDark} />} />
          <Route path="/admin" element={<Admin isDark={isDark} onRefreshData={onRefreshData} />} />
          <Route path="*" element={<NotFound isDark={isDark} />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  // Theme state: Titanium Elegant Light vs Obsidian Deep Dark
  const [isDark, setIsDark] = useState(true);
  
  // Signature role toggle state
  const [currentMode, setCurrentMode] = useState<ProfileMode>('general');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load roles dynamically from the backend on startup
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const list = await PortfolioService.getRoles();
        setRoles(list);
        if (list.length > 0 && !list.some(r => r.id === currentMode)) {
          setCurrentMode(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load dynamic portfolio roles:', err);
      }
    };
    fetchRoles();
  }, [refreshTrigger]);

  // Auto-detect system color scheme preference & persistent state
  useEffect(() => {
    const savedTheme = localStorage.getItem('luxury-portfolio-theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    }
  }, []);

  // Fetch / load data whenever the active profile mode toggles
  useEffect(() => {
    let active = true;
    const loadModeData = async () => {
      setLoading(true);
      try {
        const data = await PortfolioService.getProfileData(currentMode);
        if (active) {
          setProfileData(data);
        }
      } catch (err) {
        console.error('Failed to configure portfolio database details:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadModeData();
    return () => { active = false; };
  }, [currentMode, refreshTrigger]);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    localStorage.setItem('luxury-portfolio-theme', nextTheme ? 'dark' : 'light');
  };

  const handleModeChange = (mode: ProfileMode) => {
    setCurrentMode(mode);
  };

  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <div className={`min-h-screen flex flex-col relative font-sans transition-colors duration-1000 overflow-x-hidden ${
        isDark ? 'bg-[#050505] text-slate-100' : 'bg-slate-50 text-neutral-900'
      }`}>
        
        {/* Global sticky persistent glass Navbar */}
        <Navbar 
          isDark={isDark} 
          toggleTheme={toggleTheme} 
          currentMode={currentMode} 
          onModeChange={handleModeChange} 
          rolesList={roles}
        />

        {profileData ? (
          <main className="relative flex-grow flex flex-col justify-start">
            {loading && (
              <div className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#00E5FF] via-indigo-500 to-pink-500 animate-pulse z-[60]" />
            )}
            <Breadcrumbs isDark={isDark} />
            <Suspense fallback={
              <div className="flex-grow flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#007AFF]" />
              </div>
            }>
              <AnimatedRoutes 
                profileData={profileData} 
                currentMode={currentMode} 
                isDark={isDark} 
                onRefreshData={() => setRefreshTrigger(prev => prev + 1)}
              />
            </Suspense>
          </main>
        ) : loading ? (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-white">
            <Loader2 className="w-8 h-8 animate-spin text-sky-400 mb-4" />
            <span className="font-display text-xs tracking-widest uppercase">Initializing Adarsh Singh Portfolio...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center h-screen flex-grow">
            <div className="text-center">
              <span className="font-display font-medium text-red-500 text-sm block mb-2">Architectural Loading Fault</span>
              <button 
                onClick={() => setCurrentMode('general')}
                className="px-4 py-2 border rounded-full text-xs hover:bg-neutral-800 hover:text-white"
              >
                Reset Core Engine State
              </button>
            </div>
          </div>
        )}
        {/* Global Gen AI Chatbot representing Adarsh */}
        <Chatbot isDark={isDark} currentMode={currentMode} />
      </div>
    </BrowserRouter>

  );
}
