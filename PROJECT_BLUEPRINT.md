# Project Blueprint: Cinematic Multi-Page Portfolio

This blueprint outlines the architectural pivot from a single-page scrolling portfolio to a route-based, cinematic multi-page application.

## 1. Route Architecture
The application is structured into the following routes:
- `/` - Landing Page (Spotlight Hero & navigation teasers)
- `/projects` - Premium Bento Showcase (Case studies & categories)
- `/skills` - Prestige Wall (Technology clusters & certifications)
- `/timeline` - Storytelling Career Journey
- `/blog` - Luxury Typography Reading Experience
- `/contact` - High-Trust Contact Gateway

## 2. Shared Layout & Transition System
To preserve an expensive-feeling experience without harsh hard cuts:
- **Persistent Ambient Background**: The dark background (`#050505`) with a graphite vignette and subtle indigo/blue glows, or light background (`slate-50`) with silver titanium gradients, will persist globally.
- **AnimatePresence**: Framer Motion handles route entering/leaving.
- **Transition Specs**:
  - Fade: `opacity` from `0` to `1`
  - Blur: `filter` from `blur(10px)` to `blur(0px)`
  - Scale/Depth: `scale` from `0.98` (entering) / `1.02` (leaving) to `1`
  - Timing: `duration: 0.6`, easing: `[0.16, 1, 0.3, 1]` (custom ultra-smooth ease-out)

## 3. Navigation System V3
A floating, sticky glassmorphic pill located at the top of the viewport:
- **Glassmorphic Styling**: `backdrop-blur-xl bg-black/60 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.6)]`
- **Active Page Pill**: A sliding background highlighter implemented via Framer Motion's `layoutId="active-pill"`.
- **Hover Micro-interactions**: Smooth pill expansion and soft glow.

## 4. Python Backend Integration
A FastAPI backend designed to:
- Serve dynamic profile data from a consolidated JSON database.
- Dynamic roles endpoint `/api/v1/portfolio/roles` to enable dynamic role selectors.
- Serve profile config `/api/v1/portfolio/profile?mode=<mode>` for each role.
- Receive and sanitize contact form emails.

## 5. Skills Prestige Wall Architecture (Step 3)
The Skills Page is built with dynamic and data-driven principles:
- **Domain Mapping**: Raw skill lists are parsed on the fly into 5 clean domains: `AI / GenAI`, `Data Engineering`, `Cloud`, `Backend`, and `Developer Tools`.
- **Role Adaptive Layout**: Grid layout changes dynamically. If mode is `data-engineer`, Data Engineering gets a double-width spotlight (`col-span-8`) and Cloud gets a single (`col-span-4`). If mode is `ai-engineer`, AI/GenAI gets the double-width spotlight.
- **Executive Certification Cards**: Rendered with subtle verified badges and code tracking numbers, asserting professional credibility.
- **Engineering Philosophy**: Connects technical practices to 4 principles (Scalability First, Automation Mindset, Cloud Native Thinking, and Production Readiness) in a minimal magazine style.
