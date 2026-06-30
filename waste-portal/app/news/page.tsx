'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  ScrollText,
  Lightbulb,
  CalendarDays,
  Clock,
  ChevronRight,
  Newspaper,
  TrendingUp,
} from 'lucide-react';
import newsData from '@/data/news.json';

interface NewsItem {
  id: number;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  content: string;
  readTime: number;
  imageColor: string;
}

const categoryMeta: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  technology: { label: 'Technology', icon: Cpu, color: '#00C47D' },
  policy: { label: 'Policy', icon: ScrollText, color: '#006FEF' },
  innovation: { label: 'Innovation', icon: Lightbulb, color: '#8B5CF6' },
  events: { label: 'Events', icon: CalendarDays, color: '#F59E0B' },
};

const allCategories = ['all', 'technology', 'policy', 'innovation', 'events'];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function CategoryBadge({ category }: { category: string }) {
  const meta = categoryMeta[category];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
      style={{ background: meta.color + '22', color: meta.color, border: `1px solid ${meta.color}44` }}
    >
      <Icon size={11} />
      {meta.label}
    </span>
  );
}

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered: NewsItem[] =
    activeCategory === 'all'
      ? newsData
      : newsData.filter((n) => n.category === activeCategory);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary, #0A0F1C)' }}>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-28 text-center">
        <div className="orb orb-green" style={{ width: 550, height: 550, top: -180, left: -180, opacity: 0.28 }} />
        <div className="orb orb-blue" style={{ width: 450, height: 450, top: -120, right: -120, opacity: 0.22 }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 container-xl"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="label-tag">
              <Newspaper size={13} className="inline mr-1" />
              Latest Updates
            </span>
          </div>
          <h1 className="heading-hero gradient-text mb-6">News & Insights</h1>
          <p className="text-body-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Stay informed with the latest developments in waste management technology, policy, and innovation.
          </p>
        </motion.div>
      </section>

      {/* ── Category Filters ── */}
      <section className="container-xl pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          {allCategories.map((cat) => {
            const meta = categoryMeta[cat];
            const isActive = activeCategory === cat;
            const Icon = meta?.icon ?? TrendingUp;
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
                {cat === 'all' ? 'All' : meta?.label ?? cat}
              </motion.button>
            );
          })}
        </motion.div>
      </section>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* ── Featured Article ── */}
          {featured && (
            <section className="container-xl pb-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="crystal-card overflow-hidden rounded-3xl grid md:grid-cols-2 gap-0"
              >
                {/* Image placeholder */}
                <div
                  className="relative min-h-[300px] md:min-h-[420px] flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${featured.imageColor}cc 0%, ${featured.imageColor}44 100%)`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)`,
                    }}
                  />
                  {(() => {
                    const meta = categoryMeta[featured.category];
                    const Icon = meta?.icon ?? Newspaper;
                    return <Icon size={80} className="text-white/40 relative z-10" />;
                  })()}
                  <div className="absolute top-5 left-5">
                    <span className="label-tag">Featured</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <CategoryBadge category={featured.category} />
                  <h2 className="heading-lg text-white mt-4 mb-4 leading-tight">{featured.title}</h2>
                  <p className="text-body-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      {formatDate(featured.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {featured.readTime} min read
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-crystal-primary inline-flex items-center gap-2 self-start px-6 py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'var(--gradient-brand)' }}
                  >
                    Read Full Article
                    <ChevronRight size={16} />
                  </motion.button>
                </div>
              </motion.div>
            </section>
          )}

          {/* ── News Grid ── */}
          {rest.length > 0 && (
            <section className="container-xl pb-24">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {rest.map((item) => {
                  const meta = categoryMeta[item.category];
                  const Icon = meta?.icon ?? Newspaper;
                  return (
                    <motion.article
                      key={item.id}
                      variants={itemVariants}
                      className="crystal-card overflow-hidden rounded-2xl flex flex-col group cursor-pointer"
                      whileHover={{ y: -6, transition: { duration: 0.25 } }}
                    >
                      {/* Card image */}
                      <div
                        className="relative flex items-center justify-center"
                        style={{
                          height: 180,
                          background: `linear-gradient(135deg, ${item.imageColor}cc 0%, ${item.imageColor}44 100%)`,
                        }}
                      >
                        <div
                          className="absolute inset-0 opacity-10"
                          style={{
                            backgroundImage: `radial-gradient(circle at 60% 40%, rgba(255,255,255,0.25) 0%, transparent 60%)`,
                          }}
                        />
                        <Icon size={48} className="text-white/40 relative z-10" />
                        <div className="absolute top-3 left-3">
                          <CategoryBadge category={item.category} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                          <span className="flex items-center gap-1">
                            <CalendarDays size={12} />
                            {formatDate(item.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {item.readTime} min
                          </span>
                        </div>
                        <h3 className="text-white font-bold text-base leading-snug mb-3 group-hover:text-green-400 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm flex-1 mb-4 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                          {item.excerpt}
                        </p>
                        <motion.button
                          whileHover={{ x: 4 }}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold self-start"
                          style={{ color: 'var(--green-primary)' }}
                        >
                          Read More
                          <ChevronRight size={14} />
                        </motion.button>
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            </section>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-24" style={{ color: 'var(--text-secondary)' }}>
              <Newspaper size={52} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">No articles found in this category.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
