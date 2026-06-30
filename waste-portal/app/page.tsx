'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Globe,
  Trash2,
  Recycle,
  Target,
  Brain,
  Hand,
  ArrowDown,
  RefreshCw,
  ArrowRight,
  Play,
  Leaf,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import SectionTitle from '@/components/ui/SectionTitle';
import GlassCard from '@/components/ui/GlassCard';
import CrystalButton from '@/components/ui/CrystalButton';

export default function HomePage() {
  const [pledgeCount, setPledgeCount] = useState(12847);
  const [hasPledged, setHasPledged] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

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

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <main className="overflow-x-hidden min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      
      {/* Confetti Animation Effect */}
      {showConfetti && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="text-4xl animate-bounce">🎉 PLEDGED! THANK YOU! 🌱</div>
        </div>
      )}

      {/* ═══════════════ SECTION 1: HERO ═══════════════ */}
      <section 
        className="hero-section" 
        style={{ 
          minHeight: '92vh', 
          paddingTop: '120px', 
          paddingBottom: '100px', 
          position: 'relative', 
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(240,250,245,0.8) 0%, rgba(255,255,255,0.9) 60%, rgba(230,242,255,0.5) 100%)'
        }}
      >
        {/* Glow Orbs */}
        <div className="orb orb-green" style={{ width: 450, height: 450, top: '-5%', left: '-5%', opacity: 0.35 }} />
        <div className="orb orb-blue" style={{ width: 450, height: 450, bottom: '5%', right: '-5%', opacity: 0.3 }} />

        {/* Large Floating 3D Recycle Symbol in Background */}
        <motion.div 
          style={{
            position: 'absolute',
            left: '32%',
            top: '20%',
            width: '280px',
            height: '280px',
            opacity: 0.28,
            pointerEvents: 'none',
            zIndex: 1,
          }}
          animate={{ 
            rotate: 360,
            y: [0, -12, 0]
          }}
          transition={{ 
            rotate: { duration: 30, repeat: Infinity, ease: 'linear' },
            y: { duration: 5, repeat: Infinity, ease: 'easeInOut' }
          }}
        >
          <img src="/crystal-recycle-logo.png" alt="" className="w-full h-full object-contain" />
        </motion.div>

        <div className="container-xl relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Column */}
            <motion.div 
              className="lg:col-span-7 space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.span 
                variants={itemVariants} 
                className="label-tag"
                style={{ 
                  background: 'rgba(0, 196, 125, 0.1)', 
                  color: 'var(--green-primary)', 
                  border: '1px solid rgba(0, 196, 125, 0.25)' 
                }}
              >
                <Leaf size={14} className="mr-1.5" /> WASTE MANAGEMENT EXCELLENCE
              </motion.span>

              <motion.h1 
                variants={itemVariants} 
                className="heading-hero"
                style={{ color: '#0f172a', fontWeight: 900, lineHeight: 1.1 }}
              >
                <span style={{ color: 'var(--blue-primary)' }}>Re-Think</span><br />
                About Your Desire<br />
                <span style={{ color: 'var(--green-primary)' }}>Before You Acquire</span>
              </motion.h1>

              <motion.p 
                variants={itemVariants} 
                className="text-body-lg text-slate-600 max-w-xl"
                style={{ fontSize: '1.1rem', lineHeight: 1.6 }}
              >
                Every purchase creates an environmental footprint. Choose wisely. Reduce waste. Build a sustainable future for generations to come.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-2">
                <Link href="/five-rs" className="btn-crystal btn-crystal-primary flex items-center gap-2">
                  <span>Explore The 5R's</span>
                  <ArrowRight size={16} />
                </Link>
                <Link href="/about" className="btn-crystal btn-crystal-glass flex items-center gap-2" style={{ border: '1px solid #cbd5e1' }}>
                  <span>Learn More</span>
                  <Play size={12} fill="currentColor" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Representative Photo Column */}
            <motion.div 
              className="lg:col-span-5 flex justify-center lg:justify-end relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {/* Decorative Frame */}
              <div 
                className="relative overflow-hidden rounded-3xl"
                style={{
                  width: '322px',
                  height: '395px',
                  boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15)',
                  border: '4px solid white',
                  background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)'
                }}
              >
                <img 
                  src="/representative.png" 
                  alt="Official Representative" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Ministry badge floating behind */}
              <div 
                style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '-15px',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'white',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  zIndex: -1
                }}
              >
                <img src="/eh-logo.png" alt="Sponsor" className="w-full h-full object-contain" />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ═══════════════ CRITICAL OVERLAY STATS BAR ═══════════════ */}
      <section className="relative z-20 -mt-12">
        <div className="container-xl">
          <div 
            className="glass-card p-6" 
            style={{ 
              borderRadius: '20px', 
              border: '1px solid rgba(255,255,255,0.7)',
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(30px)',
              boxShadow: '0 20px 50px rgba(0, 196, 125, 0.08)'
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { val: 2.24, suffix: 'B', label: 'BILLION TONS', desc: 'Waste generated globally every year', color: 'var(--blue-primary)', icon: <Globe size={20} /> },
                { val: 33, suffix: '%', label: 'WASTE MISMANAGED', desc: 'Waste is not managed in an environmentally safe way', color: 'var(--green-primary)', icon: <Trash2 size={20} /> },
                { val: 70, suffix: '%', label: 'OF WASTE RECYCLABLE', desc: 'Of waste is recyclable materials', color: 'var(--blue-primary)', icon: <Recycle size={20} /> },
                { val: 17, suffix: '', label: 'UN SDGS TARGETS', desc: 'Sustainable Development Goals (SDGs)', color: 'var(--green-primary)', icon: <Target size={20} /> }
              ].map((s, idx) => (
                <div key={idx} className="flex items-center gap-4 py-2 px-3 border-r last:border-none border-slate-200/60">
                  <div 
                    style={{ 
                      width: '46px', 
                      height: '46px', 
                      borderRadius: '50%', 
                      background: 'white',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: s.color,
                      flexShrink: 0
                    }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-extrabold text-slate-800" style={{ fontFamily: 'Outfit' }}>
                        <AnimatedCounter value={s.val} suffix="" duration={2.0} />
                      </span>
                      <span className="text-sm font-extrabold text-slate-800" style={{ color: s.color }}>{s.suffix}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider ml-1">{s.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 2: THE POWER OF 5 RS ═══════════════ */}
      <section className="section-padding bg-slate-50" style={{ background: '#f8fafc' }}>
        <div className="container-xl">
          <SectionTitle
            tag="Circular Framework"
            title="The Power of 5 R's"
            gradientWord="5 R's"
            subtitle="Explore how simple shifts in behavior make a significant impact in driving waste diversion."
            align="center"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12 items-stretch">
            
            {/* 5 Cards Row */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { name: 'RE-THINK', icon: <Brain size={24} />, desc: 'Think before you buy. Your choices today create less waste tomorrow.', color: 'var(--blue-primary)', bg: 'rgba(59, 130, 246, 0.04)' },
                { name: 'REFUSE', icon: <Hand size={24} />, desc: 'Avoid unnecessary products and single-use items.', color: 'var(--green-primary)', bg: 'rgba(0, 196, 125, 0.04)' },
                { name: 'REDUCE', icon: <ArrowDown size={24} />, desc: 'Use less. Consume resources responsibly.', color: 'var(--blue-primary)', bg: 'rgba(59, 130, 246, 0.04)' },
                { name: 'REUSE', icon: <RefreshCw size={24} />, desc: 'Extend the life of products. Use again and again.', color: 'var(--green-primary)', bg: 'rgba(0, 196, 125, 0.04)' },
                { name: 'RECYCLE', icon: <Recycle size={24} />, desc: 'Recycle materials to reduce landfill and save resources.', color: 'var(--blue-primary)', bg: 'rgba(59, 130, 246, 0.04)' }
              ].map((r, idx) => (
                <div 
                  key={idx} 
                  className="glass-card p-4 flex flex-col items-center text-center justify-between"
                  style={{ 
                    borderRadius: '16px', 
                    background: 'white', 
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    height: '100%',
                    minHeight: '220px'
                  }}
                >
                  <div 
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '14px', 
                      background: r.bg,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: r.color,
                      marginBottom: '12px'
                    }}
                  >
                    {r.icon}
                  </div>
                  <h4 className="text-xs font-black tracking-wider mb-2" style={{ color: r.color }}>{r.name}</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed flex-1">{r.desc}</p>
                </div>
              ))}
              
              <div className="sm:col-span-5 text-center mt-4">
                <Link href="/five-rs" className="text-xs font-bold text-blue-600 hover:underline flex items-center justify-center gap-1">
                  <span>Learn more about the 5 R's</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            {/* Pledge Card */}
            <div className="lg:col-span-4">
              <div 
                className="glass-card p-6 relative overflow-hidden flex flex-col justify-between"
                style={{ 
                  borderRadius: '20px', 
                  background: 'white',
                  border: '1px solid rgba(0, 196, 125, 0.2)',
                  height: '100%',
                  boxShadow: '0 10px 30px rgba(0,196,125,0.04)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                    Take the Pledge <Leaf size={14} className="text-emerald-500 animate-pulse" />
                  </h3>
                </div>

                <p className="text-slate-600 text-xs italic font-medium leading-relaxed mb-4">
                  &quot;I will re-think my choices, reduce waste, reuse more, and recycle always for a better tomorrow.&quot;
                </p>
                
                <p className="text-xs font-black text-emerald-500 mb-6" style={{ fontFamily: 'Outfit' }}>Be The Change!™</p>

                <div className="space-y-4">
                  <motion.button
                    onClick={handlePledge}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow"
                    style={{ 
                      background: hasPledged ? 'var(--green-primary)' : 'var(--blue-primary)',
                      border: 'none', 
                      cursor: hasPledged ? 'default' : 'pointer'
                    }}
                  >
                    <span>{hasPledged ? "I'm In ✓" : "Take the Pledge"}</span>
                  </motion.button>
                  
                  <div className="flex items-center gap-3">
                    <div style={{ width: '45px', height: '45px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src="/pledge-plant.png" alt="Plant" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Join thousands of people making a difference.</p>
                      <p className="text-xs font-black text-slate-700 mt-0.5">{pledgeCount.toLocaleString()} Pledges Registered</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 3: SUSTAINABLE FACILITIES ═══════════════ */}
      <section className="section-padding" style={{ background: 'white' }}>
        <div className="container-xl">
          <SectionTitle
            tag="Modern Infrastructure"
            title="Our Sustainable Facilities"
            gradientWord="Sustainable Facilities"
            subtitle="Processing waste locally through state-of-the-art facilities compliant with environmental regulations."
            align="center"
          />

          {/* 5 Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-12">
            {[
              { title: 'Material Recovery Facility (MRF)', img: '/facility-1.png', label: 'RECYCLE', color: '#3b82f6' },
              { title: 'Organic Waste Composting Plant', img: '/facility-2.png', label: 'ORGANIC', color: '#10b981' },
              { title: 'Waste to Energy Plant', img: '/facility-3.png', label: 'ENERGY', color: '#f59e0b' },
              { title: 'Leachate Treatment Plant', img: '/facility-4.png', label: 'WATER', color: '#06b6d4' },
              { title: 'Sanitary Landfill Facility', img: '/facility-5.png', label: 'LANDFILL', color: '#64748b' }
            ].map((f, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
                style={{ height: '220px' }}
              >
                {/* Background Image */}
                <img 
                  src={f.img} 
                  alt={f.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                
                {/* Overlay gradient */}
                <div 
                  className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-85"
                  style={{
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 60%, transparent 100%)'
                  }}
                />

                {/* Floating badge */}
                <span 
                  className="absolute top-3 left-3 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded text-white"
                  style={{ background: f.color }}
                >
                  {f.label}
                </span>

                {/* Content */}
                <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                  <h4 className="text-xs font-bold leading-tight group-hover:text-emerald-400 transition-colors">{f.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/facilities" className="btn-crystal btn-crystal-glass text-xs font-semibold flex items-center gap-1.5 mx-auto" style={{ width: 'fit-content' }}>
              <span>View All Facilities</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 4: SDG SUPPORT ═══════════════ */}
      <section className="section-padding bg-slate-50" style={{ background: '#f8fafc' }}>
        <div className="container-xl">
          <SectionTitle
            tag="Global Alignment"
            title="We Support Sustainable Development Goals"
            gradientWord="Sustainable Development"
            subtitle="Aligning waste operations with the United Nations Sustainable Development Goals (SDGs) for a clean planet."
            align="center"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-12 items-stretch">
            
            {/* 6 SDG Icons */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-6 gap-3">
              {[
                { nr: '6', title: 'Clean Water', color: '#26BDE2', desc: 'Safeguarding groundwater from leachate.' },
                { nr: '11', title: 'Sustainable Cities', color: '#FD9D24', desc: 'Optimized urban waste systems.' },
                { nr: '12', title: 'Responsible Production', color: '#BF8B2E', desc: 'Advocating resource efficiency.' },
                { nr: '13', title: 'Climate Action', color: '#3F7E44', desc: 'Minimizing landfill methane.' },
                { nr: '14', title: 'Life Below Water', color: '#0A97D9', desc: 'Reducing marine plastic leakage.' },
                { nr: '15', title: 'Life on Land', color: '#56C02B', desc: 'Remediating contaminated soil.' }
              ].map((s, idx) => (
                <div 
                  key={idx}
                  className="glass-card p-4 flex flex-col items-center justify-between text-center"
                  style={{
                    borderRadius: '16px',
                    background: 'white',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    height: '100%'
                  }}
                >
                  <div 
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: s.color, 
                      color: 'white',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontFamily: 'Outfit',
                      marginBottom: '8px'
                    }}
                  >
                    {s.nr}
                  </div>
                  <h4 className="text-[10px] font-black uppercase text-slate-800 leading-tight mb-2">{s.title}</h4>
                  <p className="text-[9px] text-slate-400 font-medium leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Earth callout card */}
            <div className="lg:col-span-4">
              <div 
                className="glass-card p-5 relative overflow-hidden flex flex-col justify-between text-white"
                style={{
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  height: '100%'
                }}
              >
                <div>
                  <h3 className="font-bold text-sm mb-2">Let's build a</h3>
                  <h2 className="text-xl font-extrabold text-emerald-400 mb-4" style={{ fontFamily: 'Outfit' }}>Waste-Free Future together</h2>
                </div>

                <div className="flex gap-4 items-center">
                  <div style={{ width: '80px', height: '100px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src="/sdg-globe.png" alt="SDG Earth" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
                    Our operations support green jobs, sustainable development, and carbon reduction across the Kingdom of Saudi Arabia.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════ GREEN ACCENT FOOTER BAR ═══════════════ */}
      <section 
        className="py-4" 
        style={{ 
          background: 'linear-gradient(90deg, #00995a 0%, #00c47d 100%)', 
          color: 'white' 
        }}
      >
        <div className="container-xl">
          <div className="flex flex-wrap justify-between items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">🌍 <span>Protects Our Planet</span></div>
            <div className="flex items-center gap-1.5">💼 <span>Creates Green Jobs</span></div>
            <div className="flex items-center gap-1.5">📊 <span>Saves Resources</span></div>
            <div className="flex items-center gap-1.5">✔️ <span>Secures a Better Future</span></div>
          </div>
        </div>
      </section>

    </main>
  );
}
