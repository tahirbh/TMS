'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Recycle, Truck, SortAsc, Droplets, Cog, Package, ShoppingBag, CheckCircle, ArrowRight, ChevronRight, Factory, Leaf, BarChart3 } from 'lucide-react';
import Link from 'next/link';

/* ══════════════════════════════════════
   TYPES
══════════════════════════════════════ */
interface Step {
  id: number;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  keyFacts: string[];
  statLabel: string;
  statValue: string;
  emoji: string;
}

interface MaterialTab {
  id: string;
  label: string;
  emoji: string;
  color: string;
  steps: { label: string; desc: string; icon: string }[];
  stat: { value: string; text: string };
}

/* ══════════════════════════════════════
   PROCESS STEPS DATA
══════════════════════════════════════ */
const steps: Step[] = [
  {
    id: 1, label: 'Household', icon: ShoppingBag, color: '#8B5CF6', emoji: '🏠',
    description: 'The recycling journey begins at home. Residents sort materials into designated bins — recyclables, organics, and landfill waste. Proper source separation is the single most important factor in recycling quality.',
    keyFacts: ['Use clearly labelled bins for each material type', 'Rinse containers to prevent contamination', 'Flatten cardboard to save collection space', 'Check local guidelines — rules vary by municipality'],
    statLabel: 'Contamination rate when improperly sorted', statValue: '25%',
  },
  {
    id: 2, label: 'Collection', icon: Truck, color: '#EF4444', emoji: '🚛',
    description: 'Specialised collection vehicles pick up sorted recyclables on scheduled routes. Modern fleets use GPS optimisation and IoT bin sensors to maximise efficiency and minimise fuel use per tonne collected.',
    keyFacts: ['Single-stream vs. dual-stream collection systems', 'IoT sensors alert drivers when bins are full', 'Electric collection vehicles reduce emissions by 60%', 'Drop-off centres handle bulky and hazardous items'],
    statLabel: 'Reduction in collection costs with route optimisation', statValue: '30%',
  },
  {
    id: 3, label: 'Sorting', icon: SortAsc, color: '#F97316', emoji: '⚙️',
    description: 'Materials arrive at a Materials Recovery Facility (MRF). Advanced sorting lines use conveyor belts, magnets, optical sensors, and AI-powered robotic arms to separate paper, plastic, metal, and glass at high speed.',
    keyFacts: ['Optical sorters identify 40+ material types per second', 'Eddy current separators extract aluminium', 'AI robots sort 80+ items per minute', 'Residue (contamination) sent to landfill'],
    statLabel: 'Materials correctly sorted by modern AI systems', statValue: '96%',
  },
  {
    id: 4, label: 'Cleaning', icon: Droplets, color: '#00B8D9', emoji: '💧',
    description: 'Sorted materials are cleaned to remove food residue, labels, adhesives, and contaminants. This is critical — even small amounts of food waste or non-recyclable material can ruin entire batches and cause costly processing failures.',
    keyFacts: ['Industrial washers use hot water and detergents', 'Spin-drying reduces energy in next stages', 'Labels and adhesives removed mechanically', 'Water in cleaning systems is recycled on-site'],
    statLabel: 'Energy saved by cleaning vs. virgin material', statValue: '70%',
  },
  {
    id: 5, label: 'Processing', icon: Cog, color: '#00C47D', emoji: '🏭',
    description: 'Clean materials are processed into secondary raw materials. Plastic is shredded into flakes or pellets, paper is pulped, aluminium is melted into ingots, and glass is crushed into cullet — ready for manufacturers.',
    keyFacts: ['Plastic shredded and extruded into pellets', 'Paper pulped with water in a hydrapulper', 'Aluminium melted at 660°C into ingots', 'Glass crushed into cullet saves 30% energy in melting'],
    statLabel: 'Less energy used to process aluminium vs. virgin ore', statValue: '95%',
  },
  {
    id: 6, label: 'Manufacturing', icon: Factory, color: '#006FEF', emoji: '⚡',
    description: 'Secondary raw materials enter manufacturing supply chains, replacing virgin resources. Recycled content is integrated into new products — from food packaging to car parts to construction materials — closing the material loop.',
    keyFacts: ['Recycled PET enters food-grade packaging', 'Recycled aluminium into beverage cans in 60 days', 'Recycled glass in new bottles within 30 days', 'Recycled paper in tissue, cardboard, newspapers'],
    statLabel: 'Reduction in manufacturing emissions vs. virgin materials', statValue: '58%',
  },
  {
    id: 7, label: 'New Product', icon: Package, color: '#00D4AA', emoji: '✨',
    description: 'The final step: a new product containing recycled content reaches consumers, completing the circular loop. When you buy products with recycled content, you directly fund the entire recycling supply chain and signal market demand for circularity.',
    keyFacts: ['Look for "Made with Recycled Content" labels', 'Recycled products often perform identically to virgin', 'Buying recycled closes the economic loop', 'Supports thousands of recycling industry jobs'],
    statLabel: 'Consumers prefer products with recycled content', statValue: '66%',
  },
];

