import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * ErrorBoundary wraps the routed page content. Any render error (e.g. a blog
 * with data that breaks a component, an undefined `blogs` array, a throw in a
 * lazy chunk) is caught here and shown as a recoverable card instead of a blank
 * white screen that only a manual refresh clears.
 */
export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode; isDark: boolean },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode; isDark: boolean }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || String(error) };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Surface it so it's diagnosable, without crashing the app.
    console.error('Portfolio render error caught by boundary:', error, info);
  }

  private retry = () => {
    this.setState({ hasError: false, message: '' });
    // Force a clean reload of the route subtree.
    window.location.reload();
  };

  render() {
    const { hasError, message } = this.state;
    const { isDark, children } = this.props;

    if (!hasError) return <>{children}</>;

    return (
      <div
        className={`min-h-[70vh] flex flex-col items-center justify-center px-6 text-center transition-colors ${
          isDark ? 'bg-[#121212] text-white' : 'bg-[#FDFBF7] text-neutral-900'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`max-w-md rounded-3xl border p-8 ${
            isDark ? 'bg-neutral-900/40 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
          }`}
        >
          <div
            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              isDark ? 'bg-rose-500/10' : 'bg-rose-500/10'
            }`}
          >
            <AlertTriangle className="w-6 h-6 text-rose-500" />
          </div>
          <h1 className="text-xl font-bold mb-2">Something glitched on this page</h1>
          <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            The page ran into an unexpected error. You can try again without losing your place.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => this.setState({ hasError: false, message: '' })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#007AFF] hover:bg-[#007AFF]/90 text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try again</span>
            </button>
            <Link
              to="/blog"
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-colors ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-slate-200'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              Back to Blog
            </Link>
          </div>
          {message && (
            <p className={`mt-5 text-[10px] font-mono break-words ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {message.slice(0, 160)}
            </p>
          )}
        </motion.div>
      </div>
    );
  }
}
