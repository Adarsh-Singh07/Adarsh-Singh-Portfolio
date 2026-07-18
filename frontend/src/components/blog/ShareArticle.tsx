import React, { useState } from 'react';
import { Link2, Twitter, Linkedin, Check } from 'lucide-react';

interface ShareArticleProps {
  url: string;
  title: string;
  isDark: boolean;
}

export default function ShareArticle({ url, title, isDark }: ShareArticleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
  };

  return (
    <div className={`py-8 flex flex-col sm:flex-row items-center gap-4 ${isDark ? 'border-t border-white/10' : 'border-t border-slate-200'}`}>
      <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        Share this article
      </span>
      <div className="flex items-center gap-3">
        <button
          onClick={shareToTwitter}
          className={`p-2.5 rounded-full transition-colors flex items-center justify-center ${
            isDark 
              ? 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
          }`}
          aria-label="Share on Twitter"
        >
          <Twitter className="w-4 h-4" />
        </button>
        <button
          onClick={shareToLinkedIn}
          className={`p-2.5 rounded-full transition-colors flex items-center justify-center ${
            isDark 
              ? 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
          }`}
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
        </button>
        <button
          onClick={handleCopy}
          className={`px-4 py-2 rounded-full transition-colors flex items-center gap-2 text-sm font-medium ${
            isDark 
              ? 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Link2 className="w-4 h-4" />}
          <span>{copied ? 'Copied' : 'Copy link'}</span>
        </button>
      </div>
    </div>
  );
}
