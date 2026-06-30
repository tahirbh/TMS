'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ZoomIn,
  Factory,
  Settings,
  Users,
  BookOpen,
  ArrowLeftRight,
  LayoutGrid,
  Camera,
} from 'lucide-react';
import galleryData from '@/data/gallery.json';

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  description: string;
  bgColor: string;
}

const categories = [
  { key: 'all', label: 'All', icon: LayoutGrid },
  { key: 'industrial', label: 'Industrial', icon: Factory },
  { key: 'equipment', label: 'Equipment', icon: Settings },
  { key: 'events', label: 'Events', icon: Users },
  { key: 'awareness', label: 'Awareness', icon: BookOpen },
  { key: 'before-after', label: 'Before / After', icon: ArrowLeftRight },
];

const categoryIcons: Record<string, React.ElementType> = {
  industrial: Factory,
  equipment: Settings,
  events: Users,
  awareness: BookOpen,
  'before-after': ArrowLeftRight,
};

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightbox]);

  const filtered =
    activeCategory === 'all'
      ? galleryData
      : galleryData.filter((item) => item.category === activeCategory);

  if (!mounted) return null;

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary, #0A0F1C)' }}>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-28 flex flex-col items-center justify-center text-center">
        {/* Orbs */}
        <div className="orb orb-green" style={{ width: 600, height: 600, top: -200, left: -200, opacity: 0.3 }} />
        <div className="orb orb-blue" style={{ width: 500, height: 500, top: -150, right: -150, opacity: 0.25 }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 container-xl"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="label-tag">
              <Camera size={14} className="inline mr-1" />
              Visual Gallery
            </span>
          </div>
          <h1 className="heading-hero gradient-text mb-6">
            Our Work in Pictures
          </h1>
          <p className="text-body-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Explore facilities, equipment, community events, and remarkable environmental
            transformations through our curated photo gallery.
          </p>
        </motion.div>
      </section>

      {/* ── Category Filters ── */}
      <section className="container-xl pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <motion.button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'btn-crystal-primary text-white shadow-lg'
                    : 'glass-card hover:border-green-400/40'
                }`}
                style={
                  isActive
                    ? { background: 'var(--gradient-brand)', color: '#fff' }
                    : { color: 'var(--text-secondary)' }
                }
              >
                <Icon size={15} />
                {cat.label}
              </motion.button>
            );
          })}
        </motion.div>
      </section>

      {/* ── Masonry Grid ── */}
      <section className="container-xl pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5"
          >
            {filtered.map((item, idx) => {
              const Icon = categoryIcons[item.category] ?? Camera;
              // vary card heights for masonry effect
              const heights = [220, 280, 240, 320, 260, 300];
              const h = heights[item.id % heights.length];

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="break-inside-avoid mb-5 cursor-pointer group relative overflow-hidden rounded-2xl"
                  style={{ height: h }}
                  onClick={() => setLightbox(item)}
                  whileHover={{ y: -4 }}
                >
                  {/* Colored placeholder */}
                  <div
                    className="w-full h-full flex flex-col items-center justify-center relative"
                    style={{
                      background: `linear-gradient(135deg, ${item.bgColor}cc 0%, ${item.bgColor}55 100%)`,
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {/* Grid pattern overlay */}
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '30px 30px',
                      }}
                    />

                    <Icon size={48} className="text-white/60 mb-3 relative z-10" />
                    <span className="text-white/40 text-xs uppercase tracking-widest font-semibold relative z-10">
                      {item.category}
                    </span>

                    {/* Hover overlay */}
                    <motion.div
                      className="absolute inset-0 flex flex-col items-center justify-end p-4"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }}
                    >
                      <div className="w-full">
                        <span
                          className="badge badge-green text-xs mb-2 inline-block"
                          style={{ background: item.bgColor + '33', color: item.bgColor, border: `1px solid ${item.bgColor}55` }}
                        >
                          {item.category}
                        </span>
                        <h3 className="text-white font-bold text-sm leading-tight mb-1">{item.title}</h3>
                        <p className="text-white/70 text-xs">{item.description}</p>
                      </div>
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                        <ZoomIn size={14} className="text-white" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Category badge (always visible) */}
                  <div className="absolute top-3 left-3">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(8px)',
                        color: item.bgColor,
                        border: `1px solid ${item.bgColor}55`,
                      }}
                    >
                      {item.category}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>
            <Camera size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">No items found in this category.</p>
          </div>
        )}
      </section>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(0,0,0,0.88)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 20 }}
              className="crystal-card relative overflow-hidden max-w-2xl w-full"
              style={{ borderRadius: '1.5rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image area */}
              <div
                className="w-full flex flex-col items-center justify-center relative"
                style={{
                  height: 320,
                  background: `linear-gradient(135deg, ${lightbox.bgColor}cc 0%, ${lightbox.bgColor}44 100%)`,
                }}
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                  }}
                />
                {(() => {
                  const Icon = categoryIcons[lightbox.category] ?? Camera;
                  return <Icon size={80} className="text-white/50 relative z-10" />;
                })()}
              </div>

              {/* Info */}
              <div className="p-6">
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full mb-3 inline-block"
                  style={{ background: lightbox.bgColor + '22', color: lightbox.bgColor, border: `1px solid ${lightbox.bgColor}44` }}
                >
                  {lightbox.category}
                </span>
                <h2 className="heading-md text-white mb-2">{lightbox.title}</h2>
                <p className="text-body-lg" style={{ color: 'var(--text-secondary)' }}>
                  {lightbox.description}
                </p>
              </div>

              {/* Close */}
              <motion.button
                onClick={() => setLightbox(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}
                whileHover={{ scale: 1.1, background: 'rgba(239,68,68,0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={18} className="text-white" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
