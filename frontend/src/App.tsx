/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { ProfileMode, ProfileData, RoleDefinition } from './types';
import PortfolioService from './services/api';
import { generalProfile } from './data/profileModes';
import Navbar from './components/Navbar';
import Breadcrumbs from './components/Breadcrumbs';
import ErrorBoundary from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';
import BootLoader from './components/BootLoader';
import SmoothScroll from './components/SmoothScroll';

// The chat widget is deferred off the critical path — it renders after first
// paint via Suspense and is not needed for the initial portfolio view.
const Chatbot = lazy(() => import('./components/Chatbot'));

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
          <Route path="/" element={<Home config={profileData.hero} homeCards={profileData.homeCards} projects={profileData.projects} currentMode={currentMode} isDark={isDark} onRefreshData={onRefreshData} />} />
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
  // Local-first rendering: the app paints instantly from the bundled profile
  // and upgrades to live backend data in the background (stale-while-revalidate).
  // No page ever sits on a loader waiting for the network — /contact's form
  // included. The backend fetch has a hard timeout and always falls back.
  const [profileData, setProfileData] = useState<ProfileData>(generalProfile);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Boot-loader state: the branded overlay shows only during the very first
  // boot, while the app shell is already interactive underneath. Steps advance
  // on real fetch signals with a timed fallback (~800ms) so they never look
  // stuck; dismissal is readiness-based with a sane max cap (10s) — the app
  // underneath is usable either way.
  const bootedRef = useRef(false);
  const [bootStep, setBootStep] = useState(0);
  const [bootPhase, setBootPhase] = useState<'loading' | 'leaving' | 'done'>('loading');

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

  // Sync dark mode state with document class for Tailwind v4 class-based dark variant
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Fetch / refresh data in the background whenever the active profile mode
  // toggles. The UI never blocks on this — local data renders immediately and
  // live data swaps in when it lands.
  useEffect(() => {
    let active = true;
    let stepTimer: ReturnType<typeof setInterval> | null = null;
    let capTimer: ReturnType<typeof setTimeout> | null = null;
    const isFirstBoot = !bootedRef.current;

    const finishBoot = () => {
      if (!active || bootedRef.current) return;
      bootedRef.current = true;
      // Land on the final step, hold briefly so it reads as "done", fade out.
      setBootStep(3);
      setTimeout(() => {
        if (active) setBootPhase('leaving');
      }, 450);
      // Unmount the overlay after its fade completes.
      setTimeout(() => {
        if (active) setBootPhase('done');
      }, 1100);
    };

    const loadModeData = async () => {
      setLoading(true);
      if (isFirstBoot) {
        setBootStep(0);
        // Timed fallback advancement for the loader steps.
        stepTimer = setInterval(() => {
          setBootStep((s) => Math.min(s + 1, 3));
        }, 800);
        // Sane max cap: the loader can never trap the user. The app shell
        // underneath is already interactive with local data.
        capTimer = setTimeout(() => {
          if (active) finishBoot();
        }, 10000);
      }
      try {
        const data = await PortfolioService.getProfileData(currentMode);
        if (active) {
          setProfileData(data);
        }
      } catch (err) {
        // getProfileData already falls back to the bundled profile internally;
        // keep rendering whatever we have.
        console.error('Failed to configure portfolio database details:', err);
      } finally {
        if (active) {
          if (stepTimer) clearInterval(stepTimer);
          if (capTimer) clearTimeout(capTimer);
          if (isFirstBoot) finishBoot();
          setLoading(false);
        }
      }
    };

    loadModeData();
    return () => {
      active = false;
      if (stepTimer) clearInterval(stepTimer);
      if (capTimer) clearTimeout(capTimer);
    };
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
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <SmoothScroll>
          <AnalyticsTracker />
          <div className={`min-h-screen flex flex-col relative font-sans transition-colors duration-200 overflow-x-hidden ${
            isDark ? 'bg-[#121212] text-slate-100' : 'bg-[#FDFBF7] text-neutral-900'
          }`}>
            
            {/* Global sticky persistent glass Navbar */}
            <Navbar 
              isDark={isDark} 
              toggleTheme={toggleTheme} 
              currentMode={currentMode} 
              onModeChange={handleModeChange} 
              rolesList={roles}
            />

            {/* The app shell renders immediately from local data; live backend
                data swaps in in the background. The branded loader is an
                overlay only during first boot — never a render gate. */}
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
                {/* Wrap the routed content in an ErrorBoundary so any render
                    crash shows a recoverable card instead of a blank screen. */}
                <ErrorBoundary isDark={isDark} key="routes">
                  <AnimatedRoutes 
                    profileData={profileData} 
                    currentMode={currentMode} 
                    isDark={isDark} 
                    onRefreshData={() => setRefreshTrigger(prev => prev + 1)}
                  />
                </ErrorBoundary>
              </Suspense>
            </main>
            {bootPhase !== 'done' && (
              <BootLoader step={bootStep} leaving={bootPhase === 'leaving'} />
            )}
            {/* Global Gen AI Chatbot representing Adarsh (deferred off the
                critical path via React.lazy above). */}
            <div data-chatbot-host="true">
              <Suspense fallback={null}>
                <Chatbot isDark={isDark} currentMode={currentMode} />
              </Suspense>
            </div>
          </div>
        </SmoothScroll>
      </BrowserRouter>
    </MotionConfig>
  );
}
