'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  Recycle,
  Home,
  Info,
  Layers,
  Trash2,
  RotateCcw,
  Factory,
  Building2,
  Globe,
  BookOpen,
  Image,
  FileText,
  Newspaper,
  HelpCircle,
  Mail,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
}

const primaryLinks: NavLink[] = [
  { label: 'Home', href: '/', icon: <Home size={16} /> },
  { label: 'About', href: '/about', icon: <Info size={16} /> },
];

const megaMenuLinks: NavLink[] = [
  {
    label: "5 R's",
    href: '/five-rs',
    icon: <Recycle size={16} />,
    description: 'Refuse, Reduce, Reuse, Repurpose, Recycle',
  },
  {
    label: 'Waste Categories',
    href: '/waste-categories',
    icon: <Layers size={16} />,
    description: 'Organic, inorganic, hazardous & more',
  },
  {
    label: 'Recycling Process',
    href: '/recycling-process',
    icon: <RotateCcw size={16} />,
    description: 'Step-by-step recycling lifecycle',
  },
  {
    label: 'Industrial Waste',
    href: '/industrial-waste',
    icon: <Factory size={16} />,
    description: 'Industrial practices & compliance',
  },
  {
    label: 'Facilities',
    href: '/facilities',
    icon: <Building2 size={16} />,
    description: 'Sustainable waste facilities',
  },
  {
    label: 'SDGs',
    href: '/sdgs',
    icon: <Globe size={16} />,
    description: 'UN Sustainable Development Goals',
  },
  {
    label: 'Knowledge Center',
    href: '/knowledge-center',
    icon: <BookOpen size={16} />,
    description: 'In-depth articles & research',
  },
  {
    label: 'Gallery',
    href: '/gallery',
    icon: <Image size={16} />,
    description: 'Photo & video showcase',
  },
  {
    label: 'Resources',
    href: '/resources',
    icon: <FileText size={16} />,
    description: 'Downloadable guides & reports',
  },
  {
    label: 'News',
    href: '/news',
    icon: <Newspaper size={16} />,
    description: 'Latest sustainability news',
  },
  {
    label: 'FAQ',
    href: '/faq',
    icon: <HelpCircle size={16} />,
    description: 'Common questions answered',
  },
  {
    label: 'Contact',
    href: '/contact',
    icon: <Mail size={16} />,
    description: 'Get in touch with us',
  },
];

