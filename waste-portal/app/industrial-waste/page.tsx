'use client';

import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  Factory,
  Flame,
  FlaskConical,
  Pickaxe,
  Building2,
  Zap,
  Filter,
  Beaker,
  Wind,
  Thermometer,
  Layers,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Shield,
  BookOpen,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

/* ─── Types ─── */
interface IndustrySector {
  icon: React.ReactNode;
  name: string;
  color: string;
  colorLight: string;
  wasteTypes: string[];
  volume: string;
  volumeColor: string;
}

interface TreatmentMethod {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  techniques: { name: string; desc: string }[];
}

interface CaseStudy {
  title: string;
  sector: string;
  color: string;
  before: { metric: string; value: string }[];
  after: { metric: string; value: string }[];
  solution: string;
  result: string;
}

/* ─── Data ─── */
const sectors: IndustrySector[] = [
  {
    icon: <Factory className="w-7 h-7" />,
    name: 'Manufacturing',
    color: '#00C47D',
    colorLight: 'rgba(0,196,125,0.1)',
    wasteTypes: ['Metal shavings', 'Industrial solvents', 'Plastic offcuts', 'Packaging waste'],
    volume: '120,000 tons/yr',
    volumeColor: '#00C47D',
  },
  {
    icon: <Flame className="w-7 h-7" />,
    name: 'Oil & Gas',
    color: '#F59E0B',
    colorLight: 'rgba(245,158,11,0.1)',
    wasteTypes: ['Drilling muds', 'Produced water', 'Refinery waste', 'Oily sludge'],
    volume: '85,000 tons/yr',
    volumeColor: '#F59E0B',
  },
  {
    icon: <FlaskConical className="w-7 h-7" />,
    name: 'Chemical Industry',
    color: '#8B5CF6',
    colorLight: 'rgba(139,92,246,0.1)',
    wasteTypes: ['Off-spec products', 'Reaction byproducts', 'Solvents', 'Catalysts'],
    volume: '60,000 tons/yr',
    volumeColor: '#8B5CF6',
  },
  {
    icon: <Pickaxe className="w-7 h-7" />,
    name: 'Mining',
    color: '#EF4444',
    colorLight: 'rgba(239,68,68,0.1)',
    wasteTypes: ['Tailings', 'Heap leach residuals', 'Acid mine drainage', 'Process water'],
    volume: '200,000 tons/yr',
    volumeColor: '#EF4444',
  },
  {
    icon: <Building2 className="w-7 h-7" />,
    name: 'Construction',
    color: '#06B6D4',
    colorLight: 'rgba(6,182,212,0.1)',
    wasteTypes: ['Concrete rubble', 'Timber & wood', 'Drywall', 'Metals & wiring'],
    volume: '150,000 tons/yr',
    volumeColor: '#06B6D4',
  },
  {
    icon: <Zap className="w-7 h-7" />,
    name: 'Power Plants',
    color: '#EC4899',
    colorLight: 'rgba(236,72,153,0.1)',
    wasteTypes: ['Fly ash', 'Bottom ash', 'FGD gypsum', 'Boiler slag'],
    volume: '95,000 tons/yr',
    volumeColor: '#EC4899',
  },
];

