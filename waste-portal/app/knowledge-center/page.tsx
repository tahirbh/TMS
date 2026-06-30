'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  Microscope,
  CheckCircle,
  ScrollText,
  Cpu,
  Clock,
  Calendar,
  User,
  Tag,
  ChevronRight,
  Download,
  Play,
  FileText,
} from 'lucide-react';
import articlesData from '@/data/articles.json';

interface Article {
  id: number;
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: number;
  excerpt: string;
  content: string;
  tags: string[];
  imageColor: string;
}

const categoryMeta: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  research: { label: 'Research', icon: Microscope, color: '#00C47D' },
  'best-practices': { label: 'Best Practices', icon: CheckCircle, color: '#006FEF' },
  policy: { label: 'Policy', icon: ScrollText, color: '#8B5CF6' },
  technology: { label: 'Technology', icon: Cpu, color: '#F59E0B' },
};

const categoryTabs = ['all', 'research', 'best-practices', 'policy', 'technology'];

const pdfResources = [
  { id: 1, title: 'National Waste Management Strategy 2030', type: 'Strategy', size: '4.2 MB', color: '#00C47D' },
  { id: 2, title: 'Household Waste Segregation Guide', type: 'Guideline', size: '1.8 MB', color: '#006FEF' },
  { id: 3, title: 'E-Waste Handling SOP Manual', type: 'SOP', size: '3.1 MB', color: '#8B5CF6' },
  { id: 4, title: 'Composting Operations Handbook', type: 'Handbook', size: '5.5 MB', color: '#F59E0B' },
  { id: 5, title: 'Circular Economy Policy Toolkit', type: 'Toolkit', size: '2.9 MB', color: '#EC4899' },
  { id: 6, title: 'Zero-Waste Campus Implementation Guide', type: 'Guideline', size: '2.3 MB', color: '#06B6D4' },
];

