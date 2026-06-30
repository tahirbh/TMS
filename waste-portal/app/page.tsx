'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import {
  Globe,
  Thermometer,
  Zap,
  DollarSign,
  Heart,
  Leaf,
  ChevronDown,
  ArrowRight,
  Recycle,
  Truck,
  Filter,
  Package,
  Flame,
  RotateCcw,
  Trash2,
  Star,
  Mail,
  CheckCircle,
  Users,
  Building2,
  FlaskConical,
  Activity,
  HardDrive,
  Stethoscope,
} from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import SectionTitle from '@/components/ui/SectionTitle';
import GlassCard from '@/components/ui/GlassCard';
import CrystalButton from '@/components/ui/CrystalButton';

/* ═══════════════════════ PARTICLE FIELD ═══════════════════════ */
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 5.2 + 3) % 100}%`,
  size: 4 + (i % 6) * 2,
  duration: 8 + (i % 7) * 2,
  delay: (i * 0.6) % 10,
  color: i % 2 === 0 ? 'particle-green' : 'particle-blue',
}));

/* ═══════════════════════ TIMELINE DATA ═══════════════════════ */
const TIMELINE_STEPS = [
  { icon: <Trash2 size={18} />, label: 'Generation', desc: 'Waste is produced in households, industries and businesses.' },
  { icon: <Truck size={18} />, label: 'Collection', desc: 'Municipal services collect waste from homes & commercial sites.' },
  { icon: <Filter size={18} />, label: 'Segregation', desc: 'Sorting waste by type: organic, recyclable, hazardous.' },
  { icon: <Package size={18} />, label: 'Transport', desc: 'Transferring sorted waste to specialized processing facilities.' },
  { icon: <Activity size={18} />, label: 'Recovery', desc: 'Extracting value through material recovery and biogas production.' },
  { icon: <Recycle size={18} />, label: 'Recycling', desc: 'Converting materials into new raw inputs for manufacturing.' },
  { icon: <RotateCcw size={18} />, label: 'Reuse', desc: 'Repurposing items directly to extend their useful life.' },
  { icon: <Flame size={18} />, label: 'Disposal', desc: 'Safe, engineered final disposal for non-recoverable residuals.' },
];

/* ═══════════════════════ FACILITIES DATA ═══════════════════════ */
const FACILITIES = [
  {
    icon: <Recycle size={32} />,
    name: 'Material Recovery Facility',
    color: 'var(--green-primary)',
    desc: 'State-of-the-art MRF that sorts and processes 500+ tonnes of recyclables daily using optical sorting and AI-powered conveyors.',
  },
  {
    icon: <Leaf size={32} />,
    name: 'Composting Plant',
    color: '#56C02B',
    desc: 'Industrial composting facility converting organic waste into premium compost for agricultural use, diverting landfill-bound organics.',
  },
  {
    icon: <Flame size={32} />,
    name: 'Waste-to-Energy Plant',
    color: '#FD9D24',
    desc: 'High-temperature incineration with energy recovery, generating clean electricity for thousands of homes while reducing waste volume.',
  },
  {
    icon: <FlaskConical size={32} />,
    name: 'Leachate Treatment',
    color: '#26BDE2',
    desc: 'Advanced treatment of landfill leachate using membrane bioreactors ensuring no groundwater contamination.',
  },
  {
    icon: <Building2 size={32} />,
    name: 'Sanitary Landfill',
    color: '#3F7E44',
    desc: 'Engineered sanitary landfill with liner systems, gas collection and leachate management as a last-resort safe disposal option.',
  },
  {
    icon: <Star size={32} />,
    name: 'Hazardous Waste Facility',
    color: '#E5243B',
    desc: 'Specialized facility for treatment, storage and disposal of hazardous, toxic and chemical waste using international protocols.',
  },
  {
    icon: <Stethoscope size={32} />,
    name: 'Medical Waste Plant',
    color: '#BF8B2E',
    desc: 'Autoclave and microwave treatment facility ensuring safe, pathogen-free processing of all clinical and pharmaceutical waste.',
  },
  {
    icon: <HardDrive size={32} />,
    name: 'E-Waste Facility',
    color: '#0A97D9',
    desc: 'Certified e-waste dismantling and precious metal recovery facility, safely handling electronic equipment end-of-life.',
  },
];

/* ═══════════════════════ SDG DATA ═══════════════════════ */
const SDGS = [
  { goal: '6', icon: '💧', name: 'Clean Water & Sanitation', color: '#26BDE2' },
  { goal: '11', icon: '🏙️', name: 'Sustainable Cities', color: '#FD9D24' },
  { goal: '12', icon: '♻️', name: 'Responsible Consumption', color: '#BF8B2E' },
  { goal: '13', icon: '🌍', name: 'Climate Action', color: '#3F7E44' },
  { goal: '14', icon: '🐋', name: 'Life Below Water', color: '#0A97D9' },
  { goal: '15', icon: '🌿', name: 'Life on Land', color: '#56C02B' },
];

/* ═══════════════════════ WHY IT MATTERS DATA ═══════════════════════ */
const FEATURES = [
  {
    icon: <Globe size={28} />,
    emoji: '🌍',
    title: 'Planet',
    desc: 'Proper waste management preserves biodiversity, protects soil and natural ecosystems from pollution and degradation.',
    gradient: 'rgba(0,196,125,0.12)',
  },
  {
    icon: <Thermometer size={28} />,
    emoji: '🌡️',
    title: 'Climate',
    desc: 'Landfill methane is 28× more potent than CO₂. Diverting organic waste directly combats greenhouse gas emissions.',
    gradient: 'rgba(0,111,239,0.12)',
  },
  {
    icon: <Zap size={28} />,
    emoji: '⚡',
    title: 'Energy',
    desc: 'Waste-to-energy plants and biogas recovery unlock hidden energy, contributing to national renewable energy goals.',
    gradient: 'rgba(255,193,7,0.12)',
  },
  {
    icon: <DollarSign size={28} />,
    emoji: '💰',
    title: 'Economy',
    desc: 'A circular economy powered by recycling creates millions of green jobs and reduces raw material import costs.',
    gradient: 'rgba(76,175,80,0.12)',
  },
  {
    icon: <Heart size={28} />,
    emoji: '🏥',
    title: 'Health',
    desc: 'Open dumping causes respiratory disease, water contamination and vector-borne illness. Safe disposal protects communities.',
    gradient: 'rgba(239,68,68,0.12)',
  },
  {
    icon: <Leaf size={28} />,
    emoji: '🌱',
    title: 'Future Generations',
    desc: 'Responsible stewardship today secures clean air, clean water and functional ecosystems for those who inherit the Earth.',
    gradient: 'rgba(86,192,43,0.12)',
  },
];

/* ═══════════════════════ HOME PAGE ═══════════════════════ */
export default function HomePage() {
  const [pledgeCount, setPledgeCount] = useState(12847);
  const [hasPledged, setHasPledged] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [sdgHovered, setSdgHovered] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 120]);

  useEffect(() => {
    const stored = localStorage.getItem('wm-pledged');
    const storedCount = localStorage.getItem('wm-pledge-count');
    if (stored === 'true') setHasPledged(true);
    if (storedCount) setPledgeCount(Number(storedCount));
  }, []);

  const handlePledge = () => {
    if (hasPledged) return;
    const newCount = pledgeCount + 1;
    setPledgeCount(newCount);
    setHasPledged(true);
    setShowConfetti(true);
    localStorage.setItem('wm-pledged', 'true');
    localStorage.setItem('wm-pledge-count', String(newCount));
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 4000);
    setEmail('');
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <main className="overflow-x-hidden">

      {/* ═══════════════ SECTION 1: HERO ═══════════════ */}
      <section className="hero-section" id="hero">
        {/* Particle field */}
        <div className="particle-field">
          {PARTICLES.map((p) => (
            <div
              key={p.id}
              className={`particle ${p.color}`}
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Orbs */}
        <motion.div
          className="orb orb-green"
          style={{ width: 600, height: 600, top: '-15%', left: '-10%' }}
          animate={{ scale: [1, 1.15, 0.95, 1], x: [0, 20, -10, 0], y: [0, -20, 10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="orb orb-blue"
          style={{ width: 500, height: 500, bottom: '-10%', right: '-8%' }}
          animate={{ scale: [1, 0.9, 1.1, 1], x: [0, -15, 20, 0], y: [0, 20, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* Hero content */}
        <motion.div className="container-xl relative z-10" style={{ y: heroY }}>
          <motion.div
            className="flex flex-col items-center text-center gap-8 py-24"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Animated Crystal Recycling Logo */}
            <motion.div
              variants={itemVariants}
              className="relative"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 130,
                  height: 130,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 40px rgba(0,196,125,0.45), 0 0 80px rgba(0,111,239,0.3)',
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                }}
              >
                <img src="/crystal-recycle-logo.png" alt="Crystal Recycle Logo" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
              </motion.div>
              {/* Pulse ring */}
              <motion.div
                style={{
                  position: 'absolute',
                  inset: -8,
                  borderRadius: '50%',
                  border: '2px solid rgba(0,196,125,0.3)',
                }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
              />
            </motion.div>

            {/* Tag */}
            <motion.span variants={itemVariants} className="label-tag">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-primary)', display: 'inline-block' }} />
              Waste Management Excellence Portal
            </motion.span>

            {/* Headline */}
            <motion.h1 variants={itemVariants} className="heading-hero text-white" style={{ maxWidth: 900 }}>
              Re-Think About Your Desire{' '}
              <span className="gradient-text text-glow-green">Before You Acquire</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-body-lg"
              style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 680 }}
            >
              Explore how responsible waste management protects our planet, drives the circular economy,
              and secures a healthier future for generations to come. Learn the 5 R&apos;s — Refuse,
              Reduce, Reuse, Recycle, Recover.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center">
              <CrystalButton href="/about" variant="primary" size="lg" icon={<ArrowRight size={18} />} iconPosition="right">
                Learn More
              </CrystalButton>
              <CrystalButton href="/five-rs" variant="outline" size="lg" icon={<Recycle size={18} />} iconPosition="left">
                Explore the 5 R&apos;s
              </CrystalButton>
            </motion.div>

            {/* Stats preview strip */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-8 justify-center mt-4 pt-6"
              style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
            >
              {[
                { val: '2.24B', label: 'Tons Waste/Year' },
                { val: '33%', label: 'Mismanaged' },
                { val: '70%', label: 'Recyclable' },
                { val: '17', label: 'UN SDGs' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-black gradient-text" style={{ fontFamily: 'Outfit' }}>{s.val}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="flex flex-col items-center gap-2 pb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }}>Scroll to Explore</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown size={24} color="rgba(0,196,125,0.8)" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════ SECTION 2: STATISTICS ═══════════════ */}
      <section className="section-padding" style={{ background: 'var(--bg-primary)' }} id="statistics">
        <div className="container-xl">
          <SectionTitle
            tag="By the Numbers"
            title="The Global Waste Crisis"
            gradientWord="Waste Crisis"
            subtitle="The scale of the world's waste challenge demands urgent action. These numbers tell a story we cannot afford to ignore."
            align="center"
          />

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              {
                value: 2.24,
                suffix: 'B',
                label: 'Annual Waste Generated',
                unit: 'Metric Tons',
                icon: <Globe size={28} />,
                color: 'var(--green-primary)',
                bg: 'rgba(0,196,125,0.06)',
              },
              {
                value: 33,
                suffix: '%',
                label: 'Waste Mismanaged',
                unit: 'Globally',
                icon: <Trash2 size={28} />,
                color: '#ef4444',
                bg: 'rgba(239,68,68,0.06)',
              },
              {
                value: 70,
                suffix: '%',
                label: 'Could Be Recycled',
                unit: 'Of All Waste',
                icon: <Recycle size={28} />,
                color: 'var(--blue-primary)',
                bg: 'rgba(0,111,239,0.06)',
              },
              {
                value: 17,
                suffix: '',
                label: 'UN Sustainable',
                unit: 'Development Goals',
                icon: <Star size={28} />,
                color: '#FD9D24',
                bg: 'rgba(253,157,36,0.06)',
              },
            ].map((stat, idx) => (
              <motion.div key={stat.label} variants={itemVariants}>
                <div
                  className="crystal-card stat-card"
                  style={{ background: stat.bg, height: '100%' }}
                >
                  {/* Icon */}
                  <motion.div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 16,
                      background: `${stat.color}18`,
                      border: `1.5px solid ${stat.color}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      color: stat.color,
                    }}
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {stat.icon}
                  </motion.div>

                  {/* Animated number */}
                  <div className="stat-number" style={{ marginBottom: 8 }}>
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={2.2} />
                  </div>

                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: 0.5 }}>
                    {stat.unit}
                  </div>

                  {/* Bottom gradient line */}
                  <div style={{ height: 3, background: `linear-gradient(to right, ${stat.color}, transparent)`, borderRadius: 2, marginTop: 24 }} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ SECTION 3: WHY IT MATTERS ═══════════════ */}
      <section
        className="section-padding"
        style={{ background: 'var(--bg-secondary)' }}
        id="why"
      >
        <div className="container-xl">
          <SectionTitle
            tag="Impact Areas"
            title="Why It Matters"
            gradientWord="Matters"
            subtitle="Waste management touches every dimension of sustainable development — from climate to community health."
            align="center"
          />

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {FEATURES.map((feat, idx) => (
              <motion.div key={feat.title} variants={itemVariants}>
                <GlassCard
                  className="feature-card h-full"
                  inViewAnimation={false}
                  delay={idx * 0.08}
                  style={{ background: feat.gradient }}
                >
                  <div className="feature-icon-wrap" style={{ color: 'var(--green-primary)' }}>
                    {feat.icon}
                  </div>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{feat.emoji}</div>
                  <h3 className="heading-md" style={{ marginBottom: 12 }}>{feat.title}</h3>
                  <p className="text-body-lg" style={{ fontSize: '0.95rem' }}>{feat.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ SECTION 4: TIMELINE ═══════════════ */}
      <section
        className="section-padding"
        style={{ background: 'var(--bg-dark)' }}
        id="timeline"
      >
        <div className="container-xl">
          <SectionTitle
            tag="The Process"
            title="The Waste Journey"
            gradientWord="Waste Journey"
            subtitle="From generation to final disposal — every step matters in the lifecycle of responsible waste management."
            align="center"
            light
          />

          {/* Desktop horizontal timeline */}
          <div className="mt-16 relative hidden lg:block" ref={timelineRef}>
            {/* Connector line */}
            <div
              style={{
                position: 'absolute',
                top: 40,
                left: '5%',
                right: '5%',
                height: 3,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 2,
              }}
            />
            <motion.div
              style={{
                position: 'absolute',
                top: 40,
                left: '5%',
                height: 3,
                borderRadius: 2,
                background: 'linear-gradient(to right, var(--green-primary), var(--blue-primary))',
              }}
              initial={{ width: '0%' }}
              whileInView={{ width: '90%' }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 2, ease: 'easeOut', delay: 0.3 }}
            />

            <div className="grid grid-cols-8 gap-2 relative">
              {TIMELINE_STEPS.map((step, idx) => (
                <motion.div
                  key={step.label}
                  className="flex flex-col items-center text-center gap-4"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                >
                  {/* Number badge + Icon */}
                  <motion.div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '2px solid rgba(0,196,125,0.4)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      color: 'var(--green-primary)',
                      zIndex: 2,
                      backdropFilter: 'blur(8px)',
                    }}
                    whileHover={{
                      scale: 1.15,
                      borderColor: 'var(--green-primary)',
                      boxShadow: '0 0 24px rgba(0,196,125,0.4)',
                    }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'var(--gradient-brand)',
                        color: 'white',
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: 'Outfit',
                      }}
                    >
                      {idx + 1}
                    </span>
                    {step.icon}
                  </motion.div>

                  <div>
                    <div
                      style={{
                        fontFamily: 'Outfit',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: 'white',
                        marginBottom: 6,
                        letterSpacing: 0.3,
                      }}
                    >
                      {step.label}
                    </div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: 'rgba(255,255,255,0.45)',
                        lineHeight: 1.5,
                      }}
                    >
                      {step.desc}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile vertical timeline */}
          <div className="lg:hidden mt-10 flex flex-col gap-6">
            {TIMELINE_STEPS.map((step, idx) => (
              <motion.div
                key={step.label}
                className="flex gap-4"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'rgba(0,196,125,0.1)',
                      border: '2px solid rgba(0,196,125,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--green-primary)',
                      flexShrink: 0,
                      position: 'relative',
                    }}
                  >
                    {step.icon}
                    <span
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -4,
                        background: 'var(--gradient-brand)',
                        color: 'white',
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 9,
                        fontWeight: 700,
                      }}
                    >
                      {idx + 1}
                    </span>
                  </div>
                  {idx < TIMELINE_STEPS.length - 1 && (
                    <div className="timeline-connector" style={{ height: 40 }} />
                  )}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'white', marginBottom: 4 }}>{step.label}</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{step.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 5: FACILITIES ═══════════════ */}
      <section className="section-padding" style={{ background: 'var(--bg-primary)' }} id="facilities">
        <div className="container-xl">
          <SectionTitle
            tag="Infrastructure"
            title="World-Class Facilities"
            gradientWord="World-Class"
            subtitle="Our network of advanced treatment facilities ensures that every type of waste is handled safely and responsibly."
            align="center"
          />

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {FACILITIES.map((fac, idx) => (
              <motion.div
                key={fac.name}
                variants={itemVariants}
                style={{ height: 280 }}
              >
                <Link href="/facilities" className="flip-card block h-full" style={{ textDecoration: 'none' }}>
                  <div className="flip-card-inner">
                    {/* Front */}
                    <div
                      className="flip-card-front glass-card flex flex-col items-center justify-center gap-4 text-center p-6"
                      style={{ height: '100%' }}
                    >
                      <motion.div
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: 20,
                          background: `${fac.color}18`,
                          border: `2px solid ${fac.color}40`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: fac.color,
                        }}
                      >
                        {fac.icon}
                      </motion.div>
                      <h3
                        style={{
                          fontFamily: 'Outfit',
                          fontWeight: 700,
                          fontSize: '1rem',
                          color: 'var(--text-primary)',
                          lineHeight: 1.3,
                        }}
                      >
                        {fac.name}
                      </h3>
                      <div
                        style={{
                          width: 40,
                          height: 3,
                          background: `linear-gradient(to right, ${fac.color}, transparent)`,
                          borderRadius: 2,
                        }}
                      />
                    </div>

                    {/* Back */}
                    <div
                      className="flip-card-back flex flex-col items-center justify-center gap-4 text-center p-6"
                      style={{
                        height: '100%',
                        background: `linear-gradient(135deg, ${fac.color}22, ${fac.color}08)`,
                        border: `1px solid ${fac.color}40`,
                      }}
                    >
                      <div style={{ color: fac.color, marginBottom: 4 }}>{fac.icon}</div>
                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.6,
                          flexGrow: 1,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {fac.desc}
                      </p>
                      <span
                        className="btn-crystal btn-crystal-outline"
                        style={{ padding: '8px 20px', fontSize: 13 }}
                      >
                        Learn More
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ SECTION 6: SDGs ═══════════════ */}
      <section
        className="section-padding"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0d2840 50%, #071a10 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
        id="sdgs"
      >
        {/* Subtle bg orbs */}
        <div className="orb orb-green" style={{ width: 400, height: 400, top: '20%', left: '10%', opacity: 0.2 }} />
        <div className="orb orb-blue" style={{ width: 350, height: 350, bottom: '10%', right: '15%', opacity: 0.2 }} />

        <div className="container-xl relative z-10">
          <SectionTitle
            tag="Global Goals"
            title="Aligned with UN SDGs"
            gradientWord="UN SDGs"
            subtitle="Our work directly advances six United Nations Sustainable Development Goals, demonstrating our commitment to global sustainability."
            align="center"
            light
          />

          <motion.div
            className="flex flex-wrap justify-center gap-6 mt-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {SDGS.map((sdg, idx) => (
              <motion.div
                key={sdg.goal}
                variants={itemVariants}
                onHoverStart={() => setSdgHovered(sdg.goal)}
                onHoverEnd={() => setSdgHovered(null)}
              >
                <motion.div
                  className="sdg-icon"
                  style={{
                    width: 120,
                    height: 120,
                    background: sdg.color,
                    boxShadow: sdgHovered === sdg.goal ? `0 0 40px ${sdg.color}80, 0 0 80px ${sdg.color}40` : 'none',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                  whileHover={{ y: -12, scale: 1.12 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                >
                  <div style={{ fontSize: 28 }}>{sdg.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 0.5 }}>GOAL {sdg.goal}</div>

                  {/* Hover tooltip */}
                  <AnimatePresence>
                    {sdgHovered === sdg.goal && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          position: 'absolute',
                          bottom: '110%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'rgba(10,22,40,0.95)',
                          border: `1px solid ${sdg.color}60`,
                          borderRadius: 10,
                          padding: '8px 14px',
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'white',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                          zIndex: 10,
                        }}
                      >
                        {sdg.name}
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: `6px solid ${sdg.color}60`,
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* SDG description strip */}
          <motion.p
            style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 40, fontSize: '0.9rem' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Hover over each goal to learn more • Click to explore our SDG alignment report
          </motion.p>
        </div>
      </section>

      {/* ═══════════════ SECTION 7: COMMUNITY PLEDGE ═══════════════ */}
      <section
        className="section-padding"
        style={{ background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}
        id="pledge"
      >
        <div className="container-lg">
          <motion.div
            className="crystal-card text-center"
            style={{
              padding: 'clamp(40px, 8vw, 80px)',
              background: 'linear-gradient(135deg, rgba(0,196,125,0.08) 0%, rgba(0,111,239,0.08) 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Confetti burst */}
            <AnimatePresence>
              {showConfetti && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}
                >
                  {Array.from({ length: 30 }).map((_, i) => (
                    <motion.div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: `${30 + Math.random() * 40}%`,
                        top: '50%',
                        width: 8 + Math.random() * 8,
                        height: 8 + Math.random() * 8,
                        borderRadius: Math.random() > 0.5 ? '50%' : 2,
                        background: i % 2 === 0 ? 'var(--green-primary)' : 'var(--blue-primary)',
                      }}
                      animate={{
                        y: [0, -200 - Math.random() * 200],
                        x: [(Math.random() - 0.5) * 300],
                        opacity: [1, 0],
                        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                        scale: [1, 0],
                      }}
                      transition={{ duration: 1.5 + Math.random(), ease: 'easeOut' }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Background gradient blobs */}
            <div className="orb orb-green" style={{ width: 300, height: 300, top: '-20%', right: '-10%', opacity: 0.3, position: 'absolute' }} />
            <div className="orb orb-blue" style={{ width: 250, height: 250, bottom: '-15%', left: '-8%', opacity: 0.3, position: 'absolute' }} />

            <div className="relative z-10">
              <motion.span
                className="label-tag"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-primary)', display: 'inline-block' }} />
                Community Action
              </motion.span>

              <motion.h2
                className="heading-xl mt-4 mb-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, duration: 0.6 }}
              >
                Join Our <span className="gradient-text">Community</span>
              </motion.h2>

              {/* Pledge counter */}
              <motion.div
                className="flex items-center justify-center gap-2 mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 }}
              >
                <Users size={20} color="var(--green-primary)" />
                <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                  <strong style={{ color: 'var(--green-primary)', fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.2rem' }}>
                    {pledgeCount.toLocaleString()}
                  </strong>
                  {' '}people have pledged
                </span>
              </motion.div>

              {/* Pledge quote */}
              <motion.div
                className="glass-card"
                style={{
                  display: 'inline-block',
                  padding: '24px 48px',
                  marginBottom: 40,
                  maxWidth: 520,
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <p
                  style={{
                    fontFamily: 'Outfit',
                    fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontStyle: 'italic',
                    lineHeight: 1.4,
                  }}
                >
                  &ldquo;I will reduce my waste.&rdquo;
                </p>
              </motion.div>

              {/* Pledge button */}
              <div>
                <AnimatePresence mode="wait">
                  {hasPledged ? (
                    <motion.div
                      key="pledged"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center gap-3"
                      style={{
                        padding: '16px 40px',
                        borderRadius: 50,
                        background: 'rgba(0,196,125,0.12)',
                        border: '2px solid var(--green-primary)',
                        display: 'inline-flex',
                        color: 'var(--green-primary)',
                        fontFamily: 'Outfit',
                        fontWeight: 700,
                        fontSize: '1rem',
                      }}
                    >
                      <CheckCircle size={22} />
                      You&apos;ve Pledged! Thank you. 🌿
                    </motion.div>
                  ) : (
                    <motion.button
                      key="pledge-btn"
                      className="btn-crystal btn-crystal-primary"
                      style={{ padding: '18px 52px', fontSize: '1.1rem' }}
                      onClick={handlePledge}
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Leaf size={20} />
                      Take the Pledge
                    </motion.button>
                  )}
                </AnimatePresence>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 16 }}>
                  Free &amp; simple — just your commitment to a greener future.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ SECTION 8: NEWSLETTER CTA ═══════════════ */}
      <section
        style={{
          background: 'var(--gradient-brand)',
          position: 'relative',
          overflow: 'hidden',
        }}
        id="newsletter"
      >
        {/* Shimmer overlay */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        <div className="container-lg" style={{ padding: '64px 24px', position: 'relative', zIndex: 1 }}>
          <motion.div
            className="flex flex-col lg:flex-row items-center justify-between gap-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Left copy */}
            <div className="text-center lg:text-left">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, justifyContent: 'center' }} className="lg:justify-start">
                <Mail size={22} color="white" />
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' }}>Newsletter</span>
              </div>
              <h2
                style={{
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                  color: 'white',
                  lineHeight: 1.25,
                  marginBottom: 12,
                }}
              >
                Stay Informed About<br />
                <span style={{ opacity: 0.85 }}>Waste Management</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 380 }}>
                Get monthly insights on sustainable practices, new facilities,
                environmental policies and community success stories.
              </p>
            </div>

            {/* Right form */}
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 w-full"
              style={{ maxWidth: 480 }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="input-crystal"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1.5px solid rgba(255,255,255,0.4)',
                  color: 'white',
                  flex: 1,
                }}
                required
              />
              <AnimatePresence mode="wait">
                {subscribed ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2"
                    style={{
                      padding: '12px 24px',
                      borderRadius: 50,
                      background: 'rgba(255,255,255,0.2)',
                      border: '1.5px solid rgba(255,255,255,0.5)',
                      color: 'white',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      fontFamily: 'Outfit',
                    }}
                  >
                    <CheckCircle size={18} />
                    Subscribed!
                  </motion.div>
                ) : (
                  <motion.button
                    key="sub-btn"
                    type="submit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="btn-crystal"
                    style={{
                      background: 'white',
                      color: 'var(--green-dark)',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      padding: '14px 28px',
                      fontSize: 15,
                    }}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Subscribe
                    <ArrowRight size={16} />
                  </motion.button>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

          {/* Disclaimer */}
          <motion.p
            style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', textAlign: 'center', marginTop: 24 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            No spam, ever. Unsubscribe anytime. We respect your privacy.
          </motion.p>
        </div>
      </section>
    </main>
  );
}
