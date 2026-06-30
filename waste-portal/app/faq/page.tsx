'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Info,
  Recycle,
  AlertTriangle,
  Cpu,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import faqsData from '@/data/faqs.json';

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const categoryMeta: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  general: { label: 'General', icon: Info, color: '#00C47D' },
  recycling: { label: 'Recycling', icon: Recycle, color: '#006FEF' },
  hazardous: { label: 'Hazardous Waste', icon: AlertTriangle, color: '#EF4444' },
  ewaste: { label: 'E-Waste', icon: Cpu, color: '#8B5CF6' },
};

const categoryTabs = ['all', 'general', 'recycling', 'hazardous', 'ewaste'];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  const filtered: FAQ[] = useMemo(() => {
    let items = faqsData as FAQ[];
    if (activeCategory !== 'all') {
      items = items.filter((f) => f.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q)
      );
    }
    return items;
  }, [activeCategory, searchQuery]);

  const toggle = (id: number) => setOpenId((prev) => (prev === id ? null : id));

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary, #0A0F1C)' }}>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-28 text-center">
        <div className="orb orb-green" style={{ width: 600, height: 600, top: -200, left: -250, opacity: 0.25 }} />
        <div className="orb orb-blue" style={{ width: 500, height: 500, top: -150, right: -200, opacity: 0.2 }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 container-xl"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="label-tag">
              <HelpCircle size={13} className="inline mr-1" />
              Help Center
            </span>
          </div>
          <h1 className="heading-hero gradient-text mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-body-lg max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
            Find answers to the most common questions about waste management, recycling, hazardous materials, and e-waste.
          </p>

          {/* ── Search Bar ── */}
          <div className="relative max-w-xl mx-auto">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-secondary)' }}
            />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-crystal w-full pl-12 pr-5 py-4 rounded-2xl text-sm"
            />
          </div>
        </motion.div>
      </section>

      {/* ── Category Tabs ── */}
      <section className="container-xl pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          {categoryTabs.map((cat) => {
            const meta = categoryMeta[cat];
            const isActive = activeCategory === cat;
            const Icon = meta?.icon ?? HelpCircle;
            return (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  isActive ? '' : 'glass-card hover:border-green-400/40'
                }`}
                style={
                  isActive
                    ? { background: 'var(--gradient-brand)', color: '#fff' }
                    : { color: 'var(--text-secondary)' }
                }
              >
                {cat !== 'all' && <Icon size={14} />}
                {cat === 'all' ? 'All Questions' : meta?.label ?? cat}
              </motion.button>
            );
          })}
        </motion.div>
      </section>

      {/* ── Stats bar ── */}
      <section className="container-xl pb-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          Showing <span className="font-bold" style={{ color: 'var(--green-primary)' }}>{filtered.length}</span>{' '}
          {filtered.length === 1 ? 'question' : 'questions'}
          {searchQuery && ` matching "${searchQuery}"`}
        </motion.div>
      </section>

      {/* ── Accordion ── */}
      <section className="container-xl pb-16 max-w-3xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + searchQuery}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {filtered.map((faq) => {
              const meta = categoryMeta[faq.category];
              const Icon = meta?.icon ?? HelpCircle;
              const isOpen = openId === faq.id;

              return (
                <motion.div
                  key={faq.id}
                  variants={itemVariants}
                  className="glass-card overflow-hidden rounded-2xl"
                  style={{ border: isOpen ? `1px solid ${meta?.color ?? 'var(--glass-border)'}44` : undefined }}
                >
                  {/* Header */}
                  <button
                    onClick={() => toggle(faq.id)}
                    className="accordion-header w-full flex items-center gap-4 p-5 text-left transition-colors hover:bg-white/5"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{ background: (meta?.color ?? '#00C47D') + '22', border: `1px solid ${meta?.color ?? '#00C47D'}33` }}
                    >
                      <Icon size={16} style={{ color: meta?.color ?? '#00C47D' }} />
                    </div>
                    <span className="flex-1 font-semibold text-sm md:text-base" style={{ color: 'var(--text-primary)' }}>
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown size={18} style={{ color: 'var(--text-secondary)' }} />
                    </motion.div>
                  </button>

                  {/* Body */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div
                          className="px-5 pb-5 pt-0 text-sm leading-relaxed pl-[3.75rem]"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
            style={{ color: 'var(--text-secondary)' }}
          >
            <HelpCircle size={52} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold mb-2">No questions found</p>
            <p className="text-sm">Try adjusting your search or selecting a different category.</p>
          </motion.div>
        )}
      </section>

      {/* ── CTA ── */}
      <section className="container-xl pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="crystal-card rounded-3xl p-10 text-center max-w-2xl mx-auto relative overflow-hidden"
        >
          <div className="orb orb-green" style={{ width: 300, height: 300, top: -100, left: -100, opacity: 0.2 }} />
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10" style={{ background: 'var(--gradient-brand)' }}>
            <MessageSquare size={28} className="text-white" />
          </div>
          <h2 className="heading-lg text-white mb-3 relative z-10">Still have questions?</h2>
          <p className="text-body-lg mb-8 relative z-10" style={{ color: 'var(--text-secondary)' }}>
            Our waste management experts are ready to help. Reach out and we'll get back to you within 24 hours.
          </p>
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="btn-crystal-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white relative z-10"
            style={{ background: 'var(--gradient-brand)' }}
          >
            Contact Our Team
            <ArrowRight size={16} />
          </motion.a>
        </motion.div>
      </section>
    </main>
  );
}
