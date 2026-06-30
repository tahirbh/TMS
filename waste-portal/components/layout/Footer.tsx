'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Recycle,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Send,
  Heart,
  ExternalLink,
} from 'lucide-react';
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
} from 'react-icons/fa';


const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: "5 R's", href: '/five-rs' },
  { label: 'Waste Categories', href: '/waste-categories' },
  { label: 'Recycling Process', href: '/recycling-process' },
  { label: 'Industrial Waste', href: '/industrial-waste' },
  { label: 'Facilities', href: '/facilities' },
  { label: 'SDGs', href: '/sdgs' },
];

const resourceLinks = [
  { label: 'Knowledge Center', href: '/knowledge-center' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Resources', href: '/resources' },
  { label: 'News & Updates', href: '/news' },
];

const socialLinks = [
  { icon: <FaFacebook size={17} />, href: '#', label: 'Facebook', color: '#1877F2' },
  { icon: <FaTwitter size={17} />, href: '#', label: 'Twitter / X', color: '#1DA1F2' },
  { icon: <FaLinkedin size={17} />, href: '#', label: 'LinkedIn', color: '#0A66C2' },
  { icon: <FaInstagram size={17} />, href: '#', label: 'Instagram', color: '#E1306C' },
  { icon: <FaYoutube size={17} />, href: '#', label: 'YouTube', color: '#FF0000' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const colVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--glass-border)',
      }}
    >
      {/* Gradient top border */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'var(--gradient-brand)',
          zIndex: 1,
        }}
      />

      {/* Decorative orbs */}
      <div className="orb orb-green" style={{ width: 300, height: 300, top: -80, left: -100, opacity: 0.08, position: 'absolute', zIndex: 0 }} />
      <div className="orb orb-blue" style={{ width: 250, height: 250, bottom: -80, right: -60, opacity: 0.07, position: 'absolute', zIndex: 0 }} />

      {/* ── Main content ── */}
      <motion.div
        className="container-xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        style={{
          position: 'relative',
          zIndex: 1,
          paddingTop: '4rem',
          paddingBottom: '2.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2.5rem',
        }}
      >

        {/* ── Column 1: Brand ── */}
        <motion.div variants={colVariants} style={{ gridColumn: 'span 1' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', marginBottom: '1.25rem' }}>
            <img src="/eh-logo.png" alt="EH Environmental Horizons Co." style={{ height: '42px', objectFit: 'contain' }} />
          </Link>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>
            <em style={{ color: 'var(--green-primary)', fontStyle: 'normal', fontWeight: 700 }}>
              Re-Think Before You Acquire
            </em>
            <br />
            Building a sustainable future through smart waste management education, innovative recycling, and environmental stewardship.
          </p>

          {/* Social links */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {socialLinks.map((s) => (
              <motion.a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.92 }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '0.5rem',
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--glass-border)',
                  backdropFilter: 'var(--glass-blur)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color = s.color;
                  el.style.borderColor = s.color + '55';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color = 'var(--text-secondary)';
                  el.style.borderColor = 'var(--glass-border)';
                }}
              >
                {s.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* ── Column 2: Quick Links ── */}
        <motion.div variants={colVariants}>
          <h3
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--green-primary)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span style={{ width: 20, height: 2, background: 'var(--gradient-brand)', borderRadius: 2, display: 'inline-block' }} />
            Quick Links
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    padding: '0.2rem 0',
                    transition: 'color 0.2s, gap 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = 'var(--green-primary)';
                    el.style.gap = '0.65rem';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = 'var(--text-secondary)';
                    el.style.gap = '0.4rem';
                  }}
                >
                  <ArrowRight size={12} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* ── Column 3: Resources ── */}
        <motion.div variants={colVariants}>
          <h3
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--blue-primary)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span style={{ width: 20, height: 2, background: 'linear-gradient(90deg, var(--blue-primary), #00C47D)', borderRadius: 2, display: 'inline-block' }} />
            Resources
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {resourceLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    padding: '0.2rem 0',
                    transition: 'color 0.2s, gap 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = 'var(--blue-primary)';
                    el.style.gap = '0.65rem';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = 'var(--text-secondary)';
                    el.style.gap = '0.4rem';
                  }}
                >
                  <ArrowRight size={12} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* ── Column 4: Newsletter + Contact ── */}
        <motion.div variants={colVariants}>
          <h3
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--green-primary)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span style={{ width: 20, height: 2, background: 'var(--gradient-brand)', borderRadius: 2, display: 'inline-block' }} />
            Newsletter
          </h3>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
            Stay updated with the latest sustainability news, tips, and resources.
          </p>

          {subscribed ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card"
              style={{ padding: '0.85rem', borderRadius: '0.75rem', textAlign: 'center' }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🎉</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--green-primary)', fontWeight: 600 }}>
                You&apos;re subscribed! Thank you.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="input-crystal"
                style={{ fontSize: '0.82rem', padding: '0.6rem 0.9rem' }}
              />
              <motion.button
                type="submit"
                className="btn-crystal-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  fontSize: '0.82rem',
                  padding: '0.6rem',
                  cursor: 'pointer',
                }}
              >
                <Send size={14} />
                Subscribe
              </motion.button>
            </form>
          )}

          {/* Contact info */}
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {[
              { icon: <Phone size={13} />, text: '+1 (555) 123-4567' },
              { icon: <Mail size={13} />, text: 'info@wmportal.com' },
              { icon: <MapPin size={13} />, text: '123 Green St, Eco City, EC 10001' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--green-primary)', marginTop: '0.05rem', flexShrink: 0 }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ── Bottom bar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        style={{
          position: 'relative',
          zIndex: 1,
          borderTop: '1px solid var(--glass-border)',
          padding: '1.1rem 0',
        }}
      >
        <div
          className="container-xl"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', margin: 0 }}>
            © {new Date().getFullYear()} WM Portal. Made with{' '}
            <Heart size={12} style={{ color: '#e74c3c', fill: '#e74c3c' }} />
            {' '}for a sustainable planet.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Sitemap', href: '/sitemap' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green-primary)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'; }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