/* ══════════════════════════════════════
   MATERIAL TABS DATA
══════════════════════════════════════ */
const materials: MaterialTab[] = [
  {
    id: 'plastic', label: 'Plastic', emoji: '🧴', color: '#006FEF',
    steps: [
      { label: 'Collection & Sorting', icon: '🗑️', desc: 'PET (1) and HDPE (2) plastics are most commonly collected. Plastics are identified by their resin code (1–7) and sorted accordingly.' },
      { label: 'Washing & Shredding', icon: '🌊', desc: 'Plastic is washed to remove food, labels, and adhesives, then shredded into small flakes for easier processing.' },
      { label: 'Pellet Extrusion', icon: '⚙️', desc: 'Flakes are melted and extruded into uniform pellets — the form manufacturers use as raw material input.' },
      { label: 'New Products', icon: '🎽', desc: 'PET bottles become polyester clothing, carpet fibers, or new bottles. HDPE becomes pipes, crates, and outdoor furniture.' },
    ],
    stat: { value: '9%', text: 'of all plastic ever produced has been recycled' },
  },
  {
    id: 'paper', label: 'Paper', emoji: '📄', color: '#F97316',
    steps: [
      { label: 'Baling & Transport', icon: '📦', desc: 'Sorted paper is compressed into bales at MRFs and transported to paper mills by truck or rail.' },
      { label: 'Pulping', icon: '💧', desc: 'Paper is mixed with water in a hydrapulper to create slurry. Contaminants like staples and plastics are removed.' },
      { label: 'Cleaning & De-inking', icon: '✨', desc: 'Pulp passes through screens and flotation cells to remove ink particles, adhesives, and coatings.' },
      { label: 'New Paper', icon: '🗞️', desc: 'Cleaned pulp is formed into sheets on a paper machine. Output includes newsprint, tissue, cardboard, and packaging.' },
    ],
    stat: { value: '17 trees', text: 'saved per tonne of paper recycled' },
  },
  {
    id: 'metal', label: 'Metal', emoji: '🥫', color: '#8B5CF6',
    steps: [
      { label: 'Magnetic Separation', icon: '🧲', desc: 'Ferrous metals (steel) are extracted using powerful magnets on conveyor belts. Aluminium is separated by eddy current.' },
      { label: 'Shredding & Baling', icon: '⚡', desc: 'Metals are shredded into small pieces and baled for efficient transport to smelters.' },
      { label: 'Melting & Refining', icon: '🔥', desc: 'Metal is melted in large furnaces. Aluminium smelts at 660°C (vs. 900°C+ for virgin ore), saving 95% energy.' },
      { label: 'New Ingots', icon: '🏗️', desc: 'Refined molten metal is cast into ingots ready for manufacturers. A recycled can becomes a new can in just 60 days.' },
    ],
    stat: { value: '95%', text: 'less energy to recycle aluminium vs. virgin production' },
  },
];

