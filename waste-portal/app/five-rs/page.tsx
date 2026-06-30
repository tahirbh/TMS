'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { CheckCircle, ArrowDown, Lightbulb, Ban, Minimize2, RefreshCw, Recycle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

/* ═══════════════════════════════════════════════════
   5 R'S DATA
═══════════════════════════════════════════════════ */
interface R {
  number: string;
  name: string;
  tagline: string;
  color: string;
  colorLight: string;
  desc1: string;
  desc2: string;
  tips: string[];
  examples: { title: string; desc: string; emoji: string }[];
  Icon: React.ElementType;
  SvgIcon: () => JSX.Element;
}

/* SVG Icons per R */
const RethinkSvg = () => (
  <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
    <circle cx="60" cy="50" r="32" stroke="#8B5CF6" strokeWidth="4" fill="none" opacity="0.3" />
    <motion.circle cx="60" cy="50" r="32" stroke="#8B5CF6" strokeWidth="4" fill="none"
      strokeDasharray="201" strokeDashoffset="201"
      animate={{ strokeDashoffset: 0 }} transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }} />
    <circle cx="60" cy="50" r="20" fill="#8B5CF620" />
    <path d="M52 44 Q60 36 68 44 Q72 50 68 56 L64 60 L64 65" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" fill="none" />
    <circle cx="64" cy="70" r="2.5" fill="#8B5CF6" />
    {/* Brain wrinkles */}
    <path d="M45 48 Q42 44 46 41" stroke="#8B5CF660" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M75 48 Q78 44 74 41" stroke="#8B5CF660" strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Glow dots */}
    <circle cx="38" cy="28" r="3" fill="#8B5CF6" opacity="0.6">
      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="82" cy="22" r="2" fill="#8B5CF6" opacity="0.4">
      <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="92" cy="58" r="4" fill="#8B5CF6" opacity="0.3">
      <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.5s" repeatCount="indefinite" />
    </circle>
    {/* Base */}
    <rect x="54" y="83" width="12" height="5" rx="2" fill="#8B5CF6" opacity="0.5" />
    <rect x="52" y="87" width="16" height="4" rx="2" fill="#8B5CF6" opacity="0.4" />
  </svg>
);