const treatmentMethods: TreatmentMethod[] = [
  {
    id: 'physical',
    label: 'Physical',
    icon: <Filter className="w-5 h-5" />,
    description:
      'Physical treatment methods separate and concentrate waste components without chemical transformation, using mechanical forces and physical properties.',
    techniques: [
      { name: 'Screening & Sieving', desc: 'Separates particles by size using mesh screens and vibrating sieves.' },
      { name: 'Sedimentation', desc: 'Gravity settling of suspended solids in clarifiers and settling tanks.' },
      { name: 'Filtration', desc: 'Removes particulates through sand, activated carbon, or membrane filters.' },
      { name: 'Centrifugation', desc: 'High-speed spinning separates liquids from solids rapidly.' },
      { name: 'Flotation', desc: 'Air bubbles lift fine particles and oils to the surface for removal.' },
    ],
  },
  {
    id: 'chemical',
    label: 'Chemical',
    icon: <Beaker className="w-5 h-5" />,
    description:
      'Chemical treatment transforms hazardous waste constituents through reactions that reduce toxicity, volume, or mobility.',
    techniques: [
      { name: 'Neutralization', desc: 'Adjusts pH of acidic or alkaline wastes to safe discharge levels.' },
      { name: 'Chemical Precipitation', desc: 'Converts dissolved metals to insoluble forms for easy removal.' },
      { name: 'Oxidation/Reduction', desc: 'Destroys or transforms organic pollutants using oxidants like ozone.' },
      { name: 'Ion Exchange', desc: 'Removes specific ions from solutions using ion exchange resins.' },
      { name: 'Advanced Oxidation', desc: 'UV/H₂O₂ or Fenton processes break down persistent organics.' },
    ],
  },
  {
    id: 'biological',
    label: 'Biological',
    icon: <Wind className="w-5 h-5" />,
    description:
      'Biological processes harness microorganisms to degrade organic pollutants, converting them into harmless end products.',
    techniques: [
      { name: 'Aerobic Treatment', desc: 'Oxygen-supported microbes break down organics in activated sludge systems.' },
      { name: 'Anaerobic Digestion', desc: 'Bacteria decompose organics without oxygen, producing biogas.' },
      { name: 'Bioremediation', desc: 'In-situ or ex-situ microbial treatment of contaminated soils/water.' },
      { name: 'Phytoremediation', desc: 'Plants absorb and concentrate pollutants from soil or water.' },
      { name: 'Composting', desc: 'Controlled aerobic decomposition of organic wastes into humus.' },
    ],
  },
  {
    id: 'thermal',
    label: 'Thermal',
    icon: <Thermometer className="w-5 h-5" />,
    description:
      'Thermal treatment uses elevated temperatures to destroy, reduce volume, or recover energy from industrial waste.',
    techniques: [
      { name: 'Incineration', desc: 'High-temperature combustion destroys organics and sterilizes waste.' },
      { name: 'Pyrolysis', desc: 'Thermal decomposition without oxygen produces oil, gas, and char.' },
      { name: 'Gasification', desc: 'Converts waste to syngas at high temperatures with limited oxygen.' },
      { name: 'Plasma Arc', desc: 'Ultra-high temperature plasma vitrifies hazardous waste into glass slag.' },
      { name: 'Thermal Desorption', desc: 'Heat drives off volatile contaminants from soils and sediments.' },
    ],
  },
  {
    id: 'stabilization',
    label: 'Stabilization',
    icon: <Layers className="w-5 h-5" />,
    description:
      'Stabilization and solidification techniques immobilize hazardous constituents, reducing leachability and physical hazards.',
    techniques: [
      { name: 'Cement Solidification', desc: 'Portland cement binds waste into a solid, low-permeability matrix.' },
      { name: 'Pozzolanic Stabilization', desc: 'Fly ash and lime react with waste to form cementitious products.' },
      { name: 'Polymer Encapsulation', desc: 'Thermoplastic or thermosetting polymers coat and seal waste particles.' },
      { name: 'Vitrification', desc: 'Melting waste into a glass matrix captures contaminants permanently.' },
      { name: 'Lime Stabilization', desc: 'Lime reactions reduce moisture, pathogen content, and metal mobility.' },
    ],
  },
];

