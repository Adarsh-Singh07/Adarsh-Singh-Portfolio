/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { HeroConfig, HomeCard, ProfileMode } from '../types';
import Hero from '../sections/Hero';
import { Sparkles, Award, Database, Cpu, MessageSquare, Mail, Layers, ArrowRight } from 'lucide-react';
import DetailEditModal from '../components/DetailEditModal';
import PortfolioService from '../services/api';

interface HomeProps {
  config: HeroConfig;
  homeCards?: HomeCard[];
  currentMode: ProfileMode;
  isDark: boolean;
  onRefreshData?: () => void;
}

export default function Home({ config, homeCards = [], currentMode, isDark, onRefreshData }: HomeProps) {
  const [selectedCard, setSelectedCard] = useState<HomeCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = sessionStorage.getItem('admin-token') || localStorage.getItem('admin-token');
  const isAdmin = !!token;

  // Map icon strings to Lucide components
  const getCardIcon = (id: string) => {
    switch (id) {
      case 'ai-assistant': return Cpu;
      case 'availability': return Award;
      case 'featured-stack': return Database;
      case 'quick-connect': return Mail;
      default: return Layers;
    }
  };

  const handleCardClick = (card: HomeCard) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleSave = async (updatedCard: HomeCard) => {
    if (!token) return;
    try {
      const fullConfig = await PortfolioService.getAdminConfig(token);
      const activeProfile = fullConfig[currentMode];
      if (!activeProfile) return;

      if (!activeProfile.homeCards) {
        activeProfile.homeCards = [];
      }

      const existingIndex = activeProfile.homeCards.findIndex(c => c.id === updatedCard.id);
      if (existingIndex >= 0) {
        activeProfile.homeCards[existingIndex] = updatedCard;
      } else {
        activeProfile.homeCards.push(updatedCard);
      }

      await PortfolioService.saveAdminConfig(token, fullConfig);
      if (onRefreshData) onRefreshData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save home card details:', err);
      alert('Failed to save card config.');
    }
  };

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
              System Console
            </span>
            <h2 className="text-3xl md:text-4xl font-sans font-semibold tracking-tight">
              Interactive Spotlights
            </h2>
          </div>

          {/* Cards Grid */}
          {homeCards.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {homeCards.map((card) => {
                const Icon = getCardIcon(card.id);
                return (
                  <motion.div
                    key={card.id}
                    variants={cardVariants}
                    onClick={() => handleCardClick(card)}
                    whileHover={{ y: -6, scale: 1.01 }}
                    className="h-full"
                  >
                    <div
                      className={`h-full flex flex-col justify-between p-6 md:p-7 rounded-[30px] border transition-all duration-500 bg-gradient-to-br hover:border-[#007AFF]/30 ${
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
                            {card.badge}
                          </span>
                        </div>

                        <h3 className="text-lg font-sans font-semibold tracking-tight mb-2 group-hover:text-[#007AFF] transition-colors duration-300">
                          {card.title}
                        </h3>
                        <p className={`text-xs font-light leading-relaxed mb-6 ${
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {card.description}
                        </p>
                      </div>

                      {card.id === 'ai-assistant' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.dispatchEvent(new CustomEvent('open-chatbot'));
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#007AFF] self-start mt-auto hover:text-[#007AFF]/80 transition-colors"
                        >
                          <span>{card.buttonText || 'Explore'}</span>
                          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                      ) : (
                        <Link
                          to={card.id === 'availability' ? '/timeline' : card.id === 'featured-stack' ? '/skills' : '/contact'}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#007AFF] self-start mt-auto hover:text-[#007AFF]/80 transition-colors"
                        >
                          <span>{card.buttonText || 'Explore'}</span>
                          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="text-center py-10">
              <span className="text-xs text-slate-500 font-mono">No spotlight cards loaded from profile configurations.</span>
            </div>
          )}
        </div>
      </section>

      {/* Detail Edit Modal */}
      {selectedCard && (
        <DetailEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          type="homeCard"
          item={selectedCard}
          onSave={handleSave}
          isAdmin={isAdmin}
          isDark={isDark}
        />
      )}
    </div>
  );
}
