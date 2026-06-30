'use client';

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  Globe, Trash2, AlertTriangle, Recycle, Leaf, TrendingUp,
  Building2, Zap, Factory, CheckCircle, ArrowRight, Target,
  BarChart3, Clock, Lightbulb, ShieldCheck, HeartHandshake, TreePine
} from 'lucide-react';
import Link from 'next/link';

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ─── Timeline Data ─── */
const timelineEvents = [
  { year: '1900s', title: 'Open Dumps Common', desc: 'Waste disposal relied on open dumps and burning, polluting air, water, and land with zero regulation or environmental consideration.', color: '#EF4444', icon: Trash2 },
  { year: '1940s', title: 'First Sanitary Landfills', desc: 'The first engineered sanitary landfills appeared, introducing compaction and daily soil covering to reduce odor and pests.', color: '#F97316', icon: Building2 },
  { year: '1970s', title: 'Environmental Movement', desc: 'Earth Day 1970 sparked a global awakening. The US EPA formed, Clean Air and Clean Water Acts passed — waste regulation began.', color: '#EAB308', icon: Leaf },
  { year: '1980s', title: 'Recycling Programs Emerge', desc: 'Curbside recycling pilots launch across major cities. Blue bins appear and the public begins sorting materials for the first time.', color: '#22C55E', icon: Recycle },
  { year: '1990s', title: 'Extended Producer Responsibility', desc: 'EPR policies hold manufacturers accountable for end-of-life product disposal, shifting costs away from municipalities.', color: '#00C47D', icon: ShieldCheck },
  { year: '2000s', title: 'Waste-to-Energy Technology', desc: 'Advanced thermal conversion and biogas technologies turn waste into electricity, reducing landfill dependence significantly.', color: '#006FEF', icon: Zap },
  { year: '2015', title: 'UN SDGs Adopted', desc: 'The 17 Sustainable Development Goals include SDG 12 (Responsible Consumption) and SDG 11 (Sustainable Cities), framing waste globally.', color: '#8B5CF6', icon: Globe },
  { year: '2030', title: 'Zero Waste Targets', desc: 'Nations and cities commit to Zero Waste by 2030 — ambitious targets driving circular economy, minimal landfill, maximum recovery.', color: '#00D4AA', icon: Target },
];

/* ─── Challenge Cards ─── */
const challenges = [
  {
    icon: Building2,
    title: 'Rapid Urbanization',
    subtitle: '68% of the world in cities by 2050',
    desc: 'By 2050, two-thirds of humanity will live in cities. Urban areas already generate 70% of all waste, and the infrastructure to manage rapid population growth is severely underfunded. Developing nations face the most acute crisis as waste collection systems struggle to keep pace.',
    stat: '70%',
    statLabel: 'of waste from urban areas',
    color: '#F97316',
    gradient: 'from-orange-500/20 to-orange-600/5',
  },
  {
    icon: AlertTriangle,
    title: 'Plastic Pollution Crisis',
    subtitle: '8 million tonnes enter oceans annually',
    desc: 'Less than 9% of all plastic ever produced has been recycled. Microplastics now contaminate drinking water, food chains, and even human blood. Single-use plastics persist for 400+ years in landfills, and ocean plastic gyres grow larger every year without intervention.',
    stat: '91%',
    statLabel: 'of plastic never recycled',
    color: '#EF4444',
    gradient: 'from-red-500/20 to-red-600/5',
  },
  {
    icon: Zap,
    title: 'E-Waste Explosion',
    subtitle: '57.4 million tonnes generated in 2021',
    desc: 'Electronic waste is the fastest-growing waste stream globally. Smartphones, laptops, and appliances contain toxic heavy metals — lead, mercury, cadmium — yet only 17.4% is formally recycled. Informal processing in developing countries exposes millions to severe health hazards.',
    stat: '17%',
    statLabel: 'of e-waste formally recycled',
    color: '#8B5CF6',
    gradient: 'from-purple-500/20 to-purple-600/5',
  },
];