/* ══════════════════════════════════════
   FLOWCHART COMPONENT
══════════════════════════════════════ */
function ProcessFlowchart({ activeStep, onSelect }: { activeStep: number | null; onSelect: (id: number) => void }) {
  return (
    <div className="relative">
      {/* Steps row */}
      <div className="flex items-center justify-between gap-2 flex-wrap md:flex-nowrap">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          return (
            <div key={step.id} className="flex items-center gap-2 flex-1 min-w-0">
              {/* Step node */}
              <motion.button
                onClick={() => onSelect(step.id)}
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl cursor-pointer transition-all flex-shrink-0 w-24"
                style={{
                  background: isActive ? `${step.color}25` : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${isActive ? step.color : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: isActive ? `0 0 24px ${step.color}40` : 'none',
                }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: isActive ? `${step.color}35` : `${step.color}15` }}>
                  <Icon className="w-6 h-6" style={{ color: step.color }} />
                </div>
                <span className="text-xs font-semibold text-center leading-tight"
                  style={{ color: isActive ? step.color : 'rgba(255,255,255,0.6)' }}>
                  {step.label}
                </span>
                <span className="text-[10px] font-black" style={{ color: `${step.color}80` }}>
                  0{step.id}
                </span>
              </motion.button>

              {/* Arrow connector */}
              {i < steps.length - 1 && (
                <motion.div className="flex-1 flex items-center justify-center min-w-0"
                  animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}>
                  <div className="h-0.5 w-full rounded-full"
                    style={{ background: `linear-gradient(to right, ${steps[i].color}, ${steps[i + 1].color})` }} />
                  <ChevronRight className="w-4 h-4 flex-shrink-0 -ml-2" style={{ color: steps[i + 1].color }} />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   DETAIL PANEL
══════════════════════════════════════ */
function StepDetail({ step }: { step: Step }) {
  const Icon = step.icon;
  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl p-8 relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${step.color}30`, backdropFilter: 'blur(16px)' }}>

      {/* Background glow */}
      <div className="absolute inset-0 opacity-10"
        style={{ background: `radial-gradient(ellipse at top right, ${step.color}, transparent 60%)` }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${step.color}25`, border: `2px solid ${step.color}40`, boxShadow: `0 0 24px ${step.color}30` }}>
            <span className="text-2xl">{step.emoji}</span>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: step.color }}>
              Step 0{step.id} of 07
            </div>
            <h3 className="text-2xl font-bold text-white">{step.label}</h3>
          </div>
          <div className="ml-auto text-right">
            <div className="text-3xl font-black" style={{ color: step.color }}>{step.statValue}</div>
            <div className="text-xs text-white/40 max-w-32 leading-tight">{step.statLabel}</div>
          </div>
        </div>

        <p className="text-white/65 text-sm leading-relaxed mb-6">{step.description}</p>

        {/* Key facts */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Key Facts</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {step.keyFacts.map((fact, fi) => (
              <div key={fi} className="flex items-start gap-2.5 p-3 rounded-xl"
                style={{ background: `${step.color}10` }}>
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: step.color }} />
                <span className="text-white/65 text-xs leading-relaxed">{fact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */
export default function RecyclingProcessPage() {
  const [activeStep, setActiveStep] = useState<number | null>(1);
  const [activeMaterial, setActiveMaterial] = useState<string>('plastic');

  const selectedStep = steps.find(s => s.id === activeStep) || null;
  const selectedMaterial = materials.find(m => m.id === activeMaterial)!;

  return (
    <main className="overflow-x-hidden">

      {/* ─── HERO ─── */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #050d1a 0%, #0a1628 60%, #021a10 100%)' }}>
        <div className="orb orb-green w-[500px] h-[500px] -top-40 -left-20 opacity-30" />
        <div className="orb orb-blue w-[400px] h-[400px] -bottom-20 right-0 opacity-25" />

        {/* Animated recycle symbol */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div animate={{ rotate: 360, opacity: [0.03, 0.06, 0.03] }}
            transition={{ rotate: { duration: 30, repeat: Infinity, ease: 'linear' }, opacity: { duration: 4, repeat: Infinity } }}
            className="text-[400px] select-none">
            ♻️
          </motion.div>
        </div>

        <div className="relative z-10 text-center container-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="label-tag mx-auto mb-6 w-fit">
            <Recycle className="w-4 h-4" /> Interactive Process
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="heading-hero text-white mb-5">
            The <span className="gradient-text">Recycling Journey</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25 }}
            className="text-white/65 text-body-lg max-w-2xl mx-auto">
            From your bin to a brand-new product — click each step to explore the full lifecycle of your recyclables.
          </motion.p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24"
          style={{ background: 'linear-gradient(transparent, #050d1a)' }} />
      </section>

      {/* ─── INTERACTIVE FLOWCHART ─── */}
      <section className="py-16 px-4" style={{ background: '#050d1a' }}>
        <div className="container-xl">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="mb-8">
            <h2 className="heading-lg text-white text-center mb-2">7-Step Recycling Process</h2>
            <p className="text-white/40 text-center text-sm">Click any step to see full details</p>
          </motion.div>

          {/* Flowchart */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }}
            className="mb-8 p-6 rounded-3xl overflow-x-auto"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="min-w-[700px]">
              <ProcessFlowchart activeStep={activeStep} onSelect={setActiveStep} />
            </div>
          </motion.div>

          {/* Detail panel */}
          <AnimatePresence mode="wait">
            {selectedStep && <StepDetail step={selectedStep} />}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveStep(prev => Math.max(1, (prev || 1) - 1))}
              disabled={(activeStep || 1) <= 1}
              className="btn-crystal btn-crystal-glass text-white border-white/20 disabled:opacity-30 disabled:cursor-not-allowed">
              ← Previous Step
            </motion.button>
            <span className="text-white/40 self-center text-sm">Step {activeStep} of {steps.length}</span>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveStep(prev => Math.min(steps.length, (prev || 1) + 1))}
              disabled={(activeStep || 1) >= steps.length}
              className="btn-crystal btn-crystal-primary disabled:opacity-30 disabled:cursor-not-allowed">
              Next Step <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* ─── MATERIAL-SPECIFIC JOURNEYS ─── */}
      <section className="py-20 px-4" style={{ background: '#0a1628' }}>
        <div className="container-xl">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="text-center mb-12">
            <div className="label-tag mx-auto mb-4 w-fit border-white/20 text-white/70 bg-white/10">
              <BarChart3 className="w-4 h-4" /> Material Types
            </div>
            <h2 className="heading-lg text-white mb-3">Material-Specific Journeys</h2>
            <p className="text-white/50 text-base">Different materials follow unique recycling pathways</p>
          </motion.div>

          {/* Tab buttons */}
          <div className="flex gap-3 justify-center mb-10 flex-wrap">
            {materials.map(mat => (
              <motion.button key={mat.id}
                onClick={() => setActiveMaterial(mat.id)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-full text-sm font-bold transition-all"
                style={{
                  background: activeMaterial === mat.id ? `${mat.color}25` : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${activeMaterial === mat.id ? mat.color : 'rgba(255,255,255,0.1)'}`,
                  color: activeMaterial === mat.id ? mat.color : 'rgba(255,255,255,0.6)',
                  boxShadow: activeMaterial === mat.id ? `0 0 20px ${mat.color}30` : 'none',
                }}>
                {mat.emoji} {mat.label}
              </motion.button>
            ))}
          </div>

          {/* Material journey */}
          <AnimatePresence mode="wait">
            <motion.div key={activeMaterial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}>

              {/* Stat highlight */}
              <div className="text-center mb-8 p-6 rounded-2xl"
                style={{ background: `${selectedMaterial.color}10`, border: `1px solid ${selectedMaterial.color}25` }}>
                <div className="text-4xl font-black mb-1" style={{ color: selectedMaterial.color }}>
                  {selectedMaterial.stat.value}
                </div>
                <div className="text-white/50 text-sm">{selectedMaterial.stat.text}</div>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {selectedMaterial.steps.map((step, si) => (
                  <motion.div key={si}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: si * 0.1 }}
                    whileHover={{ y: -6 }}
                    className="rounded-2xl p-6 relative overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${selectedMaterial.color}25` }}>

                    {/* Step number */}
                    <div className="text-5xl font-black leading-none mb-4 select-none"
                      style={{ color: `${selectedMaterial.color}20`, fontFamily: 'Outfit' }}>
                      0{si + 1}
                    </div>

                    <div className="text-2xl mb-3">{step.icon}</div>
                    <h4 className="font-bold text-white text-sm mb-2">{step.label}</h4>
                    <p className="text-white/50 text-xs leading-relaxed">{step.desc}</p>

                    {/* Arrow to next */}
                    {si < selectedMaterial.steps.length - 1 && (
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: selectedMaterial.color }}>
                          <ChevronRight className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section className="py-16 px-4" style={{ background: '#050d1a' }}>
        <div className="container-xl">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="text-center mb-10">
            <h2 className="heading-lg text-white mb-2">The Impact of <span className="gradient-text">Recycling</span></h2>
            <p className="text-white/50 text-sm">What happens when we get it right</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { emoji: '🌲', stat: '17 Trees', label: 'Saved per tonne of paper recycled', color: '#00C47D' },
              { emoji: '⚡', stat: '95%', label: 'Less energy recycling aluminium vs virgin', color: '#F97316' },
              { emoji: '🌊', stat: '7,000 gal', label: 'Water saved per tonne recycled paper', color: '#006FEF' },
              { emoji: '💨', stat: '58%', label: 'Less CO₂ vs. manufacturing from virgin', color: '#8B5CF6' },
              { emoji: '🏭', stat: '10×', label: 'More jobs from recycling vs. landfilling', color: '#EF4444' },
              { emoji: '🔋', stat: '74%', label: 'Energy saved recycling steel vs. virgin', color: '#00D4AA' },
              { emoji: '♻️', stat: '∞', label: 'Times aluminium can be recycled', color: '#EAB308' },
              { emoji: '🌍', stat: '1.1B', label: 'Tonnes CO₂ saved by recycling annually', color: '#00C47D' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                className="text-center p-6 rounded-2xl"
                style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}>
                <div className="text-3xl mb-3">{item.emoji}</div>
                <div className="text-2xl font-black mb-2" style={{ color: item.color }}>{item.stat}</div>
                <p className="text-white/50 text-xs leading-relaxed">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 px-4"
        style={{ background: 'linear-gradient(135deg, #050d1a, #021a10)' }}>
        <div className="container-lg text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <Recycle className="w-12 h-12 mx-auto mb-6 text-[var(--green-primary)]" />
            <h2 className="heading-lg text-white mb-4">Ready to <span className="gradient-text">Recycle Right?</span></h2>
            <p className="text-white/55 text-base max-w-xl mx-auto mb-8">
              Understanding the process is the first step. Now discover what different waste categories need and how to handle them correctly.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/waste-categories" className="btn-crystal btn-crystal-primary">
                <ArrowRight className="w-5 h-5" /> Explore Waste Categories
              </Link>
              <Link href="/five-rs" className="btn-crystal btn-crystal-glass text-white border-white/20">
                <Leaf className="w-5 h-5" /> The 5 R's Guide
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </main>
  );
}
