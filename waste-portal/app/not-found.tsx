'use client';

import { motion } from 'framer-motion';
import { RefreshCw, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg-base, #f0faf5)' }}
    >
      {/* Background orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'var(--green-primary, #00C47D)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'var(--blue-primary, #006FEF)' }}
      />

      {/* Particle field */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full opacity-30"
          style={{
            background: i % 2 === 0 ? 'var(--green-primary, #00C47D)' : 'var(--blue-primary, #006FEF)',
            left: `${10 + (i * 7.5) % 80}%`,
            top: `${15 + (i * 11) % 70}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 2.5 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Giant 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
          className="mb-4"
        >
          <span
            className="font-black select-none"
            style={{
              fontSize: 'clamp(6rem, 20vw, 12rem)',
              lineHeight: 1,
              background: 'linear-gradient(135deg, var(--green-primary, #00C47D) 0%, var(--blue-primary, #006FEF) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              display: 'inline-block',
            }}
          >
            404
          </span>
        </motion.div>

        {/* Animated Recycle Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6, type: 'spring' }}
          className="flex justify-center mb-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(0,196,125,0.15)',
              border: '2px solid rgba(0,196,125,0.4)',
              boxShadow: '0 0 40px rgba(0,196,125,0.3)',
            }}
          >
            <RefreshCw size={40} color="var(--green-primary, #00C47D)" />
          </motion.div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-4"
        >
          <h1
            className="font-bold mb-2"
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              color: 'var(--text-primary, #1a2e1a)',
            }}
          >
            Oops! This page got recycled.
          </h1>
          <p
            className="text-lg max-w-md mx-auto"
            style={{ color: 'var(--text-secondary, #6b7280)' }}
          >
            The page you&apos;re looking for has been composted back into the
            earth. Let&apos;s get you back to something useful!
          </p>
        </motion.div>

        {/* Glass card with action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="glass-card rounded-3xl p-8 mb-8 inline-block"
          style={{ maxWidth: 480, width: '100%' }}
        >
          <p
            className="text-sm mb-6 font-medium"
            style={{ color: 'var(--text-secondary, #6b7280)' }}
          >
            Here are some eco-friendly options:
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white transition-all"
                style={{
                  background:
                    'linear-gradient(135deg, var(--green-primary, #00C47D), var(--blue-primary, #006FEF))',
                  boxShadow: '0 4px 20px rgba(0,196,125,0.4)',
                }}
              >
                <Home size={18} />
                Back to Home
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all"
                style={{
                  background: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(0,196,125,0.4)',
                  color: 'var(--green-primary, #00C47D)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <ArrowLeft size={18} />
                Go Back
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Fun fact */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-xs"
          style={{ color: 'var(--text-secondary, #9ca3af)' }}
        >
          🌿 Did you know? The average person generates about 4.4 lbs of waste per day.
        </motion.p>
      </div>
    </div>
  );
}