const RefuseSvg = () => (
  <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
    {/* Hand */}
    <rect x="50" y="40" width="10" height="45" rx="5" fill="#EF4444" opacity="0.7" />
    <rect x="63" y="46" width="9" height="39" rx="4.5" fill="#EF4444" opacity="0.7" />
    <rect x="75" y="50" width="9" height="35" rx="4.5" fill="#EF4444" opacity="0.7" />
    <rect x="38" y="55" width="9" height="30" rx="4.5" fill="#EF4444" opacity="0.7" />
    <rect x="38" y="62" width="46" height="28" rx="8" fill="#EF4444" opacity="0.85" />
    {/* Stop circle */}
    <circle cx="60" cy="38" r="22" stroke="#EF4444" strokeWidth="3" fill="#EF444415" />
    <motion.line x1="45" y1="23" x2="75" y2="53" stroke="#EF4444" strokeWidth="4" strokeLinecap="round"
      animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
    {/* Pulse ring */}
    <circle cx="60" cy="38" r="28" stroke="#EF4444" strokeWidth="1" fill="none" opacity="0.3">
      <animate attributeName="r" values="28;36;28" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const ReduceSvg = () => (
  <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
    {/* Outer box */}
    <rect x="20" y="20" width="80" height="80" rx="12" stroke="#00C47D" strokeWidth="3" fill="#00C47D10" strokeDasharray="8 4" />
    {/* Inner box shrinking */}
    <motion.rect x="35" y="35" width="50" height="50" rx="8" stroke="#00C47D" strokeWidth="3" fill="#00C47D20"
      animate={{ x: [35, 40, 35], y: [35, 40, 35], width: [50, 40, 50], height: [50, 40, 50] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
    {/* Arrows pointing inward */}
    <path d="M28 60 L42 60" stroke="#00C47D" strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#arrowG)" />
    <path d="M92 60 L78 60" stroke="#00C47D" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M60 28 L60 42" stroke="#00C47D" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M60 92 L60 78" stroke="#00C47D" strokeWidth="2.5" strokeLinecap="round" />
    {/* Arrowheads */}
    <polygon points="40,57 40,63 47,60" fill="#00C47D" />
    <polygon points="80,57 80,63 73,60" fill="#00C47D" />
    <polygon points="57,40 63,40 60,47" fill="#00C47D" />
    <polygon points="57,80 63,80 60,73" fill="#00C47D" />
  </svg>
);

const ReuseSvg = () => (
  <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
    {/* Circular arrows */}
    <motion.path
      d="M60 25 A35 35 0 0 1 95 60"
      stroke="#006FEF" strokeWidth="5" strokeLinecap="round" fill="none"
      animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.path
      d="M95 60 A35 35 0 0 1 25 60"
      stroke="#006FEF" strokeWidth="5" strokeLinecap="round" fill="none"
      animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1, ease: 'easeInOut' }}
    />
    <motion.path
      d="M25 60 A35 35 0 0 1 60 25"
      stroke="#006FEF" strokeWidth="5" strokeLinecap="round" fill="none"
      animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 2, ease: 'easeInOut' }}
    />
    {/* Arrow tips */}
    <polygon points="95,53 95,67 104,60" fill="#006FEF" />
    <polygon points="18,60 30,55 27,68" fill="#006FEF" />
    <polygon points="60,18 54,28 66,28" fill="#006FEF" />
    {/* Center icon */}
    <circle cx="60" cy="60" r="14" fill="#006FEF20" stroke="#006FEF" strokeWidth="2" />
    <path d="M54 60 L58 64 L67 55" stroke="#006FEF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RecycleSvg = () => (
  <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
    {/* Classic recycle symbol — 3 arrows */}
    <motion.g animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} style={{ originX: '50%', originY: '50%' }}>
      {/* Arrow 1 */}
      <path d="M60 20 L72 42 L48 42 Z" fill="#00D4AA" opacity="0.85" />
      <path d="M60 20 Q60 18 62 18 L84 55 Q86 58 84 60 L76 60" stroke="#00D4AA" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* Arrow 2 */}
      <path d="M84 65 L72 88 Q70 91 67 91 L43 91" stroke="#00D4AA" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M38 91 L50 80 L38 69 Z" fill="#00D4AA" opacity="0.85" />
      {/* Arrow 3 */}
      <path d="M36 60 L24 60 Q22 60 22 57 L42 22 Q44 19 47 20" stroke="#00D4AA" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M60 95 L72 84 L60 73 Z" fill="#00D4AA" opacity="0.85" />
    </motion.g>
    {/* Center circle */}
    <circle cx="60" cy="60" r="12" fill="#00D4AA" opacity="0.2" />
    <circle cx="60" cy="60" r="6" fill="#00D4AA" opacity="0.6" />
  </svg>
);

