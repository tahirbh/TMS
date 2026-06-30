'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
  hoverLift?: boolean;
  delay?: number;
  inViewAnimation?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  hoverLift = true,
  delay = 0,
  inViewAnimation = true,
  ...rest
}: GlassCardProps) {
  return (
    <motion.div
      className={`glass-card ${className}`}
      initial={inViewAnimation ? { opacity: 0, y: 24 } : undefined}
      whileInView={inViewAnimation ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={
        hoverLift
          ? {
              y: -6,
              boxShadow:
                '0 24px 60px rgba(0,196,125,0.18), 0 8px 24px rgba(0,111,239,0.12)',
              transition: { duration: 0.25, ease: 'easeOut' },
            }
          : undefined
      }
      whileTap={hoverLift ? { scale: 0.98 } : undefined}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
