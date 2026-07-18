/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { HeroConfig, HomeCard, ProfileMode } from '../types';
import Hero from '../sections/Hero';
import SEO from '../components/SEO';
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
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

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
        ease: [0.16, 1, 0.3, 1] as any
      }
    }
  };

  const homeSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://adarshsingh.in/#website",
        "url": "https://adarshsingh.in",
        "name": "Adarsh Singh | AI & Data Engineering",
        "description": "Portfolio of Adarsh Singh, showcasing advanced machine learning, RAG pipelines, and cloud analytics platforms.",
        "publisher": {
          "@id": "https://adarshsingh.in/#person"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://adarshsingh.in/projects?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Person",
        "@id": "https://adarshsingh.in/#person",
        "name": "Adarsh Singh",
        "jobTitle": "AI & Data Engineer",
        "url": "https://adarshsingh.in",
        "sameAs": [
          "https://github.com/Adarsh-Singh07",
          "https://www.linkedin.com/in/adarsh-singh07"
        ]
      },
      {
        "@type": "Organization",
        "@id": "https://adarshsingh.in/#organization",
        "name": "Adarsh Singh Engineering Solutions",
        "url": "https://adarshsingh.in",
        "logo": "https://adarshsingh.in/favicon.png",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "hire",
          "url": "https://adarshsingh.in/contact"
        }
      },
      {
        "@type": "FAQPage",
        "@id": "https://adarshsingh.in/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Who is Adarsh Singh?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Adarsh Singh is an AI & Data Engineer specializing in building robust, scalable generative AI applications, retrieval-augmented generation (RAG) systems, distributed data engineering pipelines, and cloud database architectures."
            }
          },
          {
            "@type": "Question",
            "name": "What technical stack does Adarsh use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "His primary stack includes Python (FastAPI, PySpark, PyTorch), TypeScript/React, SQL, Docker, Google Cloud Platform (Cloud Run, BigQuery), and Azure (Databricks, Delta Lake, ADF) for enterprise deployments."
            }
          },
          {
            "@type": "Question",
            "name": "What major AI systems has he engineered?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Key systems include an On-Demand Service Platform utilizing Agentic AI and multi-agent RAG pipelines for dynamic real-time updates, and an automated Indian Sign Language ML translation pipeline built with TensorFlow and OpenCV."
            }
          },
          {
            "@type": "Question",
            "name": "Is Adarsh available for contract consulting or freelance work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Adarsh is available for consulting on AI system design, enterprise RAG integration, data warehouse migrations, and FastAPI/React pipeline engineering. You can connect via the contact form or LinkedIn."
            }
          },
          {
            "@type": "Question",
            "name": "How can I contact him directly?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can send an encrypted message directly through the secure contact form on this website or reach out via his verified LinkedIn profile."
            }
          }
        ]
      }
    ]
  };

  const faqData = [
    {
      q: "Who is Adarsh Singh?",
      a: "Adarsh Singh is an AI & Data Engineer specializing in building robust, scalable generative AI applications, retrieval-augmented generation (RAG) systems, distributed data engineering pipelines, and cloud database architectures."
    },
    {
      q: "What technical stack does Adarsh use?",
      a: "His primary stack includes Python (FastAPI, PySpark, PyTorch), TypeScript/React, SQL, Docker, Google Cloud Platform (Cloud Run, BigQuery), and Azure (Databricks, Delta Lake, ADF) for enterprise deployments."
    },
    {
      q: "What major AI systems has he engineered?",
      a: "Key systems include an On-Demand Service Platform utilizing Agentic AI and multi-agent RAG pipelines for dynamic real-time updates, and an automated Indian Sign Language ML translation pipeline built with TensorFlow and OpenCV."
    },
    {
      q: "Is Adarsh available for contract consulting or freelance work?",
      a: "Yes, Adarsh is available for consulting on AI system design, enterprise RAG integration, data warehouse migrations, and FastAPI/React pipeline engineering. You can connect via the contact form or LinkedIn."
    },
    {
      q: "How can I contact him directly?",
      a: "You can send an encrypted message directly through the secure contact form on this website or reach out via his verified LinkedIn profile."
    }
  ];

  return (
    <div className="w-full">
      <SEO 
        title="Adarsh Singh | AI & Data Engineering Portfolio"
        description="Explore the AI & Data Engineering portfolio of Adarsh Singh. Featuring production-ready RAG systems, LLM fine-tuning, and scalable data streaming architectures."
        keywords="Adarsh Singh, AI Engineer, Data Engineer, Generative AI, RAG, LLMs, Big Data, FastAPI, React"
        schema={homeSchema}
      />
      {/* Spotlight Hero V2 */}
      <Hero config={config} isDark={isDark} />

      {/* Premium Teaser Navigation Section */}
      <section className={`py-16 md:py-24 border-t relative overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-[#121212] border-white/5' : 'bg-[#FDFBF7] border-black/5'
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

      {/* FAQ Accordion Section for SEO & LLM Scraping */}
      <section className={`py-16 md:py-24 border-t relative overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-[#121212] border-white/5' : 'bg-[#FDFBF7] border-black/5'
      }`}>
        <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10 w-full text-left">
          <div className="mb-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#007AFF] block mb-2">
              Common Inquiries
            </span>
            <h2 className="text-3xl md:text-4xl font-sans font-semibold tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div 
                  key={idx}
                  className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                    isDark 
                      ? 'border-white/5 bg-neutral-900/20' 
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full py-5 px-6 flex items-center justify-between text-left font-semibold text-sm md:text-base cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
                  >
                    <span>{faq.q}</span>
                    <span className={`text-[#007AFF] transform transition-transform duration-300 font-mono ${
                      isOpen ? 'rotate-45' : ''
                    }`}>
                      +
                    </span>
                  </button>
                  <div 
                    id={`faq-answer-${idx}`}
                    className={`transition-all duration-500 ease-in-out ${
                      isOpen ? 'max-h-40 opacity-100 border-t border-white/5' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    <p className={`p-6 text-xs md:text-sm font-light leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-650'
                    }`}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
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
