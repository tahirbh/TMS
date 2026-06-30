'use client';

import { motion } from 'framer-motion';

interface SectionTitleProps {
  title: string;
  gradientWord?: string;
  subtitle?: string;
  tag?: string;
  align?: 'left' | 'center' | 'right';
  light?: boolean;
  className?: string;
}

export default function SectionTitle({
  title,
  gradientWord,
  subtitle,
  tag,
  align = 'center',
  light = false,
  className = '',
}: SectionTitleProps) {
  const alignClass =
    align === 'left'
      ? 'items-start text-left'
      : align === 'right'
      ? 'items-end text-right'
      : 'items-center text-center';

  // Highlight gradient word within title
  const renderTitle = () => {
    if (!gradientWord) return <span>{title}</span>;
    const parts = title.split(gradientWord);
    return (
      <>
        {parts[0]}
        <span className="gradient-text">{gradientWord}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <motion.div
      className={`flex flex-col gap-4 ${alignClass} ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {tag && (
        <motion.span
          className="label-tag"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--green-primary)',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          {tag}
        </motion.span>
      )}

      <motion.h2
        className={`heading-xl ${light ? 'text-white' : ''} relative`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        {renderTitle()}
      </motion.h2>

      {/* Animated underline bar */}
      <motion.div
        className={`flex ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="relative h-1 rounded-full overflow-hidden" style={{ width: 80 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--gradient-brand)',
              borderRadius: 4,
            }}
          />
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.5)',
              borderRadius: 4,
            }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>

      {subtitle && (
        <motion.p
          className={`text-body-lg max-w-2xl ${light ? 'text-white/70' : ''}`}
          style={{ margin: align === 'center' ? '0 auto' : undefined }}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
