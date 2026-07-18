import React, { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { Copy, Check, Info, AlertTriangle, XCircle, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import mermaid from 'mermaid';

interface MarkdownRendererProps {
  content: string;
  title?: string;
  isDark: boolean;
}

// Custom CodeBlock Component
const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code className="bg-slate-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-mono text-[0.875em]" {...props}>
        {children}
      </code>
    );
  }

  if (language === 'mermaid') {
    return <MermaidBlock chart={String(children)} />;
  }

  return (
    <div className="relative group rounded-xl overflow-hidden my-8 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1117] shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-[#161b22] border-b border-slate-200 dark:border-white/10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        {language && (
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">{language}</span>
        )}
      </div>
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Copy code"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
        <div className="overflow-x-auto p-4 custom-scrollbar">
          <code className={className} {...props}>
            {children}
          </code>
        </div>
      </div>
    </div>
  );
};

// Mermaid Lazy Component
const MermaidBlock = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState<string>('');

  React.useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'dark' });
    mermaid.render('mermaid-' + Math.random().toString(36).substr(2, 9), chart).then(({ svg }) => {
      setSvg(svg);
    }).catch(console.error);
  }, [chart]);

  return svg ? <div className="my-8 flex justify-center bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10" dangerouslySetInnerHTML={{ __html: svg }} /> : <div className="animate-pulse h-32 bg-slate-100 dark:bg-white/5 rounded-xl my-8" />;
};

// Parse GitHub Alerts from Blockquotes
const parseGitHubAlert = (children: ReactNode) => {
  let isAlert = false;
  let type = '';
  let content = children;

  React.Children.forEach(children, child => {
    if (React.isValidElement(child) && (child.props as any).children) {
      const text = (child.props as any).children[0];
      if (typeof text === 'string' && text.startsWith('[!')) {
        const match = text.match(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/);
        if (match) {
          isAlert = true;
          type = match[1].toLowerCase();
        }
      }
    }
  });

  return { isAlert, type };
};

const CustomBlockQuote = ({ children, ...props }: any) => {
  const { isAlert, type } = parseGitHubAlert(children);

  if (isAlert) {
    const iconMap = {
      note: <Info className="w-5 h-5 text-blue-500" />,
      tip: <Lightbulb className="w-5 h-5 text-emerald-500" />,
      warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
      important: <Info className="w-5 h-5 text-purple-500" />,
      caution: <XCircle className="w-5 h-5 text-red-500" />
    };
    const colorMap = {
      note: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-200',
      tip: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-200',
      warning: 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20 text-yellow-800 dark:text-yellow-200',
      important: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20 text-purple-800 dark:text-purple-200',
      caution: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-200'
    };
    
    // Strip the [!TYPE] text from the children
    const processChildren = React.Children.map(children, child => {
      if (React.isValidElement(child) && (child.props as any).children) {
        let childArray = React.Children.toArray((child.props as any).children);
        if (typeof childArray[0] === 'string' && childArray[0].startsWith(`[!${type.toUpperCase()}]`)) {
          childArray[0] = childArray[0].replace(`[!${type.toUpperCase()}]`, '').trimStart();
        }
        return React.cloneElement(child as React.ReactElement, { ...(child.props as any) }, childArray);
      }
      return child;
    });

    return (
      <div className={`my-6 px-4 py-3 border-l-4 rounded-r-lg flex gap-3 ${colorMap[type as keyof typeof colorMap]}`}>
        <div className="shrink-0 mt-0.5">{iconMap[type as keyof typeof iconMap]}</div>
        <div className="prose-sm dark:prose-invert max-w-none w-full m-0">
          <p className="font-bold mb-1 uppercase text-xs tracking-wider opacity-80">{type}</p>
          {processChildren}
        </div>
      </div>
    );
  }

  return (
    <blockquote className="border-l-[6px] border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-6 my-8 rounded-r-xl italic text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-none" {...props}>
      {children}
    </blockquote>
  );
};

export default function MarkdownRenderer({ content, title, isDark }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-lg max-w-none w-full markdown-content ${isDark ? 'prose-invert' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSanitize,
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'prepend', properties: { className: ['anchor-link'] } }],
          rehypeKatex,
          [rehypeHighlight, { ignoreMissing: true }]
        ]}
        components={{
          code: CodeBlock,
          blockquote: CustomBlockQuote,
          h1: ({ node, children, ...props }) => {
            // Deduplicate H1 if it exactly matches the blog title
            if (title && React.Children.toArray(children).join('').trim() === title.trim()) {
              return null;
            }
            return <h1 {...props}>{children}</h1>;
          },
          p: ({ node, children, ...props }) => {
            // Intercept purely tag-based paragraphs to render as chips
            const childrenArray = React.Children.toArray(children);
            const isAllStrings = childrenArray.every(child => typeof child === 'string');
            
            if (isAllStrings) {
              const textContent = childrenArray.join('').trim();
              const tagPattern = /^(\[[^\]]+\]\s*)+$/;
              
              if (tagPattern.test(textContent)) {
                const tags = textContent.match(/\[([^\]]+)\]/g)?.map(t => t.replace(/\[|\]/g, '')) || [];
                if (tags.length > 0) {
                  return (
                    <div className="flex flex-wrap gap-2 my-8">
                      {tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg text-sm font-semibold tracking-wide border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-none">
                          {tag}
                        </span>
                      ))}
                    </div>
                  );
                }
              }
            }
            return <p {...props}>{children}</p>;
          },
          img: ({ node, ...props }) => (
            <figure className="my-10">
              <Zoom zoomMargin={40}>
                <img {...props} className="rounded-xl w-full h-auto shadow-md border border-slate-200 dark:border-white/10" loading="lazy" />
              </Zoom>
              {props.alt && <figcaption className="text-center text-sm text-slate-500 mt-3">{props.alt}</figcaption>}
            </figure>
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-8 border border-slate-200 dark:border-white/10 rounded-xl custom-scrollbar shadow-sm dark:shadow-none bg-white dark:bg-transparent">
              <table className="w-full text-sm text-left m-0" {...props} />
            </div>
          ),
          tr: ({ node, ...props }) => <tr className="even:bg-slate-50 dark:even:bg-white/[0.02] hover:bg-slate-50/80 dark:hover:bg-white/[0.04] transition-colors" {...props} />,
          th: ({ node, ...props }) => <th className="bg-slate-100 dark:bg-white/[0.05] px-4 py-3 font-semibold border-b border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" {...props} />,
          td: ({ node, ...props }) => <td className="px-4 py-3 border-b border-slate-100 dark:border-white/5 last:border-0" {...props} />,
          a: ({ node, ...props }) => <a className="text-[#007AFF] no-underline hover:underline underline-offset-4 decoration-2" target={props.href?.startsWith('http') ? '_blank' : undefined} rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined} {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
