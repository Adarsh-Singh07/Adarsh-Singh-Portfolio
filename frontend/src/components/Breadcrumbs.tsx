import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ isDark }: { isDark: boolean }) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null; // Don't show on Home page

  // Construct BreadcrumbList schema structure
  const schemaItems = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://adarshsingh.in"
    },
    ...pathnames.map((value, index) => {
      const url = `https://adarshsingh.in/${pathnames.slice(0, index + 1).join('/')}`;
      const name = value.charAt(0).toUpperCase() + value.slice(1);
      return {
        "@type": "ListItem",
        "position": index + 2,
        "name": name,
        "item": url
      };
    })
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": schemaItems
  };

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`max-w-7xl mx-auto w-full px-6 md:px-12 pt-6 flex items-center gap-1.5 text-xs font-mono select-none ${
        isDark ? 'text-slate-400' : 'text-slate-650'
      }`}
    >
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      <Link 
        to="/" 
        aria-label="Go to Home" 
        className="hover:text-[#007AFF] flex items-center gap-1 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = value.charAt(0).toUpperCase() + value.slice(1);

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            {isLast ? (
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                {displayName}
              </span>
            ) : (
              <Link 
                to={to} 
                className="hover:text-[#007AFF] transition-colors"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
