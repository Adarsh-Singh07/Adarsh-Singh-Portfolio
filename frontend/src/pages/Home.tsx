/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { HeroConfig } from '../types';
import Hero from '../sections/Hero';
import { Code2, Award, Briefcase, BookOpen, ArrowRight } from 'lucide-react';

interface HomeProps {
  config: HeroConfig;
  isDark: boolean;
}

export default function Home({ config, isDark }: HomeProps) {
  const teasers = [
    {
      title: 'Featured Bento Showcase',
      label: 'Projects',
      path: '/projects',
      description: 'Explore the Agentic AI platform, real-time sign language models, and cloud-native databases.',
      icon: Code2,
      color: 'from-blue-500/10 to-indigo-500/10 hover:border-blue-500/30'
    },
    {
      title: 'Skills & Accreditations',
      label: 'Expertise',
      path: '/skills',
      description: 'Prestige wall showcasing Generative AI, Medallion ETL architectures, and cloud credentials.',
      icon: Award,
      color: 'from-purple-500/10 to-pink-500/10 hover:border-purple-500/30'
    },
    {
      title: 'Chronological Journey',
      label: 'Career timeline',
      path: '/timeline',
      description: 'A storytelling retrospective tracing progress from academic mathematics to capgemini analytics.',
      icon: Briefcase,
      color: 'from-emerald-500/10 to-teal-500/10 hover:border-emerald-500/30'
    },
    {
      title: 'Editorial Notes & Blogs',
      label: 'Insights',
      path: '/blog',
      description: 'Deep architectural dives into hybrid vector indexing, RAG, and Spark pipelines.',
      icon: BookOpen,
      color: 'from-amber-500/10 to-orange-500/10 hover:border-amber-500/30'
    }
  ];

  // Container animation variants for stagger entry
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <div className="w-full">
      {/* Spotlight Hero V2 */}
      <Hero config={config} isDark={isDark} />

      {/* Premium Teaser Navigation Section */}
      <section className={`py-16 md:py-24 border-t relative overflow-hidden transition-colors duration-1000 ${
        isDark ? 'bg-[#050505] border-white/5' : 'bg-slate-50 border-black/5'
      }`}>
        {/* Soft atmospheric gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full filter blur-[150px] opacity-10 bg-[#007AFF]/20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
          {/* Section Heading */}
          <div className="mb-12 text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#007AFF] block mb-2">
              System Navigation
            </span>
            <h2 className="text-3xl md:text-4xl font-sans font-semibold tracking-tight">
              Explore the Portfolios
            </h2>
          </div>

          {/* Cards Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {teasers.map((teaser) => {
              const Icon = teaser.icon;
              return (
                <motion.div
                  key={teaser.label}
                  variants={cardVariants}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="h-full"
                >
                  <Link
                    to={teaser.path}
                    className={`h-full flex flex-col justify-between p-6 md:p-7 rounded-[30px] border transition-all duration-500 bg-gradient-to-br ${teaser.color} ${
                      isDark 
                        ? 'bg-neutral-900/40 border-white/5 hover:shadow-[0_20px_40px_rgba(0,122,255,0.08)]' 
                        : 'bg-white border-neutral-200/60 hover:shadow-[0_15px_30px_rgba(0,0,0,0.03)]'
                    } group cursor-pointer`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className={`p-3 rounded-2xl ${
                          isDark ? 'bg-white/5 text-white/80' : 'bg-slate-100 text-neutral-800'
                        } transition-colors group-hover:bg-[#007AFF] group-hover:text-white`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] uppercase font-mono tracking-widest ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {teaser.label}
                        </span>
                      </div>

                      <h3 className="text-lg font-sans font-semibold tracking-tight mb-2 group-hover:text-[#007AFF] transition-colors duration-300">
                        {teaser.title}
                      </h3>
                      <p className={`text-xs font-light leading-relaxed mb-6 ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {teaser.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#007AFF] self-start mt-auto">
                      <span>Enter Panel</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