/* ─── Benefits ─── */
const benefits = [
  { icon: Leaf, title: 'Environmental Protection', desc: 'Reduces soil, water, and air pollution. Protects biodiversity and natural ecosystems from toxic contamination.', color: '#00C47D' },
  { icon: HeartHandshake, title: 'Public Health', desc: 'Eliminates disease vectors like rats and mosquitoes. Reduces respiratory illness from burning and chemical exposure.', color: '#006FEF' },
  { icon: TrendingUp, title: 'Economic Growth', desc: 'The circular economy could generate $4.5 trillion in value by 2030. Recycling creates 10× more jobs than landfilling.', color: '#8B5CF6' },
  { icon: TreePine, title: 'Climate Action', desc: 'Proper waste management could reduce global GHG emissions by 20%. Organic waste diversion cuts methane from landfills.', color: '#00D4AA' },
];

/* ─── Vision Progress Items ─── */
const visionItems = [
  { label: 'Global Recycling Rate', current: 19, target: 70, color: '#00C47D' },
  { label: 'Waste-to-Energy Adoption', current: 11, target: 35, color: '#006FEF' },
  { label: 'Zero Waste Cities', current: 8, target: 60, color: '#8B5CF6' },
  { label: 'Plastic Recycling Rate', current: 9, target: 80, color: '#00D4AA' },
];