const mobileAllLinks = [...primaryLinks, ...megaMenuLinks];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const megaRef = useRef<HTMLDivElement>(null);
  const megaTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mega menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        megaRef.current &&
        !megaRef.current.contains(e.target as Node) &&
        megaTriggerRef.current &&
        !megaTriggerRef.current.contains(e.target as Node)
      ) {
        setMegaOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* ─── Navbar Shell ─── */}
      <header
        className={`navbar${scrolled ? ' navbar-scrolled' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
          padding: scrolled ? '0.5rem 0' : '0.9rem 0',
        }}
      >
        <div className="container-xl" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

          {/* ── Logo ── */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', flexShrink: 0 }}>
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(0,196,125,0.4)',
              }}
            >
              <img src="/crystal-recycle-logo.png" alt="Recycle Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </motion.div>
            <div style={{ lineHeight: 1.1 }}>
              <span
                className="gradient-text"
                style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'block' }}
              >
                WM Portal
              </span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Excellence
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, justifyContent: 'center' }} className="desktop-nav">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: isActive(link.href) ? 'var(--green-primary)' : 'var(--text-primary)',
                  background: isActive(link.href) ? 'rgba(0,196,125,0.1)' : 'transparent',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(link.href)) {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-glass)';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(link.href)) {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)';
                  }
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Pages Mega Menu Trigger */}
            <div style={{ position: 'relative' }}>
              <motion.button
                ref={megaTriggerRef}
                onClick={() => setMegaOpen((v) => !v)}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  color: megaOpen ? 'var(--green-primary)' : 'var(--text-primary)',
                  background: megaOpen ? 'rgba(0,196,125,0.1)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                Pages
                <motion.span animate={{ rotate: megaOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <ChevronDown size={14} />
                </motion.span>
              </motion.button>

              {/* Mega Menu Dropdown */}
              <AnimatePresence>
                {megaOpen && (
                  <motion.div
                    ref={megaRef}
                    className="mega-menu glass-card"
                    initial={{ opacity: 0, y: -12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.97 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 0.75rem)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '680px',
                      padding: '1.25rem',
                      borderRadius: '1rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem',
                      zIndex: 200,
                    }}
                  >
                    <div
                      style={{
                        gridColumn: '1 / -1',
                        paddingBottom: '0.75rem',
                        marginBottom: '0.25rem',
                        borderBottom: '1px solid var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span className="gradient-text" style={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        All Pages
                      </span>
                    </div>

                    {megaMenuLinks.map((link, i) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Link
                          href={link.href}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.6rem',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '0.6rem',
                            textDecoration: 'none',
                            background: isActive(link.href) ? 'rgba(0,196,125,0.1)' : 'transparent',
                            border: isActive(link.href) ? '1px solid rgba(0,196,125,0.25)' : '1px solid transparent',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLAnchorElement;
                            el.style.background = 'var(--bg-glass)';
                            el.style.borderColor = 'rgba(0,196,125,0.2)';
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLAnchorElement;
                            if (!isActive(link.href)) {
                              el.style.background = 'transparent';
                              el.style.borderColor = 'transparent';
                            }
                          }}
                        >
                          <span
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: '0.4rem',
                              background: isActive(link.href) ? 'var(--gradient-brand)' : 'rgba(0,196,125,0.12)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              color: isActive(link.href) ? '#fff' : 'var(--green-primary)',
                              marginTop: '0.1rem',
                            }}
                          >
                            {link.icon}
                          </span>
                          <div>
                            <div
                              style={{
                                fontSize: '0.825rem',
                                fontWeight: 700,
                                color: isActive(link.href) ? 'var(--green-primary)' : 'var(--text-primary)',
                                lineHeight: 1.3,
                              }}
                            >
                              {link.label}
                            </div>
                            {link.description && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '0.1rem' }}>
                                {link.description}
                              </div>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* ── Right Controls ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
            {/* Dark mode toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: '1px solid var(--glass-border)',
                background: 'var(--bg-glass)',
                backdropFilter: 'var(--glass-blur)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === 'dark' ? (
                  <motion.span
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex' }}
                  >
                    <Sun size={17} color="#FDB813" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex' }}
                  >
                    <Moon size={17} color="var(--blue-primary)" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* CTA button */}
            <Link href="/contact" className="btn-crystal-primary" style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', textDecoration: 'none', flexShrink: 0 }}
              aria-label="Get Started"
            >
              Get Started
            </Link>

            {/* Hamburger */}
            <motion.button
              className="hamburger-btn"
              onClick={() => setMobileOpen((v) => !v)}
              whileTap={{ scale: 0.93 }}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              style={{
                width: 38,
                height: 38,
                borderRadius: '0.5rem',
                border: '1px solid var(--glass-border)',
                background: 'var(--bg-glass)',
                backdropFilter: 'var(--glass-blur)',
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                flexShrink: 0,
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }} style={{ display: 'flex' }}>
                    <X size={18} />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }} style={{ display: 'flex' }}>
                    <Menu size={18} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </header>

      {/* ─── Mobile Menu ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 998,
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)',
              }}
            />

            {/* Drawer */}
            <motion.div
              key="mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="glass-card"
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: 'min(320px, 90vw)',
                zIndex: 999,
                padding: '1.5rem 1.25rem',
                overflowY: 'auto',
                borderRadius: '1.25rem 0 0 1.25rem',
              }}
            >
              {/* Drawer header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.1rem' }}>Navigation</span>
                <motion.button
                  onClick={() => setMobileOpen(false)}
                  whileTap={{ scale: 0.9 }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex' }}
                  aria-label="Close menu"
                >
                  <X size={22} />
                </motion.button>
              </div>

              {/* Links list */}
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {mobileAllLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.7rem 0.9rem',
                        borderRadius: '0.6rem',
                        textDecoration: 'none',
                        color: isActive(link.href) ? 'var(--green-primary)' : 'var(--text-primary)',
                        background: isActive(link.href) ? 'rgba(0,196,125,0.1)' : 'transparent',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ color: isActive(link.href) ? 'var(--green-primary)' : 'var(--text-secondary)' }}>
                        {link.icon}
                      </span>
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Mobile CTA */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                style={{ marginTop: '1.5rem' }}
              >
                <Link
                  href="/contact"
                  className="btn-crystal-primary"
                  style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '0.75rem' }}
                >
                  Get Started
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
