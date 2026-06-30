'use client';

import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  Factory,
  Leaf,
  Zap,
  Droplets,
  Mountain,
  AlertTriangle,
  Hospital,
  Monitor,
  ArrowRight,
  CheckCircle,
  Calendar,
  Star,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';

/* ─── Types ─── */
interface Facility {
  id: number;
  name: string;
  emoji: string;
  color: string;
  colorLight: string;
  stat: string;
  capacity: string;
  wasteTypes: string;
  certification: string;
  description: string;
  capabilities: string[];
  technology: string[];
  stats: { label: string; value: string }[];
}

/* ─── Data ─── */
const facilities: Facility[] = [
  {
    id: 1,
    name: 'Material Recovery Facility',
    emoji: '🏭',
    color: '#00C47D',
    colorLight: 'rgba(0,196,125,0.12)',
    stat: 'Processes 500 tons/day',
    capacity: '500 tons/day',
    wasteTypes: 'Mixed Recyclables',
    certification: 'ISO 9001, ISO 14001',
    description:
      'Advanced sorting facility using optical sensors, air classification, and magnetic separation to recover valuable materials from mixed waste streams.',
    capabilities: [
      'Optical sensor sorting',
      'Air classification',
      'Magnetic separation',
      'Eddy current separation',
    ],
    technology: ['NIR Sensors', 'Conveyor Systems', 'Balers', 'Shredders'],
    stats: [
      { label: 'Daily Capacity', value: '500 tons' },
      { label: 'Recovery Rate', value: '90%' },
    ],
  },
  {
    id: 2,
    name: 'Composting Plant',
    emoji: '🌿',
    color: '#22C55E',
    colorLight: 'rgba(34,197,94,0.12)',
    stat: '200 tons/day capacity',
    capacity: '200 tons/day',
    wasteTypes: 'Organic Waste',
    certification: 'ISO 14001',
    description:
      'Converts organic waste into nutrient-rich compost through controlled aerobic decomposition, producing premium soil amendment products.',
    capabilities: [
      'Aerobic decomposition',
      'Temperature monitoring',
      'Moisture control',
      'Product screening',
    ],
    technology: ['Windrow Turners', 'Aeration Systems', 'Bio-filters', 'Screening Plants'],
    stats: [
      { label: 'Daily Capacity', value: '200 tons' },
      { label: 'Processing Cycle', value: '60 days' },
    ],
  },
  {
    id: 3,
    name: 'Waste-to-Energy Plant',
    emoji: '⚡',
    color: '#F59E0B',
    colorLight: 'rgba(245,158,11,0.12)',
    stat: 'Generates 20MW electricity',
    capacity: '400 tons/day',
    wasteTypes: 'Non-recyclable Waste',
    certification: 'ISO 50001',
    description:
      'Converts non-recyclable waste into electricity and heat through controlled combustion, reducing landfill volume by 90%.',
    capabilities: [
      'Controlled combustion',
      'Energy recovery',
      'Flue gas treatment',
      'Bottom ash processing',
    ],
    technology: ['Moving Grate Furnace', 'Steam Turbines', 'Electrostatic Precipitators', 'SCADA'],
    stats: [
      { label: 'Power Output', value: '20 MW' },
      { label: 'Homes Served', value: '20,000' },
    ],
  },
  {
    id: 4,
    name: 'Leachate Treatment',
    emoji: '💧',
    color: '#006FEF',
    colorLight: 'rgba(0,111,239,0.12)',
    stat: 'Treats 1M liters/day',
    capacity: '1M liters/day',
    wasteTypes: 'Contaminated Leachate',
    certification: 'ISO 14001',
    description:
      'Multi-stage treatment system processing contaminated landfill leachate to meet discharge standards using biological and chemical processes.',
    capabilities: [
      'Biological treatment',
      'Chemical precipitation',
      'Membrane filtration',
      'UV disinfection',
    ],
    technology: ['MBR Systems', 'RO Membranes', 'UV Reactors', 'Chemical Dosing'],
    stats: [
      { label: 'Daily Volume', value: '1M L' },
      { label: 'Removal Rate', value: '99.9%' },
    ],
  },
  {
    id: 5,
    name: 'Sanitary Landfill',
    emoji: '🏔️',
    color: '#8B5CF6',
    colorLight: 'rgba(139,92,246,0.12)',
    stat: '50-year operational life',
    capacity: 'Unlimited (phased)',
    wasteTypes: 'Residual Waste',
    certification: 'ISO 14001, RCRA',
    description:
      'Engineered disposal facility with impermeable liner, leachate collection, gas capture, and phased closure for residual waste disposal.',
    capabilities: [
      'Liner system',
      'Leachate collection',
      'Gas capture',
      'Phased closure',
    ],
    technology: ['HDPE Liners', 'Gas Collection Wells', 'Flares', 'Monitoring Wells'],
    stats: [
      { label: 'Operational Life', value: '50 years' },
      { label: 'Gas Capture', value: 'Methane → Energy' },
    ],
  },
  {
    id: 6,
    name: 'Hazardous Waste Facility',
    emoji: '⚠️',
    color: '#EF4444',
    colorLight: 'rgba(239,68,68,0.12)',
    stat: '50+ waste classifications',
    capacity: '50 tons/day',
    wasteTypes: 'Hazardous Industrial',
    certification: 'ISO 14001, OHSAS 18001',
    description:
      'Specialized high-security facility for treatment, storage, and disposal of hazardous industrial and chemical wastes under strict regulatory compliance.',
    capabilities: [
      'Secure storage',
      'Chemical treatment',
      'Incineration',
      'Containment systems',
    ],
    technology: ['Rotary Kiln Incinerators', 'Secure Lagoons', 'CCTV Monitoring', 'Emergency Response'],
    stats: [
      { label: 'Classifications', value: '50+' },
      { label: 'Standard', value: 'ISO 14001' },
    ],
  },
  {
    id: 7,
    name: 'Medical Waste Plant',
    emoji: '🏥',
    color: '#EC4899',
    colorLight: 'rgba(236,72,153,0.12)',
    stat: '24/7 continuous operation',
    capacity: '20 tons/day',
    wasteTypes: 'Infectious Medical Waste',
    certification: 'WHO, ISO 14001',
    description:
      'Dedicated autoclave and incineration facility ensuring safe treatment of infectious medical waste from hospitals, clinics, and laboratories.',
    capabilities: [
      'Autoclave sterilization',
      'High-temperature incineration',
      'Sharps handling',
      'Traceability tracking',
    ],
    technology: ['Autoclave Systems', 'High-temp Incinerators', 'RFID Tracking', 'Air Scrubbers'],
    stats: [
      { label: 'Operation', value: '24/7' },
      { label: 'Compliance', value: 'WHO Guidelines' },
    ],
  },
  {
    id: 8,
    name: 'E-Waste Facility',
    emoji: '💻',
    color: '#06B6D4',
    colorLight: 'rgba(6,182,212,0.12)',
    stat: 'Recovers 35kg gold/ton CPUs',
    capacity: '30 tons/day',
    wasteTypes: 'Electronic Waste',
    certification: 'e-Stewards, R2',
    description:
      'Specialized dismantling and recovery facility extracting precious metals (gold, silver, copper) from end-of-life electronics safely.',
    capabilities: [
      'Manual dismantling',
      'Precious metal recovery',
      'Data destruction',
      'Zero landfill policy',
    ],
    technology: ['Shredders', 'Hydrometallurgy', 'Data Wiping Software', 'Refining Units'],
    stats: [
      { label: 'Gold Recovery', value: '35kg/ton' },
      { label: 'Landfill', value: 'Zero' },
    ],
  },
];