const videoResources = [
  { id: 1, title: 'Introduction to Waste Segregation at Source', duration: '12:45', color: '#00C47D' },
  { id: 2, title: 'How a Materials Recovery Facility Works', duration: '18:30', color: '#006FEF' },
  { id: 3, title: 'Composting Step-by-Step', duration: '09:15', color: '#8B5CF6' },
  { id: 4, title: 'E-Waste: What Happens After Collection?', duration: '14:20', color: '#F59E0B' },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  const meta = categoryMeta[article.category];
  const Icon = meta?.icon ?? BookOpen;

  if (featured) {
    return (
      <motion.div
        className="crystal-card overflow-hidden rounded-3xl grid md:grid-cols-5 gap-0 cursor-pointer"
        whileHover={{ y: -4, transition: { duration: 0.25 } }}
      >
        {/* Image */}
        <div
          className="md:col-span-2 relative min-h-[260px] flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${article.imageColor}cc 0%, ${article.imageColor}44 100%)` }}
        >
          <Icon size={72} className="text-white/40 relative z-10" />
          <div className="absolute top-4 left-4">
            <span className="label-tag">Featured Article</span>
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-3 p-8 flex flex-col justify-center">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-4 self-start"
            style={{ background: (meta?.color ?? '#00C47D') + '22', color: meta?.color ?? '#00C47D', border: `1px solid ${meta?.color ?? '#00C47D'}44` }}
          >
            <Icon size={11} />
            {meta?.label ?? article.category}
          </span>
          <h2 className="heading-md text-white mb-3 leading-tight">{article.title}</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>{article.excerpt}</p>
          <div className="flex flex-wrap gap-4 text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1"><User size={12} />{article.author}</span>
            <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(article.date)}</span>
            <span className="flex items-center gap-1"><Clock size={12} />{article.readTime} min read</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {article.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Tag size={10} className="inline mr-1" />{tag}
              </span>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="btn-crystal-primary inline-flex items-center gap-2 self-start px-6 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: 'var(--gradient-brand)' }}
          >
            Read Article <ChevronRight size={15} />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="crystal-card overflow-hidden rounded-2xl flex flex-col cursor-pointer group"
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
    >
      {/* Image */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: 160, background: `linear-gradient(135deg, ${article.imageColor}cc 0%, ${article.imageColor}44 100%)` }}
      >
        <Icon size={48} className="text-white/40 relative z-10" />
        <div className="absolute top-3 left-3">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: (meta?.color ?? '#00C47D') + '22', color: meta?.color ?? '#00C47D', border: `1px solid ${meta?.color ?? '#00C47D'}44` }}
          >
            {meta?.label ?? article.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-white font-bold text-sm leading-snug mb-2 group-hover:text-green-400 transition-colors">{article.title}</h3>
        <p className="text-xs flex-1 mb-4 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{article.excerpt}</p>
        <div className="flex flex-wrap gap-3 text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
          <span className="flex items-center gap-1"><User size={11} />{article.author}</span>
          <span className="flex items-center gap-1"><Clock size={11} />{article.readTime} min</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {article.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {tag}
            </span>
          ))}
        </div>
        <motion.button whileHover={{ x: 4 }} className="inline-flex items-center gap-1 text-xs font-semibold self-start" style={{ color: 'var(--green-primary)' }}>
          Read Article <ChevronRight size={12} />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function KnowledgeCenterPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered: Article[] = useMemo(() => {
    let items = articlesData as Article[];
    if (activeCategory !== 'all') items = items.filter((a) => a.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return items;
  }, [activeCategory, searchQuery]);

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
        <div className="orb orb-green" style={{ width: 600, height: 600, top: -200, left: -200, opacity: 0.28 }} />
        <div className="orb orb-blue" style={{ width: 500, height: 500, top: -150, right: -150, opacity: 0.22 }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 container-xl"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="label-tag"><BookOpen size={13} className="inline mr-1" />Research & Insights</span>
          </div>
          <h1 className="heading-hero gradient-text mb-6">Knowledge Center</h1>
          <p className="text-body-lg max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
            In-depth research, best-practice guides, policy analyses, and technical papers on waste management excellence.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search articles, topics, tags..."
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
            const Icon = meta?.icon ?? BookOpen;
            return (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${isActive ? '' : 'glass-card hover:border-green-400/40'}`}
                style={isActive ? { background: 'var(--gradient-brand)', color: '#fff' } : { color: 'var(--text-secondary)' }}
              >
                {cat !== 'all' && <Icon size={14} />}
                {cat === 'all' ? 'All Articles' : meta?.label ?? cat}
              </motion.button>
            );
          })}
        </motion.div>
      </section>

      <AnimatePresence mode="wait">
        <motion.div key={activeCategory + searchQuery} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          {/* Featured */}
          {featured && (
            <section className="container-xl pb-12">
              <ArticleCard article={featured} featured />
            </section>
          )}

          {/* Articles Grid */}
          {rest.length > 0 && (
            <section className="container-xl pb-16">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {rest.map((article) => (
                  <motion.div key={article.id} variants={itemVariants}>
                    <ArticleCard article={article} />
                  </motion.div>
                ))}
              </motion.div>
            </section>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>
              <BookOpen size={52} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">No articles found. Try a different search or category.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── PDF Downloads ── */}
      <section className="container-xl pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
              <Download size={18} className="text-white" />
            </div>
            <h2 className="heading-lg text-white">PDF Downloads</h2>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Free downloadable resources — strategies, guidelines, SOPs, and handbooks.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pdfResources.map((res, idx) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.07 }}
              className="glass-card rounded-2xl p-5 flex items-start gap-4 cursor-pointer group"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: res.color + '22', border: `1px solid ${res.color}33` }}>
                <FileText size={22} style={{ color: res.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm leading-snug mb-1 group-hover:text-green-400 transition-colors">{res.title}</h3>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="px-2 py-0.5 rounded-full" style={{ background: res.color + '22', color: res.color }}>{res.type}</span>
                  <span>{res.size}</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--gradient-brand)' }}
                title="Download"
              >
                <Download size={15} className="text-white" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Video Resources ── */}
      <section className="container-xl pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #006FEF, #8B5CF6)' }}>
              <Play size={18} className="text-white" />
            </div>
            <h2 className="heading-lg text-white">Video Resources</h2>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Educational videos and facility walkthroughs for learning at your own pace.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {videoResources.map((vid, idx) => (
            <motion.div
              key={vid.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="crystal-card rounded-2xl overflow-hidden cursor-pointer group"
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
            >
              {/* Thumbnail placeholder */}
              <div
                className="relative flex items-center justify-center"
                style={{ height: 150, background: `linear-gradient(135deg, ${vid.color}cc 0%, ${vid.color}44 100%)` }}
              >
                <motion.div
                  className="w-14 h-14 rounded-full flex items-center justify-center relative z-10"
                  style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '2px solid rgba(255,255,255,0.3)' }}
                  whileHover={{ scale: 1.15 }}
                >
                  <Play size={22} className="text-white ml-1" />
                </motion.div>
                <div className="absolute bottom-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.8)' }}>
                  {vid.duration}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-green-400 transition-colors">{vid.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