const rsData: R[] = [
  {
    number: '01',
    name: 'Re-Think',
    tagline: 'Question Everything Before You Consume',
    color: '#8B5CF6',
    colorLight: '#8B5CF620',
    desc1: 'Re-Thinking sits at the very top of the waste hierarchy — it\'s the mental shift that makes everything else possible. Before buying, using, or discarding anything, we must ask whether our current consumption patterns are truly necessary or simply habitual.',
    desc2: 'A Re-Think mindset challenges the "buy new" reflex by exploring alternatives: borrowing, renting, sharing, or simply going without. It involves understanding the full lifecycle of products and making conscious choices that align with sustainable values before waste is even created.',
    tips: [
      'Ask "Do I really need this?" before every purchase',
      'Consider borrowing or renting instead of buying',
      'Research the environmental footprint of products',
      'Buy second-hand before buying new',
    ],
    examples: [
      { emoji: '📚', title: 'Library Instead of Buying', desc: 'Borrow books, tools, and media from public libraries — saving money and raw materials.' },
      { emoji: '🔨', title: 'Tool Rental Services', desc: 'Rent power tools for one-off projects rather than buying items that sit unused.' },
      { emoji: '🤝', title: 'Neighbor Sharing Networks', desc: 'Community sharing apps and neighbor networks provide access without ownership.' },
    ],
    Icon: Lightbulb,
    SvgIcon: RethinkSvg,
  },
  {
    number: '02',
    name: 'Refuse',
    tagline: 'Say No to What You Don\'t Need',
    color: '#EF4444',
    colorLight: '#EF444420',
    desc1: 'Refusing is the most powerful waste prevention strategy — waste that is never created cannot pollute. Every time we say no to single-use plastics, unnecessary freebies, or heavily packaged products, we send a market signal that changes what manufacturers produce.',
    desc2: 'Refusing requires social confidence and intention. It means politely declining plastic bags, straws, and cutlery; avoiding promotional items destined for the bin; and choosing vendors who respect minimal packaging. Your refusal is a vote for a cleaner supply chain.',
    tips: [
      'Carry and always use reusable bags',
      'Decline single-use cutlery and straws',
      'Avoid over-packaged and impulse-buy products',
      'Say no to promotional freebies you don\'t need',
    ],
    examples: [
      { emoji: '🛍️', title: 'Reusable Bag Habit', desc: 'Keep a foldable bag in your pocket — refusing plastic bags at checkout becomes effortless.' },
      { emoji: '☕', title: 'Bring Your Own Cup', desc: 'A personal travel mug eliminates single-use coffee cups — typically lined with non-recyclable plastic.' },
      { emoji: '✋', title: 'Refuse Promo Items', desc: 'Politely decline branded pens, cheap gadgets, and trade show giveaways bound for landfill.' },
    ],
    Icon: Ban,
    SvgIcon: RefuseSvg,
  },
  {
    number: '03',
    name: 'Reduce',
    tagline: 'Less Is Genuinely More',
    color: '#00C47D',
    colorLight: '#00C47D20',
    desc1: 'Reducing tackles waste at the source by cutting consumption and choosing products that generate less waste throughout their lifecycle. It\'s about quality over quantity, intentionality over abundance, and measuring value by utility — not volume.',
    desc2: 'Modern reducing strategies include meal planning to cut food waste (responsible for 8% of global emissions), going paperless across all workflows, choosing concentrated cleaning products, and buying durable goods designed to last decades rather than disposables.',
    tips: [
      'Plan meals weekly to eliminate food waste',
      'Go fully paperless with digital documents',
      'Choose concentrated products over diluted versions',
      'Buy quality once instead of cheap repeatedly',
    ],
    examples: [
      { emoji: '🥗', title: 'Meal Planning Apps', desc: 'Apps like Mealime help plan exact portions — reducing food waste by up to 33% per household.' },
      { emoji: '💻', title: 'Digital Document Workflows', desc: 'Cloud-based office tools eliminate printing — saving paper, ink cartridges, and energy.' },
      { emoji: '🧴', title: 'Concentrated Products', desc: 'Concentrated detergents use 5× less packaging per wash — a simple switch with big impact.' },
    ],
    Icon: Minimize2,
    SvgIcon: ReduceSvg,
  },
  {
    number: '04',
    name: 'Reuse',
    tagline: 'Give Every Item a Second Life',
    color: '#006FEF',
    colorLight: '#006FEF20',
    desc1: 'Reusing extends the life of products and materials, keeping them in circulation and out of landfills. It embodies the circular economy in everyday life — the same jar holds pasta this week and stores spices next month.',
    desc2: 'Reuse culture is growing fast: repair cafés, clothing swaps, furniture upcycling, and refillable packaging systems are all making reuse mainstream. Each reuse cycle saves the energy, water, and raw materials that would be needed to manufacture a replacement.',
    tips: [
      'Repair items before considering replacement',
      'Use glass jars and containers multiple times',
      'Donate clothes, furniture, and electronics',
      'Repurpose creatively — old fabric becomes cleaning rags',
    ],
    examples: [
      { emoji: '🫙', title: 'Glass Jar Storage', desc: 'Repurpose pasta sauce jars as food storage, vases, or drinking glasses — zero new manufacturing.' },
      { emoji: '👕', title: 'Old Clothes as Cleaning Rags', desc: 'Cut worn-out T-shirts into cleaning cloths — replacing paper towels indefinitely.' },
      { emoji: '🪑', title: 'Furniture Upcycling', desc: 'Paint, sand, and restore old furniture instead of discarding — turning worn pieces into statement items.' },
    ],
    Icon: RefreshCw,
    SvgIcon: ReuseSvg,
  },
  {
    number: '05',
    name: 'Recycle',
    tagline: 'Close the Loop on Materials',
    color: '#00D4AA',
    colorLight: '#00D4AA20',
    desc1: 'Recycling transforms used materials into new raw materials, reducing the need for virgin resource extraction. It sits at the end of the waste hierarchy — the last resort before disposal — but remains essential for materials that can\'t be refused, reduced, or reused.',
    desc2: 'Effective recycling requires clean, separated materials. Contamination is the #1 killer of recycling programs — a single greasy pizza box can ruin an entire batch of paper. Knowing your local recycling rules, cleaning containers, and supporting products made from recycled content completes the loop.',
    tips: [
      'Know your local recycling rules — they vary by region',
      'Clean and dry containers before placing in the bin',
      'Separate materials: paper, glass, metal, plastic',
      'Buy products with recycled content to close the loop',
    ],
    examples: [
      { emoji: '📰', title: 'Paper Recycling', desc: 'Recycling one tonne of paper saves 17 trees, 7,000 gallons of water, and 4,000 kWh of energy.' },
      { emoji: '🥫', title: 'Aluminum Cans', desc: 'Aluminum can be recycled infinitely. Recycling uses 95% less energy than producing from raw bauxite.' },
      { emoji: '♻️', title: 'PET Bottle Loop', desc: 'PET plastic bottles become polyester fabric, new bottles, or carpet — if collected and cleaned properly.' },
    ],
    Icon: Recycle,
    SvgIcon: RecycleSvg,
  },
];