const caseStudies: CaseStudy[] = [
  {
    title: 'Petrochemical Refinery Wastewater Treatment',
    sector: 'Oil & Gas',
    color: '#F59E0B',
    before: [
      { metric: 'COD Level', value: '2,400 mg/L' },
      { metric: 'Oil & Grease', value: '350 mg/L' },
      { metric: 'Treatment Cost', value: '$18/m³' },
    ],
    after: [
      { metric: 'COD Level', value: '45 mg/L' },
      { metric: 'Oil & Grease', value: '< 5 mg/L' },
      { metric: 'Treatment Cost', value: '$6/m³' },
    ],
    solution:
      'Implemented a three-stage treatment train combining dissolved air flotation, biological activated sludge, and membrane bioreactor (MBR) polishing.',
    result:
      '98.1% COD reduction, 98.6% oil & grease removal, and 67% cost reduction achieved within 18 months of operation.',
  },
  {
    title: 'Mining Tailings Stabilization Program',
    sector: 'Mining',
    color: '#EF4444',
    before: [
      { metric: 'Heavy Metals Leaching', value: '450 mg/L' },
      { metric: 'Acid Drainage pH', value: '2.3' },
      { metric: 'Affected Area', value: '25 hectares' },
    ],
    after: [
      { metric: 'Heavy Metals Leaching', value: '< 2 mg/L' },
      { metric: 'Acid Drainage pH', value: '7.1' },
      { metric: 'Remediated Area', value: '25 hectares' },
    ],
    solution:
      'Combined lime neutralization, sulfate-reducing bacteria bioreactor, and engineered tailings cap with HDPE geomembrane and phytostabilization.',
    result:
      'Complete neutralization of acid mine drainage, 99.6% reduction in heavy metal leaching, and successful revegetation of all impacted areas.',
  },
  {
    title: 'Manufacturing Solvent Recovery & Reuse',
    sector: 'Manufacturing',
    color: '#00C47D',
    before: [
      { metric: 'Solvent Disposed', value: '1,200 tons/yr' },
      { metric: 'Disposal Cost', value: '$2.4M/yr' },
      { metric: 'CO₂ Emissions', value: '850 tons/yr' },
    ],
    after: [
      { metric: 'Solvent Recovered', value: '960 tons/yr' },
      { metric: 'Net Revenue', value: '+$1.1M/yr' },
      { metric: 'CO₂ Emissions', value: '120 tons/yr' },
    ],
    solution:
      'Installed vacuum distillation and fractional recovery units to separate and purify mixed solvent streams for direct reuse in production processes.',
    result:
      '80% solvent recovery rate converted a $2.4M annual cost into a $1.1M revenue stream, with 86% reduction in associated carbon emissions.',
  },
];

const regulations = [
  {
    code: 'NCBE Reg. 702',
    title: 'National Centre for Waste Management Standards',
    desc: 'Sets national standards for industrial waste classification, treatment minimums, and licensed facility requirements.',
    color: '#00C47D',
  },
  {
    code: 'MEWA Circular',
    title: 'Ministry of Environment Guidelines',
    desc: 'Environmental discharge limits for wastewater, air emissions, and soil contamination thresholds across all industrial sectors.',
    color: '#006FEF',
  },
  {
    code: 'Saudi PDO',
    title: 'Petroleum Development Ordinance',
    desc: 'Governs the handling, transport, and disposal of oil field waste, drilling muds, and produced water in the Kingdom.',
    color: '#F59E0B',
  },
  {
    code: 'SASO 2870',
    title: 'Saudi Standards for Hazardous Waste',
    desc: 'Defines hazardous waste categories, labeling, storage requirements, and transport protocols for industrial generators.',
    color: '#EF4444',
  },
];