/* ─── Progress Bar Component ─── */
function VisionBar({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <div ref={ref} className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span>
        <div className="flex items-center gap-3 text-xs">
          <span style={{ color }} className="font-bold">{current}% now</span>
          <span className="text-[var(--text-muted)]">→ {target}% target</span>
        </div>
      </div>
      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${current}%` } : { width: 0 }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
        </motion.div>
      </div>
      <div className="relative h-1">
        <div className="absolute h-3 w-px bg-white/40" style={{ left: `${target}%`, top: '-8px' }} />
      </div>
    </div>
  );
}

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */
export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <main className="overflow-x-hidden">

      {/* ─── HERO BANNER ─── */}
      <section ref={heroRef} className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #050d1a 0%, #0a1628 40%, #021a0e 100%)' }}>
        {/* Orbs */}
        <div className="orb orb-green w-[600px] h-[600px] -top-40 -left-40 opacity-40" />
        <div className="orb orb-blue w-[500px] h-[500px] -bottom-40 -right-20 opacity-30" />
        <div className="orb orb-green w-[400px] h-[400px] bottom-0 left-1/3 opacity-20" />

        {/* Grid overlay */}
        <div className="absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgba(0,196,125,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,196,125,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center container-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="label-tag mx-auto mb-6 w-fit">
            <Globe className="w-4 h-4" />
            Our Mission
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}
            className="heading-hero text-white mb-6">
            About{' '}
            <span className="gradient-text">Waste Management</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="text-body-lg text-white/70 max-w-3xl mx-auto mb-10">
            The world generates <strong className="text-[var(--green-primary)]">2.24 billion tonnes</strong> of solid waste annually — 
            a number set to double by 2050. Understanding waste is the first step to solving one of humanity's most urgent environmental crises.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap gap-4 justify-center">
            <Link href="#crisis" className="btn-crystal btn-crystal-primary">
              <BarChart3 className="w-5 h-5" /> Explore the Crisis
            </Link>
            <Link href="#timeline" className="btn-crystal btn-crystal-glass text-white border-white/20">
              <Clock className="w-5 h-5" /> View History
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-[var(--green-primary)] rounded-full animate-bounce" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── GLOBAL WASTE CRISIS ─── */}
      <section id="crisis" className="section-padding bg-[var(--bg-secondary)]">
        <div className="container-xl">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }}
            className="text-center mb-16">
            <div className="label-tag mx-auto mb-4 w-fit"><AlertTriangle className="w-4 h-4" /> The Numbers Don't Lie</div>
            <h2 className="heading-xl gradient-text mb-4">Global Waste Crisis</h2>
            <p className="text-body-lg max-w-2xl mx-auto">
              The scale of the global waste problem is staggering — and growing faster than our ability to manage it.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { value: 2.24, suffix: 'B', label: 'Tonnes generated annually', icon: Trash2, color: '#EF4444' },
              { value: 91, suffix: '%', label: 'of plastic never recycled', icon: AlertTriangle, color: '#F97316' },
              { value: 57, suffix: 'M+', label: 'Tonnes of e-waste per year', icon: Zap, color: '#8B5CF6' },
              { value: 8, suffix: 'M', label: 'Tonnes plastic enter oceans', icon: Globe, color: '#006FEF' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.85, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="crystal-card p-8 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: `${stat.color}20`, boxShadow: `0 0 20px ${stat.color}30` }}>
                  <stat.icon className="w-7 h-7" style={{ color: stat.color }} />
                </div>
                <div className="stat-number mb-2" style={{ fontSize: 'clamp(2rem,4vw,3.2rem)' }}>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-[var(--text-secondary)] font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Wide stat callout */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="crystal-card p-8 md:p-12 text-center relative overflow-hidden">
            <div className="orb orb-green w-80 h-80 -top-20 -right-20 opacity-20" />
            <div className="orb orb-blue w-60 h-60 -bottom-10 -left-10 opacity-15" />
            <div className="relative z-10">
              <p className="text-[var(--text-muted)] uppercase tracking-widest text-sm font-semibold mb-4">By 2050, the world will generate</p>
              <div className="heading-hero gradient-text mb-4">
                <AnimatedCounter target={3.88} suffix=" Billion" /> Tonnes / Year
              </div>
              <p className="text-body-lg max-w-2xl mx-auto">
                Without urgent action, waste generation will outpace population growth — threatening ecosystems, public health, and the global economy.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── TIMELINE ─── */}
      <section id="timeline" className="section-padding" style={{ background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
        <div className="container-lg">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }}
            className="text-center mb-20">
            <div className="label-tag mx-auto mb-4 w-fit"><Clock className="w-4 h-4" /> A Century of Change</div>
            <h2 className="heading-xl mb-4">History of <span className="gradient-text">Waste Management</span></h2>
            <p className="text-body-lg max-w-2xl mx-auto">From open dumps to zero-waste cities — trace humanity's evolving relationship with waste.</p>
          </motion.div>

          <div className="relative">
            {/* Central line */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px hidden md:block"
              style={{ background: 'linear-gradient(to bottom, var(--green-primary), var(--blue-primary))' }} />

            <div className="space-y-12">
              {timelineEvents.map((event, i) => {
                const isLeft = i % 2 === 0;
                const Icon = event.icon;
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className={`relative flex items-center gap-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col md:flex-row`}>

                    {/* Content card */}
                    <div className="flex-1">
                      <motion.div whileHover={{ scale: 1.02, y: -4 }} className="glass-card p-6 md:p-8">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: `${event.color}20`, border: `1px solid ${event.color}40` }}>
                            <Icon className="w-6 h-6" style={{ color: event.color }} />
                          </div>
                          <div>
                            <span className="label-tag text-xs mb-2" style={{ background: `${event.color}15`, color: event.color, border: `1px solid ${event.color}30` }}>
                              {event.year}
                            </span>
                            <h3 className="heading-md mt-2 mb-2">{event.title}</h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{event.desc}</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Center dot */}
                    <div className="hidden md:flex w-8 flex-shrink-0 items-center justify-center">
                      <div className="timeline-dot" style={{ background: event.color, boxShadow: `0 0 0 4px ${event.color}30, 0 0 16px ${event.color}60` }} />
                    </div>

                    {/* Spacer */}
                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CURRENT CHALLENGES ─── */}
      <section className="section-padding" style={{ background: 'linear-gradient(135deg, #050d1a 0%, #0a1628 100%)' }}>
        <div className="container-xl">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }}
            className="text-center mb-16">
            <div className="label-tag mx-auto mb-4 w-fit border-white/20 text-white/80 bg-white/10"><AlertTriangle className="w-4 h-4" /> Right Now</div>
            <h2 className="heading-xl text-white mb-4">Current <span className="gradient-text">Challenges</span></h2>
            <p className="text-white/60 text-body-lg max-w-2xl mx-auto">Three crises defining the modern waste landscape — each demanding urgent, coordinated global response.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {challenges.map((ch, i) => {
              const Icon = ch.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, delay: i * 0.15 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative rounded-3xl p-8 overflow-hidden cursor-default"
                  style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${ch.color}30`, backdropFilter: 'blur(20px)' }}>
                  {/* Glow bg */}
                  <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(ellipse at top left, ${ch.color}, transparent 60%)` }} />

                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                      style={{ background: `${ch.color}20`, border: `1px solid ${ch.color}40`, boxShadow: `0 0 24px ${ch.color}30` }}>
                      <Icon className="w-8 h-8" style={{ color: ch.color }} />
                    </div>

                    <div className="mb-4">
                      <div className="text-5xl font-black mb-1" style={{ color: ch.color }}>{ch.stat}</div>
                      <div className="text-white/50 text-sm">{ch.statLabel}</div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">{ch.title}</h3>
                    <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-4">{ch.subtitle}</p>
                    <p className="text-white/65 text-sm leading-relaxed">{ch.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── BENEFITS ─── */}
      <section className="section-padding bg-[var(--bg-secondary)]">
        <div className="container-xl">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }}
            className="text-center mb-16">
            <div className="label-tag mx-auto mb-4 w-fit"><CheckCircle className="w-4 h-4" /> The Upside</div>
            <h2 className="heading-xl mb-4">Benefits of Proper <span className="gradient-text">Waste Management</span></h2>
            <p className="text-body-lg max-w-2xl mx-auto">When waste is managed well, the returns — environmental, social, and economic — are transformative.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  whileHover={{ y: -6 }}
                  className="crystal-card feature-card text-center group">
                  <div className="feature-icon-wrap mx-auto" style={{ background: `${b.color}15` }}>
                    <Icon className="w-7 h-7 transition-colors" style={{ color: b.color }} />
                  </div>
                  <h3 className="heading-md mb-3">{b.title}</h3>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{b.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FUTURE VISION ─── */}
      <section className="section-padding" style={{ background: 'linear-gradient(135deg, #050d1a 0%, #071428 50%, #021a0e 100%)' }}>
        <div className="container-lg">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }}
            className="text-center mb-16">
            <div className="label-tag mx-auto mb-4 w-fit border-white/20 text-white/80 bg-white/10"><Target className="w-4 h-4" /> Looking Ahead</div>
            <h2 className="heading-xl text-white mb-4">Zero Waste by <span className="gradient-text">2050</span></h2>
            <p className="text-white/60 text-body-lg max-w-2xl mx-auto">
              A zero-waste future is achievable — but it requires dramatically scaling what works. Here's where we stand versus where we need to be.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Progress bars */}
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="space-y-8"
              style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-xl font-bold text-white mb-6">Progress Tracker</h3>
              {visionItems.map((item, i) => (
                <VisionBar key={i} {...item} />
              ))}
              <p className="text-white/40 text-xs mt-4">│ = 2050 target threshold</p>
            </motion.div>

            {/* Vision pillars */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="space-y-5">
              {[
                { icon: Recycle, title: 'Circular Economy Design', desc: 'Products designed from the start to be repaired, reused, and recycled — eliminating the concept of waste entirely.', color: '#00C47D' },
                { icon: Factory, title: 'Industrial Symbiosis', desc: "One industry's waste becomes another's resource. Zero industrial landfilling through material exchange networks.", color: '#006FEF' },
                { icon: Lightbulb, title: 'Smart Waste Systems', desc: 'AI-powered sorting robots, IoT bin sensors, and blockchain material tracking maximize recovery at every step.', color: '#8B5CF6' },
                { icon: Globe, title: 'Global Policy Alignment', desc: 'UN plastic treaty, EPR mandates, and extended landfill taxes create the economic incentives for systemic change.', color: '#00D4AA' },
              ].map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    whileHover={{ x: 8 }}
                    className="flex items-start gap-4 p-5 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${pillar.color}25` }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${pillar.color}20` }}>
                      <Icon className="w-5 h-5" style={{ color: pillar.color }} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{pillar.title}</h4>
                      <p className="text-white/55 text-sm leading-relaxed">{pillar.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-center mt-20">
            <p className="text-white/50 mb-6 text-sm uppercase tracking-widest font-semibold">Ready to be part of the solution?</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/five-rs" className="btn-crystal btn-crystal-primary">
                <ArrowRight className="w-5 h-5" /> Learn the 5 R's
              </Link>
              <Link href="/waste-categories" className="btn-crystal btn-crystal-glass text-white border-white/20">
                <Recycle className="w-5 h-5" /> Explore Waste Categories
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </main>
  );
}