/* ═══════════════════════ SECTION COMPONENT ═══════════════════════ */
function RSection({ r, index }: { r: R; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const isEven = index % 2 === 0;

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden py-24"
      style={{ background: index % 2 === 0 ? '#050d1a' : '#0a1628' }}>

      {/* Animated background orb */}
      <motion.div style={{ y: bgY }}
        className="absolute w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${r.color}18, transparent 65%)`,
          top: '50%', left: isEven ? '-20%' : '70%',
          transform: 'translateY(-50%)',
          filter: 'blur(60px)',
          y: bgY,
        }} />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: `linear-gradient(${r.color} 1px, transparent 1px), linear-gradient(90deg, ${r.color} 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      <div className="container-xl relative z-10">
        <div className={`grid lg:grid-cols-2 gap-16 xl:gap-24 items-center ${isEven ? '' : 'direction-rtl'}`}>

          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: isEven ? -60 : 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className={isEven ? '' : 'lg:order-2'}>

            {/* Number + Label */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-black text-8xl leading-none select-none"
                style={{ color: r.color, opacity: 0.15, fontFamily: 'Outfit, sans-serif', letterSpacing: '-4px' }}>
                {r.number}
              </span>
              <div className="label-tag" style={{ background: `${r.color}15`, color: r.color, border: `1px solid ${r.color}35` }}>
                {r.name}
              </div>
            </div>

            <h2 className="heading-xl text-white mb-3">{r.name}</h2>
            <p className="text-lg font-semibold mb-6" style={{ color: r.color }}>{r.tagline}</p>

            <p className="text-white/65 leading-relaxed mb-4 text-base">{r.desc1}</p>
            <p className="text-white/55 leading-relaxed mb-8 text-base">{r.desc2}</p>

            {/* Tips */}
            <div className="space-y-3 mb-10">
              {r.tips.map((tip, ti) => (
                <motion.div key={ti}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + ti * 0.08 }}
                  className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${r.color}25` }}>
                    <CheckCircle className="w-4 h-4" style={{ color: r.color }} />
                  </div>
                  <span className="text-white/70 text-sm leading-relaxed">{tip}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: SVG + Examples */}
          <motion.div
            initial={{ opacity: 0, x: isEven ? 60 : -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className={`space-y-8 ${isEven ? '' : 'lg:order-1'}`}>

            {/* Animated SVG icon */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-40 h-40 mx-auto relative">
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full"
                style={{ background: `radial-gradient(circle, ${r.color}40, transparent 70%)`, filter: 'blur(20px)' }} />
              <div className="relative w-full h-full rounded-3xl flex items-center justify-center p-6"
                style={{ background: r.colorLight, border: `2px solid ${r.color}40`, backdropFilter: 'blur(10px)' }}>
                <r.SvgIcon />
              </div>
            </motion.div>

            {/* Example cards */}
            <div className="space-y-4">
              <h4 className="text-white/50 text-xs uppercase tracking-widest font-semibold">Real-World Examples</h4>
              {r.examples.map((ex, ei) => (
                <motion.div key={ei}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + ei * 0.1 }}
                  whileHover={{ x: 6, scale: 1.01 }}
                  className="flex items-start gap-4 p-4 rounded-2xl cursor-default"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${r.color}25`, backdropFilter: 'blur(8px)' }}>
                  <span className="text-2xl flex-shrink-0 mt-0.5">{ex.emoji}</span>
                  <div>
                    <h5 className="font-bold text-white text-sm mb-1">{ex.title}</h5>
                    <p className="text-white/50 text-xs leading-relaxed">{ex.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0 mt-1" style={{ color: r.color }} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll arrow between sections (not last) */}
      {index < rsData.length - 1 && (
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ArrowDown className="w-6 h-6" style={{ color: r.color }} />
        </motion.div>
      )}
    </section>
  );
}

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */
export default function FiveRsPage() {
  const [activeR, setActiveR] = useState<number | null>(null);

  return (
    <main>
      {/* ─── HERO ─── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #050d1a 0%, #0a1628 60%, #021a0e 100%)' }}>
        <div className="orb orb-green w-[500px] h-[500px] -top-32 -left-32 opacity-30" />
        <div className="orb orb-blue w-[400px] h-[400px] -bottom-32 right-0 opacity-25" />

        <div className="relative z-10 text-center container-lg">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
            className="label-tag mx-auto mb-6 w-fit">
            <Recycle className="w-4 h-4" /> Waste Hierarchy
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="heading-hero text-white mb-6">
            The <span className="gradient-text">5 R's</span> of<br />Waste Management
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25 }}
            className="text-white/65 text-body-lg max-w-2xl mx-auto mb-12">
            From questioning consumption to closing the material loop — five principles that guide a zero-waste lifestyle, 
            ordered from most to least impactful.
          </motion.p>

          {/* R pills nav */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-3 justify-center">
            {rsData.map((r, i) => (
              <motion.a key={i} href={`#r-${i}`}
                whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 rounded-full text-sm font-bold cursor-pointer transition-all"
                style={{ background: `${r.color}20`, color: r.color, border: `1px solid ${r.color}40` }}>
                {r.number} {r.name}
              </motion.a>
            ))}
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: 'linear-gradient(to bottom, transparent, #050d1a)' }} />
      </section>

      {/* ─── HIERARCHY VISUAL ─── */}
      <section className="py-20" style={{ background: '#050d1a' }}>
        <div className="container-lg">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="text-center mb-12">
            <h2 className="heading-lg text-white mb-3">The Waste Hierarchy</h2>
            <p className="text-white/50 text-base">Most to least impactful — always act as high up the pyramid as possible</p>
          </motion.div>

          {/* Pyramid */}
          <div className="max-w-lg mx-auto space-y-2">
            {rsData.map((r, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scaleX: 0 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.03, x: 8 }}
                className="flex items-center gap-4 px-6 py-3 rounded-xl cursor-pointer"
                style={{
                  background: `${r.color}18`,
                  border: `1px solid ${r.color}35`,
                  marginLeft: `${i * 20}px`,
                  marginRight: `${i * 20}px`,
                }}>
                <r.Icon className="w-5 h-5 flex-shrink-0" style={{ color: r.color }} />
                <span className="font-bold text-white text-sm">{r.name}</span>
                <span className="text-white/40 text-xs ml-auto">{r.tagline}</span>
                <span className="text-xs font-black" style={{ color: r.color }}>{r.number}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── R SECTIONS ─── */}
      {rsData.map((r, i) => (
        <div key={i} id={`r-${i}`}>
          <RSection r={r} index={i} />
        </div>
      ))}

      {/* ─── CLOSING CTA ─── */}
      <section className="section-padding" style={{ background: 'linear-gradient(135deg, #050d1a, #0a2015)' }}>
        <div className="container-lg text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="text-6xl mb-6">🌍</div>
            <h2 className="heading-xl text-white mb-4">Every Action <span className="gradient-text">Matters</span></h2>
            <p className="text-white/60 text-body-lg max-w-2xl mx-auto mb-10">
              The 5 R's aren't rules to follow — they're a way of seeing the world. Start with one small change this week and build from there.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/recycling-process" className="btn-crystal btn-crystal-primary">
                <Recycle className="w-5 h-5" /> Learn the Recycling Process
              </Link>
              <Link href="/waste-categories" className="btn-crystal btn-crystal-glass text-white border-white/20">
                Explore Waste Categories
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