/* ─── Sector Card ─── */
function SectorCard({ sector, index }: { sector: IndustrySector; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="crystal-card p-7 relative overflow-hidden group cursor-pointer"
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(145deg, ${sector.colorLight}, transparent)` }}
      />

      {/* Color top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl transition-all duration-300 group-hover:h-1.5"
        style={{ background: sector.color }}
      />

      {/* Icon */}
      <motion.div
        whileHover={{ rotate: 10, scale: 1.15 }}
        className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: sector.colorLight, color: sector.color }}
      >
        {sector.icon}
      </motion.div>

      <h3 className="heading-md relative z-10 mb-4" style={{ color: 'var(--text-primary)' }}>
        {sector.name}
      </h3>

      {/* Waste types */}
      <ul className="relative z-10 space-y-2 mb-6">
        {sector.wasteTypes.map((type) => (
          <li key={type} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sector.color }} />
            {type}
          </li>
        ))}
      </ul>

      {/* Volume badge */}
      <div className="relative z-10">
        <span
          className="badge text-xs font-bold"
          style={{ background: `${sector.color}15`, color: sector.color }}
        >
          📊 {sector.volume}
        </span>
      </div>

      {/* Decorative circle */}
      <div
        className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"
        style={{ background: sector.color }}
      />
    </motion.div>
  );
}

/* ─── Treatment Tabs ─── */
function TreatmentSection() {
  const [activeTab, setActiveTab] = useState('physical');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const active = treatmentMethods.find((m) => m.id === activeTab)!;

  return (
    <section
      className="section-padding relative overflow-hidden"
      style={{ background: 'var(--bg-secondary)' }}
      ref={ref}
    >
      {/* Background orb */}
      <div className="orb orb-blue absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 opacity-15" />

      <div className="container-xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="label-tag mb-4">
            <FlaskConical className="w-3 h-3" /> Treatment Technology
          </span>
          <h2 className="heading-xl gradient-text mt-4 mb-4">Industrial Treatment Methods</h2>
          <p className="text-body-lg max-w-2xl mx-auto">
            Five core treatment categories address the full spectrum of industrial waste characteristics.
          </p>
        </motion.div>

        {/* Tab buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {treatmentMethods.map((method) => (
            <motion.button
              key={method.id}
              onClick={() => setActiveTab(method.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                activeTab === method.id
                  ? 'btn-crystal-primary shadow-lg'
                  : 'btn-crystal btn-crystal-glass'
              }`}
            >
              {method.icon}
              {method.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Active tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="crystal-card p-8 md:p-12"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Description */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(0,196,125,0.1)', color: 'var(--green-primary)' }}
                  >
                    {active.icon}
                  </div>
                  <h3 className="heading-lg">{active.label} Treatment</h3>
                </div>
                <p className="text-body-lg mb-8 leading-relaxed">{active.description}</p>

                {/* 3D illustration placeholder */}
                <div
                  className="rounded-2xl p-8 text-center relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(0,196,125,0.08), rgba(0,111,239,0.08))' }}
                >
                  <div className="text-6xl mb-4">
                    {active.id === 'physical' && '🔩'}
                    {active.id === 'chemical' && '⚗️'}
                    {active.id === 'biological' && '🦠'}
                    {active.id === 'thermal' && '🔥'}
                    {active.id === 'stabilization' && '🧱'}
                  </div>
                  <p className="font-semibold gradient-text text-lg">
                    {active.label} Treatment Process
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {active.techniques.length} core techniques
                  </p>
                  <div
                    className="absolute inset-0 opacity-10 rounded-2xl"
                    style={{ background: 'var(--gradient-brand)' }}
                  />
                </div>
              </div>

              {/* Techniques list */}
              <div className="space-y-4">
                <h4 className="heading-md mb-2">Core Techniques</h4>
                {active.techniques.map((tech, i) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    whileHover={{ x: 4 }}
                    className="glass-card p-5 relative overflow-hidden group"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5"
                        style={{ background: 'var(--gradient-brand)' }}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <h5 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                          {tech.name}
                        </h5>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {tech.desc}
                        </p>
                      </div>
                    </div>
                    {/* Hover accent */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'var(--green-primary)' }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ─── Case Study Accordion ─── */
function CaseStudiesSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="section-padding" ref={ref}>
      <div className="container-lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="label-tag mb-4">
            <TrendingUp className="w-3 h-3" /> Success Stories
          </span>
          <h2 className="heading-xl gradient-text mt-4 mb-4">Case Studies</h2>
          <p className="text-body-lg max-w-2xl mx-auto">
            Real-world results from our industrial waste management projects across the Kingdom.
          </p>
        </motion.div>

        <div className="space-y-4">
          {caseStudies.map((cs, i) => (
            <motion.div
              key={cs.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="accordion-item crystal-card overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="accordion-header w-full text-left"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: cs.color }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {cs.title}
                    </p>
                    <span
                      className="badge text-xs mt-1"
                      style={{ background: `${cs.color}15`, color: cs.color }}
                    >
                      {cs.sector}
                    </span>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                </motion.div>
              </button>

              {/* Content */}
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-8 pt-2">
                      {/* Before / After grid */}
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* Before */}
                        <div
                          className="rounded-2xl p-6"
                          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <TrendingDown className="w-5 h-5 text-red-500" />
                            <h4 className="font-bold text-red-600">Before Treatment</h4>
                          </div>
                          <div className="space-y-3">
                            {cs.before.map((b) => (
                              <div key={b.metric} className="flex justify-between items-center">
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                  {b.metric}
                                </span>
                                <span className="font-bold text-red-600 text-sm">{b.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* After */}
                        <div
                          className="rounded-2xl p-6"
                          style={{ background: 'rgba(0,196,125,0.06)', border: '1px solid rgba(0,196,125,0.15)' }}
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5" style={{ color: 'var(--green-primary)' }} />
                            <h4 className="font-bold" style={{ color: 'var(--green-dark)' }}>
                              After Treatment
                            </h4>
                          </div>
                          <div className="space-y-3">
                            {cs.after.map((a) => (
                              <div key={a.metric} className="flex justify-between items-center">
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                  {a.metric}
                                </span>
                                <span
                                  className="font-bold text-sm"
                                  style={{ color: 'var(--green-primary)' }}
                                >
                                  {a.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Solution & Result */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-semibold mb-2 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" style={{ color: 'var(--blue-primary)' }} />
                            Solution Applied
                          </h5>
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {cs.solution}
                          </p>
                        </div>
                        <div>
                          <h5 className="font-semibold mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--green-primary)' }} />
                            Outcome
                          </h5>
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {cs.result}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Regulatory Section ─── */
function RegulatorySection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      className="section-padding relative overflow-hidden"
      style={{ background: 'var(--bg-secondary)' }}
      ref={ref}
    >
      <div className="orb orb-green absolute left-0 top-0 w-96 h-96 opacity-15" />

      <div className="container-xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="label-tag mb-4">
            <Shield className="w-3 h-3" /> Compliance
          </span>
          <h2 className="heading-xl gradient-text mt-4 mb-4">Saudi Regulatory Framework</h2>
          <p className="text-body-lg max-w-2xl mx-auto">
            Industrial waste management in the Kingdom is governed by a robust set of
            environmental laws and ministerial regulations.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {regulations.map((reg, i) => (
            <motion.div
              key={reg.code}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="crystal-card p-7 relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                style={{ background: reg.color }}
              />
              <div className="flex items-start gap-5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: `${reg.color}20`, color: reg.color, border: `2px solid ${reg.color}40` }}
                >
                  <span className="text-center leading-tight text-xs font-bold">{reg.code.split(' ')[0]}</span>
                </div>
                <div>
                  <h3 className="font-bold mb-2" style={{ color: reg.color }}>
                    {reg.code}
                  </h3>
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {reg.title}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {reg.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Compliance stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="crystal-card p-8 md:p-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(0,196,125,0.06), rgba(0,111,239,0.06))' }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '100%', label: 'Regulatory Compliance', icon: '✅' },
              { value: 'ISO 14001', label: 'Environmental Standard', icon: '🏆' },
              { value: 'NCBE', label: 'National Certification', icon: '📜' },
              { value: 'Zero', label: 'Violations Recorded', icon: '🛡️' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="stat-number text-2xl mb-1">{stat.value}</div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div
            className="absolute inset-0 opacity-5 rounded-3xl"
            style={{ background: 'var(--gradient-brand)' }}
          />
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Main Page ─── */
export default function IndustrialWastePage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* ── HERO ── */}
      <section
        className="hero-section"
        style={{
          minHeight: '70vh',
          background: 'linear-gradient(135deg, #080c14 0%, #0a1628 50%, #0a120a 100%)',
        }}
      >
        {/* Orbs */}
        <div className="orb orb-green" style={{ width: 600, height: 600, top: '-20%', right: '-10%', opacity: 0.2 }} />
        <div className="orb orb-blue" style={{ width: 400, height: 400, bottom: '-15%', left: '-5%', opacity: 0.15 }} />

        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,196,125,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,196,125,0.8) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        {/* Diagonal stripes - industrial aesthetic */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,200,50,0.5) 10px, rgba(255,200,50,0.5) 11px)',
          }}
        />

        <div className="container-xl relative z-10 py-32">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-6"
          >
            <span
              className="label-tag"
              style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', color: '#F59E0B' }}
            >
              🏗️ Industrial Solutions
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="heading-hero text-white mb-6 max-w-4xl"
          >
            Industrial Waste{' '}
            <span className="gradient-text text-glow-green">Management</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-body-lg text-gray-300 max-w-2xl mb-10 leading-relaxed"
          >
            Comprehensive solutions for the full spectrum of industrial waste — from petrochemical
            sludge and mining tailings to manufacturing by-products. Compliant, efficient, and
            engineered for Saudi industry.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <a href="#sectors" className="btn-crystal btn-crystal-primary">
              Explore Sectors <ChevronRight className="w-4 h-4" />
            </a>
            <a href="#treatment" className="btn-crystal btn-crystal-outline">
              Treatment Methods
            </a>
          </motion.div>

          {/* KPI chips */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="flex flex-wrap gap-4 mt-16"
          >
            {[
              { label: '6 Industry Sectors', icon: '🏭' },
              { label: '5 Treatment Methods', icon: '⚗️' },
              { label: '700K+ tons/yr', icon: '📊' },
              { label: '100% Compliant', icon: '✅' },
            ].map((chip) => (
              <div
                key={chip.label}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <span>{chip.icon}</span>
                {chip.label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SECTORS ── */}
      <section id="sectors" className="section-padding">
        <div className="container-xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <span className="label-tag mb-4">
              <Factory className="w-3 h-3" /> Industry Coverage
            </span>
            <h2 className="heading-xl gradient-text mt-4 mb-4">6 Industry Sectors</h2>
            <p className="text-body-lg max-w-2xl mx-auto">
              Tailored waste management strategies for every major industrial sector operating in the Kingdom.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.map((sector, i) => (
              <SectorCard key={sector.name} sector={sector} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TREATMENT METHODS ── */}
      <div id="treatment">
        <TreatmentSection />
      </div>

      {/* ── CASE STUDIES ── */}
      <CaseStudiesSection />

      {/* ── REGULATORY FRAMEWORK ── */}
      <RegulatorySection />

      {/* ── CTA BANNER ── */}
      <section
        className="section-padding relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #050d1a 0%, #0a1628 50%, #0a1f12 100%)' }}
      >
        <div className="orb orb-green absolute -bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-60 opacity-20" />

        <div className="container-lg relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-6xl mb-6">🏭</div>
            <h2 className="heading-xl text-white mb-6">
              Need an{' '}
              <span className="gradient-text">Industrial Waste Solution?</span>
            </h2>
            <p className="text-body-lg text-gray-300 mb-10 max-w-xl mx-auto">
              Our engineering teams design customized waste management strategies tailored
              to your industry, volume, and regulatory requirements.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="btn-crystal btn-crystal-primary text-lg px-10 py-4"
              >
                Get a Free Assessment <ArrowRight className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="/facilities"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="btn-crystal btn-crystal-outline text-lg px-10 py-4"
              >
                View Our Facilities
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

// Needed for lucide-react icons used inline
function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}