/* ─── Flip Card Component ─── */
function FlipCard({ facility, index }: { facility: Facility; index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
      className="flip-card"
      style={{ minHeight: 340 }}
      onClick={() => setIsFlipped(!isFlipped)}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className="flip-card-inner"
        style={{
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: 340,
        }}
      >
        {/* FRONT */}
        <div
          className="flip-card-front flex flex-col items-center justify-center p-8 text-center"
          style={{
            background: `linear-gradient(145deg, ${facility.colorLight}, rgba(255,255,255,0.9))`,
            border: `1.5px solid ${facility.color}30`,
            boxShadow: `0 8px 32px ${facility.color}20`,
          }}
        >
          {/* Glow orb behind emoji */}
          <div
            className="absolute inset-0 rounded-3xl opacity-20"
            style={{
              background: `radial-gradient(ellipse at 50% 30%, ${facility.color}, transparent 70%)`,
            }}
          />

          {/* Colored top bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
            style={{ background: facility.color }}
          />

          {/* Emoji */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl mb-4 relative z-10"
          >
            {facility.emoji}
          </motion.div>

          <h3
            className="heading-md relative z-10 mb-3"
            style={{ color: facility.color }}
          >
            {facility.name}
          </h3>

          <div
            className="relative z-10 px-4 py-2 rounded-full text-sm font-semibold"
            style={{
              background: `${facility.color}20`,
              color: facility.color,
              border: `1px solid ${facility.color}40`,
            }}
          >
            {facility.stat}
          </div>

          <div className="absolute bottom-4 right-4 opacity-40 z-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <div
                className="w-8 h-8 rounded-full border-2 border-dashed"
                style={{ borderColor: facility.color }}
              />
            </motion.div>
          </div>

          <p className="text-xs text-gray-400 mt-4 relative z-10">Hover to learn more →</p>
        </div>

        {/* BACK */}
        <div
          className="flip-card-back flex flex-col p-6 overflow-hidden"
          style={{
            background: `linear-gradient(145deg, #0a1628, #0d2040)`,
            border: `1.5px solid ${facility.color}50`,
            boxShadow: `0 8px 40px ${facility.color}30, inset 0 0 60px rgba(0,0,0,0.3)`,
          }}
        >
          {/* Glow top */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: `linear-gradient(90deg, transparent, ${facility.color}, transparent)` }}
          />

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{facility.emoji}</span>
            <h3 className="font-bold text-white text-base leading-tight">{facility.name}</h3>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-xs leading-relaxed mb-4">{facility.description}</p>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {facility.stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-2 text-center"
                style={{ background: `${facility.color}15`, border: `1px solid ${facility.color}30` }}
              >
                <div className="font-bold text-sm" style={{ color: facility.color }}>
                  {s.value}
                </div>
                <div className="text-gray-400 text-xs">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Capabilities */}
          <div className="mb-3">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Capabilities
            </p>
            <div className="flex flex-wrap gap-1">
              {facility.capabilities.slice(0, 3).map((c) => (
                <span
                  key={c}
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    background: `${facility.color}20`,
                    color: facility.color,
                    border: `1px solid ${facility.color}30`,
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Technology */}
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Technology
            </p>
            <div className="flex flex-wrap gap-1">
              {facility.technology.slice(0, 3).map((t) => (
                <span key={t} className="text-xs text-gray-300 flex items-center gap-1">
                  <span style={{ color: facility.color }}>•</span> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom glow */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-12 rounded-full blur-2xl opacity-30"
            style={{ background: facility.color }}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Comparison Table ─── */
function ComparisonTable() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container-xl" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="label-tag mb-4">
            <Star className="w-3 h-3" /> Facility Overview
          </span>
          <h2 className="heading-xl gradient-text mt-4 mb-4">Facilities at a Glance</h2>
          <p className="text-body-lg max-w-2xl mx-auto">
            A comprehensive comparison of all our world-class waste management facilities.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="crystal-card overflow-x-auto"
        >
          <table className="data-table w-full">
            <thead>
              <tr>
                <th className="pl-6">Facility</th>
                <th>Capacity</th>
                <th>Waste Types</th>
                <th>Certifications</th>
                <th className="pr-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((f, i) => (
                <motion.tr
                  key={f.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.07 }}
                >
                  <td className="pl-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ background: f.colorLight }}
                      >
                        {f.emoji}
                      </div>
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {f.name}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {f.capacity}
                    </span>
                  </td>
                  <td>
                    <span
                      className="badge text-xs"
                      style={{
                        background: `${f.color}15`,
                        color: f.color,
                      }}
                    >
                      {f.wasteTypes}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {f.certification}
                    </span>
                  </td>
                  <td className="pr-6">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: f.color, boxShadow: `0 0 6px ${f.color}` }}
                      />
                      <span className="text-xs font-semibold" style={{ color: f.color }}>
                        Operational
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Tour CTA ─── */
function TourCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const contactItems = [
    { icon: <Phone className="w-5 h-5" />, label: 'Call Us', value: '+966 11 234 5678' },
    { icon: <Mail className="w-5 h-5" />, label: 'Email', value: 'tours@waste-portal.sa' },
    { icon: <MapPin className="w-5 h-5" />, label: 'Location', value: 'Riyadh, Saudi Arabia' },
  ];

  return (
    <section
      className="section-padding relative overflow-hidden"
      style={{ background: 'var(--gradient-hero)' }}
      ref={ref}
    >
      {/* Orbs */}
      <div className="orb orb-green w-96 h-96 -top-24 -left-24 opacity-30" />
      <div className="orb orb-blue w-96 h-96 -bottom-24 -right-24 opacity-30" />

      <div className="container-lg relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="label-tag mb-6 border-green-400/30 text-green-400 bg-green-400/10">
              <Calendar className="w-3 h-3" /> Schedule a Visit
            </span>
            <h2 className="heading-xl text-white mt-4 mb-6 leading-tight">
              Request a{' '}
              <span className="gradient-text">Facility Tour</span>
            </h2>
            <p className="text-body-lg text-gray-300 mb-8 leading-relaxed">
              Experience our world-class waste management operations firsthand. Our expert guides
              will walk you through each facility, showcasing cutting-edge technology and
              sustainable practices in action.
            </p>

            {/* Features list */}
            <div className="space-y-3 mb-10">
              {[
                'Expert-guided tours of all 8 facilities',
                'Live demonstrations of sorting & recovery systems',
                'Q&A sessions with engineering teams',
                'Complimentary sustainability report',
              ].map((item) => (
                <motion.div
                  key={item}
                  className="flex items-center gap-3"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--green-primary)' }} />
                  <span className="text-gray-300 text-sm">{item}</span>
                </motion.div>
              ))}
            </div>

            {/* Contact info */}
            <div className="grid grid-cols-3 gap-4">
              {contactItems.map((c) => (
                <div
                  key={c.label}
                  className="glass-card p-4 text-center"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="flex justify-center mb-2 opacity-70" style={{ color: 'var(--green-primary)' }}>
                    {c.icon}
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                  <p className="text-xs text-white font-semibold">{c.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="crystal-card p-8"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <h3 className="heading-md text-white mb-6">Book Your Tour</h3>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="John"
                    className="input-crystal"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'white',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Smith"
                    className="input-crystal"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'white',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">
                  Organization
                </label>
                <input
                  type="text"
                  placeholder="Your Company / Institution"
                  className="input-crystal"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'white',
                  }}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">
                  Preferred Facilities
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {facilities.slice(0, 4).map((f) => (
                    <label
                      key={f.id}
                      className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 hover:text-white transition-colors"
                    >
                      <input type="checkbox" className="rounded" />
                      <span>{f.emoji} {f.name.split(' ')[0]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">
                  Preferred Date
                </label>
                <input
                  type="date"
                  className="input-crystal"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'white',
                  }}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">
                  Group Size
                </label>
                <select
                  className="input-crystal"
                  style={{
                    background: 'rgba(20,30,50,0.8)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'white',
                  }}
                >
                  <option value="">Select group size</option>
                  <option>1–5 people</option>
                  <option>6–15 people</option>
                  <option>16–30 people</option>
                  <option>30+ people</option>
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="btn-crystal btn-crystal-primary w-full justify-center py-4"
              >
                Request Tour <ArrowRight className="w-4 h-4 ml-1" />
              </motion.button>

              <p className="text-center text-xs text-gray-500">
                Our team will contact you within 24 hours to confirm your tour.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Main Page ─── */
export default function FacilitiesPage() {
  const heroRef = useRef(null);

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* ── HERO ── */}
      <section
        className="hero-section"
        ref={heroRef}
        style={{
          minHeight: '70vh',
          background: 'linear-gradient(rgba(10, 22, 40, 0.78), rgba(10, 22, 40, 0.88)), url(\'/facility-hero.png\') no-repeat center center / cover',
        }}
      >
        {/* Animated orbs */}
        <div className="orb orb-green" style={{ width: 500, height: 500, top: '-10%', left: '-5%', opacity: 0.25 }} />
        <div className="orb orb-blue" style={{ width: 400, height: 400, bottom: '-10%', right: '-5%', opacity: 0.2 }} />

        {/* Particle field */}
        <div className="particle-field">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={`particle ${i % 2 === 0 ? 'particle-green' : 'particle-blue'}`}
              style={{
                width: Math.random() * 6 + 2 + 'px',
                height: Math.random() * 6 + 2 + 'px',
                left: Math.random() * 100 + '%',
                animationDuration: Math.random() * 15 + 10 + 's',
                animationDelay: Math.random() * 10 + 's',
              }}
            />
          ))}
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,196,125,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,196,125,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="container-xl relative z-10 py-32">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-6"
          >
            <span className="label-tag" style={{ background: 'rgba(0,196,125,0.1)', borderColor: 'rgba(0,196,125,0.3)' }}>
              🏭 Our Infrastructure
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="heading-hero text-white mb-6"
          >
            World-Class{' '}
            <span className="gradient-text text-glow-green">Facilities</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-body-lg text-gray-300 max-w-2xl mb-10 leading-relaxed"
          >
            Eight integrated facilities working in harmony — from material recovery to
            waste-to-energy — representing the pinnacle of modern waste management engineering.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <a href="#facilities-grid" className="btn-crystal btn-crystal-primary">
              Explore Facilities <ChevronRight className="w-4 h-4" />
            </a>
            <a href="#tour-cta" className="btn-crystal btn-crystal-outline">
              Book a Tour
            </a>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
          >
            {[
              { value: '8', label: 'World-Class Facilities' },
              { value: '1,200+', label: 'Tons Processed Daily' },
              { value: '99.9%', label: 'Treatment Efficiency' },
              { value: '50+', label: 'Years of Operation' },
            ].map((s) => (
              <div
                key={s.label}
                className="glass-card p-5 text-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="stat-number text-3xl mb-1">{s.value}</div>
                <p className="text-gray-400 text-xs">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── INTRO ── */}
      <section className="section-padding">
        <div className="container-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="crystal-card p-10 text-center relative overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-5"
              style={{ background: 'var(--gradient-brand)' }}
            />
            <span className="label-tag mb-4">
              <Factory className="w-3 h-3" /> Modern Infrastructure
            </span>
            <h2 className="heading-lg gradient-text mt-4 mb-6">
              Integrated Waste Management Excellence
            </h2>
            <p className="text-body-lg max-w-3xl mx-auto leading-relaxed">
              Our integrated campus of eight specialized facilities represents a landmark in waste
              management engineering. Each facility is designed to handle specific waste streams with
              maximum efficiency, using the latest technologies from optical sorting and anaerobic
              digestion to high-temperature incineration and precious metal recovery. Together, they
              form a closed-loop system that minimizes landfill use, recovers maximum value, and
              protects the environment for generations to come.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FLIP CARDS GRID ── */}
      <section id="facilities-grid" className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container-xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="label-tag mb-4">
              🔄 Hover to Flip
            </span>
            <h2 className="heading-xl gradient-text mt-4 mb-4">
              Our 8 Core Facilities
            </h2>
            <p className="text-body-lg max-w-xl mx-auto">
              Hover over any card to discover the technology, capabilities, and performance stats of each facility.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((facility, i) => (
              <FlipCard key={facility.id} facility={facility} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <ComparisonTable />

      {/* ── TOUR CTA ── */}
      <div id="tour-cta">
        <TourCTA />
      </div>
    </main>
  );
}
