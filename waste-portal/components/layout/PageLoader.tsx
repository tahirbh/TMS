'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-base, #f8fafc)',
            gap: '1.5rem',
          }}
        >
          {/* Animated SVG Recycle Symbol */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg
              width="72"
              height="72"
              viewBox="0 0 72 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="loader-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00C47D" />
                  <stop offset="100%" stopColor="#006FEF" />
                </linearGradient>
              </defs>
              {/* Recycling arrows - simplified triangular arrows */}
              <path
                d="M36 6 L46 22 H40 L40 32 H32 L32 22 H26 Z"
                fill="url(#loader-grad)"
              />
              <path
                d="M56 42 L62 28 L52 30 L47 21 L41 30 L51 28 Z"
                fill="url(#loader-grad)"
                transform="rotate(120 36 36)"
              />
              <path
                d="M56 42 L62 28 L52 30 L47 21 L41 30 L51 28 Z"
                fill="url(#loader-grad)"
                transform="rotate(240 36 36)"
              />
              {/* Center circle */}
              <circle cx="36" cy="36" r="8" fill="url(#loader-grad)" opacity="0.9" />
              {/* Outer ring */}
              <circle cx="36" cy="36" r="32" stroke="url(#loader-grad)" strokeWidth="2.5" fill="none" strokeDasharray="6 4" />
            </svg>
          </motion.div>

          {/* Pulsing dots + gradient text */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <span
              className="gradient-text"
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                fontFamily: 'var(--font-outfit, Outfit, sans-serif)',
              }}
            >
              Loading...
            </span>

            {/* Animated bar */}
            <motion.div
              style={{
                width: '120px',
                height: '3px',
                borderRadius: '99px',
                background: 'linear-gradient(90deg, #00C47D, #006FEF)',
                originX: 0,
              }}
              animate={{ scaleX: [0, 1, 0], originX: [0, 0, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
