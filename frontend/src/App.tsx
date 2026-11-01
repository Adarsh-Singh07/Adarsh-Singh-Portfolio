/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { ProfileMode, ProfileData, RoleDefinition } from './types';
import PortfolioService from './services/api';
import SiteNav from './components/SiteNav';
import AdaptiveGrid from './components/AdaptiveGrid';
import PageTransition from './components/PageTransition';
import ErrorBoundary from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';
import Chatbot from './components/Chatbot';
import SmoothScroll from './components/SmoothScroll';

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

// Wrapper component to enable useLocation for 500ms vertical curtain wipe transitions
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
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route
            path="/"
            element={
              <Home
                config={profileData.hero}
                homeCards={profileData.homeCards}
                projects={profileData.projects}
                certifications={profileData.certifications}
                coordinates={profileData.coordinates}
                currentMode={currentMode}
                isDark={isDark}
                onRefreshData={onRefreshData}
              />
            }
          />
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
      </PageTransition>
    </AnimatePresence>
  );
}

export default function App() {
  const [isDark] = useState(true);
  const [currentMode, setCurrentMode] = useState<ProfileMode>('general');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setRoles] = useState<RoleDefinition[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load dynamic roles
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

  // Enforce dark mode class
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Fetch / load Supabase profile data
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

  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <SmoothScroll>
          <AdaptiveGrid />
          <AnalyticsTracker />
          <div className="min-h-screen flex flex-col relative font-sans bg-[#08080a] text-[#f3f1ea] overflow-x-hidden selection:bg-[#ff3b1d] selection:text-[#08080a]">
            {/* Global cinematic SiteNav */}
            <SiteNav />

            {profileData ? (
              <main className="relative flex-grow flex flex-col justify-start">
                {loading && (
                  <div className="fixed top-0 left-0 right-0 h-[2px] bg-[var(--accent)] animate-pulse z-[60]" />
                )}
                <Suspense fallback={
                  <div className="flex-grow flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
                  </div>
                }>
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
            ) : loading ? (
              <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#08080a] text-[#f3f1ea]">
                <Loader2 className="w-8 h-8 animate-spin text-[#ff3b1d] mb-4" />
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.22em',
                    fontSize: '0.8125rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Initializing Adarsh Singh Portfolio...
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center h-screen flex-grow">
                <div className="text-center">
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      color: 'var(--accent)',
                      fontSize: '1.25rem',
                      display: 'block',
                      marginBottom: '1rem',
                    }}
                  >
                    Architectural Loading Fault
                  </span>
                  <button 
                    onClick={() => setCurrentMode('general')}
                    className="px-6 py-2 border rounded-full text-xs hover:bg-neutral-800 transition-colors"
                    style={{ borderColor: 'var(--line-strong)', color: 'var(--foreground)' }}
                  >
                    Reset Core Engine State
                  </button>
                </div>
              </div>
            )}

            {/* Global Gen AI Chatbot */}
            <Chatbot isDark={isDark} currentMode={currentMode} />
          </div>
        </SmoothScroll>
      </BrowserRouter>
    </MotionConfig>
  );
}
