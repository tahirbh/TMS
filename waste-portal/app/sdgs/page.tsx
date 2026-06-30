'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  Droplets,
  Building2,
  Recycle,
  Thermometer,
  Waves,
  Trees,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Target,
  Globe,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

/* ─── Types ─── */
interface SDGGoal {
  number: number;
  emoji: string;
  icon: React.ReactNode;
  title: string;
  shortTitle: string;
  color: string;
  colorDark: string;
  colorLight: string;
  textColor: string;
  progress: number;
  connection: string;
  targets: { code: string; text: string }[];
  actions: string[];
  wasteLink: string;
  stat: { value: string; label: string };
}

/* ─── Data ─── */
const sdgGoals: SDGGoal[] = [
  {
    number: 6,
    emoji: '💧',
    icon: <Droplets className="w-8 h-8" />,
    title: 'Clean Water and Sanitation',
    shortTitle: 'Clean Water',
    color: '#009DDB',
    colorDark: '#006FA0',
    colorLight: 'rgba(0,157,219,0.1)',
    textColor: '#005F85',
    progress: 67,
    connection:
      'Proper waste management is inseparable from water quality. Leachate from landfills, industrial effluents, and improperly disposed chemicals are among the leading sources of groundwater contamination. Our leachate treatment plants and closed-loop systems prevent pollutants from reaching aquifers and surface waters, directly contributing to universal access to safe water.',
    targets: [
      { code: '6.3', text: 'Halve the proportion of untreated wastewater by 2030 through advanced treatment systems.' },
      { code: '6.4', text: 'Substantially increase water-use efficiency across all sectors and ensure sustainable freshwater withdrawals.' },
      { code: '6.6', text: 'Protect and restore water-related ecosystems, including wetlands, rivers, and groundwater systems.' },
    ],
    actions: [
      'Advanced leachate multi-stage treatment to drinking water standards',
      'Zero industrial wastewater discharge to natural water bodies',
      'Groundwater monitoring network around all landfill sites',
      'Recycled process water for facility operations (60% reuse)',
      'Public awareness programs on household chemical disposal',
    ],
    wasteLink: 'Leachate treatment removes 99.9% of contaminants before discharge',
    stat: { value: '1M L', label: 'Treated daily' },
  },
  {
    number: 11,
    emoji: '🏙️',
    icon: <Building2 className="w-8 h-8" />,
    title: 'Sustainable Cities and Communities',
    shortTitle: 'Sustainable Cities',
    color: '#FD9D24',
    colorDark: '#CC7B00',
    colorLight: 'rgba(253,157,36,0.1)',
    textColor: '#994200',
    progress: 55,
    connection:
      'Rapid urbanization creates enormous waste management challenges. By 2050, two-thirds of the world will live in cities. Our integrated municipal solid waste systems — from door-to-door collection and smart bins to material recovery facilities and waste-to-energy plants — help cities achieve clean, healthy, and resilient urban environments for all residents.',
    targets: [
      { code: '11.6', text: 'Reduce the adverse per capita environmental impact of cities, including paying special attention to air quality and municipal waste management.' },
      { code: '11.3', text: 'Enhance inclusive and sustainable urbanization and capacity for participatory, integrated human settlement planning.' },
      { code: '11.B', text: 'Substantially increase the number of cities adopting integrated policies toward resource efficiency and climate resilience.' },
    ],
    actions: [
      'Smart waste collection routes reducing fuel use by 30%',
      'Waste-to-energy plants providing clean electricity to 20,000+ homes',
      'Zero-waste neighborhood pilot programs in 3 cities',
      'Public recycling infrastructure: 500+ smart bins city-wide',
      'Composting programs converting food waste to urban green spaces',
    ],
    wasteLink: 'Waste-to-energy generates 20 MW — powering sustainable city infrastructure',
    stat: { value: '500+', label: 'Smart bins deployed' },
  },
  {
    number: 12,
    emoji: '♻️',
    icon: <Recycle className="w-8 h-8" />,
    title: 'Responsible Consumption and Production',
    shortTitle: 'Responsible Consumption',
    color: '#BF8B2E',
    colorDark: '#8A6120',
    colorLight: 'rgba(191,139,46,0.1)',
    textColor: '#7A4F00',
    progress: 48,
    connection:
      'SDG 12 is the cornerstone of our circular economy approach. Waste management systems that maximize material recovery, support extended producer responsibility, and enable the transition from linear to circular resource flows are essential to sustainable consumption. Our Material Recovery Facility recovers 90% of materials from mixed waste, turning end-of-life products into valuable secondary raw materials.',
    targets: [
      { code: '12.2', text: 'Achieve sustainable management and efficient use of natural resources by 2030.' },
      { code: '12.4', text: 'Achieve environmentally sound management of chemicals and all wastes throughout their life cycle.' },
      { code: '12.5', text: 'Substantially reduce waste generation through prevention, reduction, recycling, and reuse.' },
    ],
    actions: [
      'MRF recovers 90% of recyclables from mixed waste streams',
      'E-waste facility extracts 35 kg of gold per ton of CPUs',
      'Extended Producer Responsibility (EPR) program with 200+ brands',
      'Compost production: 50,000 tons of premium soil amendment/year',
      'Public eco-education reaching 100,000+ citizens annually',
    ],
    wasteLink: 'MRF recovers 450 tons/day of secondary materials, closing the production loop',
    stat: { value: '90%', label: 'Material recovery rate' },
  },
  {
    number: 13,
    emoji: '🌡️',
    icon: <Thermometer className="w-8 h-8" />,
    title: 'Climate Action',
    shortTitle: 'Climate Action',
    color: '#3F7E44',
    colorDark: '#2D5C31',
    colorLight: 'rgba(63,126,68,0.1)',
    textColor: '#1E4021',
    progress: 42,
    connection:
      'The waste sector contributes approximately 5% of global greenhouse gas emissions, primarily through methane from landfills. Our landfill gas capture, waste-to-energy conversion, and organic waste composting programs directly reduce GHG emissions. Every ton of waste diverted from landfill prevents methane release, while recovered materials reduce the need for energy-intensive primary production.',
    targets: [
      { code: '13.1', text: 'Strengthen resilience and adaptive capacity to climate-related hazards in all countries.' },
      { code: '13.2', text: 'Integrate climate change measures into national policies, strategies and planning.' },
      { code: '13.3', text: 'Improve education and awareness on climate change mitigation and adaptation.' },
    ],
    actions: [
      'Landfill methane capture reduces emissions by 85,000 tons CO₂e/yr',
      'Waste-to-energy displaces 60,000 MWh of fossil fuel electricity',
      'Electric vehicle fleet for waste collection (zero tailpipe emissions)',
      'Solar panels on all facility rooftops (2 MW installed capacity)',
      'Annual climate impact report and carbon footprint disclosure',
    ],
    wasteLink: 'Methane capture + WtE avoids 145,000 tons CO₂e annually',
    stat: { value: '145K', label: 'Tons CO₂e avoided/yr' },
  },
  {
    number: 14,
    emoji: '🌊',
    icon: <Waves className="w-8 h-8" />,
    title: 'Life Below Water',
    shortTitle: 'Life Below Water',
    color: '#0A97D9',
    colorDark: '#006FA0',
    colorLight: 'rgba(10,151,217,0.1)',
    textColor: '#004D75',
    progress: 38,
    connection:
      'Marine plastic pollution is one of the defining environmental crises of our time, with 8 million tons of plastic entering oceans annually. By achieving high plastic recovery rates, running coastal cleanup programs, and ensuring zero illegal dumping near waterways, our waste management systems act as a crucial barrier protecting marine ecosystems in the Red Sea and Arabian Gulf.',
    targets: [
      { code: '14.1', text: 'Prevent and significantly reduce marine pollution of all kinds, in particular from land-based activities including marine debris.' },
      { code: '14.2', text: 'Sustainably manage and protect marine and coastal ecosystems to avoid significant adverse impacts.' },
      { code: '14.3', text: 'Minimize and address the impacts of ocean acidification, including through enhanced scientific cooperation.' },
    ],
    actions: [
      'Zero plastic to landfill program recovers 98% of plastic waste',
      'Annual Red Sea coastal cleanup collecting 500+ tons of debris',
      'Marine debris monitoring at 15 coastal collection points',
      'Microplastics filtration in leachate treatment to < 1 particle/L',
      'Partnership with NEOM on plastic-free coastal city standards',
    ],
    wasteLink: 'Intercepting 98% of plastics prevents them from reaching the Red Sea & Arabian Gulf',
    stat: { value: '98%', label: 'Plastic recovery rate' },
  },
  {
    number: 15,
    emoji: '🌿',
    icon: <Trees className="w-8 h-8" />,
    title: 'Life on Land',
    shortTitle: 'Life on Land',
    color: '#56C02B',
    colorDark: '#3A8A1A',
    colorLight: 'rgba(86,192,43,0.1)',
    textColor: '#2A6010',
    progress: 45,
    connection:
      'Soil contamination, illegal dumping, and hazardous waste mismanagement devastate terrestrial biodiversity. Our composting plant produces 50,000 tons of premium soil amendment annually, rehabilitating degraded lands. Phytoremediation programs restore contaminated sites, while our zero-illegal-dumping enforcement protects natural habitats across Saudi Arabia.',
    targets: [
      { code: '15.1', text: 'Ensure conservation, restoration and sustainable use of terrestrial and inland freshwater ecosystems.' },
      { code: '15.3', text: 'Combat desertification, restore degraded land and soil, including land affected by contaminated waste sites.' },
      { code: '15.5', text: 'Take urgent and significant action to reduce the degradation of natural habitats and halt the loss of biodiversity.' },
    ],
    actions: [
      '50,000 tons/yr of compost rehabilitates degraded desert soils',
      'Phytoremediation restoring 1,200 hectares of contaminated land',
      'Sanitary landfill closure & greening program: 8 closed sites',
      'Illegal dumping hotline and rapid response cleanup teams',
      'Hazardous waste containment protecting 25 sensitive ecosystems',
    ],
    wasteLink: 'Compost output enriches 10,000+ hectares of Saudi agricultural and rehabilitated land',
    stat: { value: '50K', label: 'Tons compost/yr' },
  },
];

/* ─── Animated Progress Bar ─── */
function ProgressBar({ value, color, label }: { value: number; color: string; label: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => setDisplayed(value), 300);
      return () => clearTimeout(timer);
    }
  }, [inView, value]);

  return (
    <div ref={ref} className="mb-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-sm font-bold"
          style={{ color }}
        >
          {displayed}%
        </motion.span>
      </div>
      <div
        className="h-2.5 rounded-full overflow-hidden"
        style={{ background: `${color}20` }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${value}%` } : {}}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="h-full rounded-full relative"
          style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
        >
          {/* Shimmer */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
              animation: 'progress-shimmer 2s ease infinite',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

/* ─── SDG Section ─── */
function SDGSection({ goal, index }: { goal: SDGGoal; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const isEven = index % 2 === 0;

  return (
    <section
      ref={ref}
      className="section-padding relative overflow-hidden"
      style={{
        background:
          index % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)',
      }}
    >
      {/* Subtle background blob */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ background: `radial-gradient(ellipse at ${isEven ? '80%' : '20%'} 50%, ${goal.color}, transparent 60%)` }}
      />

      <div className="container-xl relative z-10">
        <div
          className={`grid lg:grid-cols-2 gap-16 items-center ${!isEven ? 'direction-rtl' : ''}`}
          style={{ direction: !isEven ? 'rtl' : 'ltr' }}
        >
          {/* ── Visual Side ── */}
          <motion.div
            initial={{ opacity: 0, x: isEven ? -50 : 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            style={{ direction: 'ltr' }}
          >
            {/* SDG Badge */}
            <motion.div
              whileHover={{ scale: 1.04, rotate: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative inline-block mb-8"
            >
              <div
                className="w-36 h-36 rounded-3xl flex flex-col items-center justify-center shadow-2xl relative overflow-hidden"
                style={{ background: goal.color }}
              >
                {/* Inner pattern */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), transparent 50%)',
                  }}
                />
                <span className="text-5xl mb-1 relative z-10">{goal.emoji}</span>
                <span className="text-white text-xs font-bold relative z-10 opacity-90">
                  SDG {goal.number}
                </span>
              </div>

              {/* Glow ring */}
              <div
                className="absolute inset-0 rounded-3xl opacity-30 blur-xl -z-10"
                style={{ background: goal.color, transform: 'scale(1.2)' }}
              />
            </motion.div>

            {/* Goal number & title */}
            <div className="mb-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="label-tag mb-4"
                style={{
                  background: `${goal.color}15`,
                  borderColor: `${goal.color}40`,
                  color: goal.color,
                }}
              >
                Goal {goal.number}
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="heading-lg mb-4"
              >
                {goal.title}
              </motion.h2>
            </div>

            {/* Progress */}
            <div
              className="crystal-card p-6 mb-6 relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                    Global Achievement Progress
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Towards 2030 target
                  </p>
                </div>
                <div className="text-right">
                  <div className="stat-number text-4xl">{goal.progress}%</div>
                  <p className="text-xs" style={{ color: goal.color }}>achieved</p>
                </div>
              </div>
              <ProgressBar value={goal.progress} color={goal.color} label="Global progress" />

              {/* Stat badge */}
              <div
                className="mt-4 flex items-center gap-3 p-3 rounded-xl"
                style={{ background: `${goal.color}10`, border: `1px solid ${goal.color}25` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: goal.color }}
                >
                  {goal.stat.value}
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {goal.stat.label}
                </p>
              </div>
            </div>

            {/* Waste link callout */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-start gap-3 p-4 rounded-2xl"
              style={{ background: `${goal.color}10`, border: `1px solid ${goal.color}25` }}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: goal.color }}
              >
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-sm font-medium" style={{ color: goal.textColor }}>
                {goal.wasteLink}
              </p>
            </motion.div>
          </motion.div>

          {/* ── Content Side ── */}
          <motion.div
            initial={{ opacity: 0, x: isEven ? 50 : -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            style={{ direction: 'ltr' }}
          >
            {/* Connection paragraph */}
            <div className="mb-8">
              <h3 className="heading-md mb-4 flex items-center gap-3">
                <Globe className="w-6 h-6" style={{ color: goal.color }} />
                How Waste Management Connects
              </h3>
              <p className="text-body-lg leading-relaxed">
                {goal.connection}
              </p>
            </div>

            {/* Targets */}
            <div className="mb-8">
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Target className="w-4 h-4" /> Specific Targets
              </h4>
              <div className="space-y-3">
                {goal.targets.map((target, ti) => (
                  <motion.div
                    key={target.code}
                    initial={{ opacity: 0, x: 20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + ti * 0.1 }}
                    className="flex items-start gap-4 glass-card p-4 hover:shadow-lg transition-all duration-300"
                    style={{ borderLeft: `3px solid ${goal.color}` }}
                  >
                    <span
                      className="text-xs font-bold px-2.5 py-1.5 rounded-lg flex-shrink-0 mt-0.5"
                      style={{ background: `${goal.color}20`, color: goal.color }}
                    >
                      {target.code}
                    </span>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {target.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <TrendingUp className="w-4 h-4" /> Our Key Actions
              </h4>
              <div className="space-y-2">
                {goal.actions.map((action, ai) => (
                  <motion.div
                    key={action}
                    initial={{ opacity: 0, x: 20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + ai * 0.07 }}
                    className="flex items-start gap-3 group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${goal.color}20` }}
                    >
                      <ChevronRight className="w-3 h-3" style={{ color: goal.color }} />
                    </motion.div>
                    <span
                      className="text-sm leading-relaxed group-hover:text-opacity-100 transition-all"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {action}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Goals Overview Grid ─── */
function GoalsOverview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      className="section-padding relative overflow-hidden"
      style={{ background: 'var(--bg-secondary)' }}
      ref={ref}
    >
      <div className="orb orb-green absolute left-0 top-0 w-96 h-96 opacity-15" />
      <div className="orb orb-blue absolute right-0 bottom-0 w-96 h-96 opacity-10" />

      <div className="container-xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="label-tag mb-4">
            🌐 All Goals at a Glance
          </span>
          <h2 className="heading-xl gradient-text mt-4 mb-4">SDG Progress Overview</h2>
          <p className="text-body-lg max-w-2xl mx-auto">
            Tracking our contribution towards each Sustainable Development Goal.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {sdgGoals.map((goal, i) => (
            <motion.div
              key={goal.number}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -8, scale: 1.05 }}
              className="cursor-pointer"
            >
              <a href={`#sdg-${goal.number}`} className="block">
                <div
                  className="rounded-2xl p-5 text-center relative overflow-hidden"
                  style={{ background: goal.color }}
                >
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), transparent 60%)',
                    }}
                  />
                  <div className="text-4xl mb-2 relative z-10">{goal.emoji}</div>
                  <div className="text-white text-xs font-bold relative z-10 opacity-90">
                    SDG {goal.number}
                  </div>
                  <div className="text-white text-xs relative z-10 opacity-70 mt-1 leading-tight">
                    {goal.shortTitle}
                  </div>
                </div>
                {/* Progress */}
                <div className="mt-3 px-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                    <span className="font-bold" style={{ color: goal.color }}>{goal.progress}%</span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: `${goal.color}20` }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${goal.progress}%` } : {}}
                      transition={{ duration: 1.2, delay: 0.3 + i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: goal.color }}
                    />
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>

        {/* Summary stat bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="crystal-card p-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '6', label: 'SDGs Addressed', icon: '🎯' },
              { value: '18', label: 'Specific Targets', icon: '📋' },
              { value: '30', label: 'Active Initiatives', icon: '⚡' },
              { value: '52%', label: 'Avg. Global Progress', icon: '📈' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="stat-number text-2xl mb-1">{s.value}</div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── CTA Section ─── */
function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      className="section-padding relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #050d1a 0%, #0a1628 60%, #061a08 100%)' }}
      ref={ref}
    >
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,196,125,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,196,125,0.6) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* SDG color gradient orbs */}
      {sdgGoals.map((goal, i) => (
        <div
          key={goal.number}
          className="absolute rounded-full blur-3xl opacity-[0.08]"
          style={{
            width: 200,
            height: 200,
            background: goal.color,
            left: `${(i / sdgGoals.length) * 100}%`,
            top: i % 2 === 0 ? '10%' : '60%',
            transform: 'translateX(-50%)',
          }}
        />
      ))}

      <div className="container-lg relative z-10 text-center" ref={ref}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* SDG emoji row */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex justify-center gap-4 mb-10 flex-wrap"
          >
            {sdgGoals.map((g, i) => (
              <motion.div
                key={g.number}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                style={{ background: g.color }}
              >
                {g.emoji}
              </motion.div>
            ))}
          </motion.div>

          <h2 className="heading-xl text-white mb-6">
            Together Towards{' '}
            <span className="gradient-text">2030</span>
          </h2>
          <p className="text-body-lg text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            The 2030 Agenda for Sustainable Development cannot succeed without transforming how
            we produce, consume, and dispose of waste. Join us in building a sustainable future.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <motion.a
              href="https://sdgs.un.org"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="btn-crystal btn-crystal-primary text-base px-8 py-4"
            >
              🌐 Learn More About SDGs
              <ExternalLink className="w-4 h-4 ml-2" />
            </motion.a>
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="btn-crystal btn-crystal-outline text-base px-8 py-4"
            >
              Partner With Us
              <ArrowRight className="w-4 h-4 ml-2" />
            </motion.a>
          </div>

          {/* UN SDGs badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 flex items-center justify-center gap-4"
          >
            <div
              className="flex items-center gap-3 px-6 py-3 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span className="text-2xl">🇺🇳</span>
              <span className="text-sm text-gray-300 font-medium">
                Aligned with the UN 2030 Agenda for Sustainable Development
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Main Page ─── */
export default function SDGsPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* ── HERO ── */}
      <section
        className="hero-section relative"
        style={{
          minHeight: '80vh',
          background: 'linear-gradient(135deg, #060d1a 0%, #0a1628 40%, #061a10 100%)',
        }}
      >
        {/* Color gradient layers for SDG feel */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 20% 50%, rgba(0,157,219,0.12), transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(86,192,43,0.10), transparent 50%)',
          }}
        />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Floating SDG emojis */}
        {sdgGoals.map((goal, i) => (
          <motion.div
            key={goal.number}
            className="absolute text-4xl opacity-20 pointer-events-none"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
          >
            {goal.emoji}
          </motion.div>
        ))}

        <div className="container-xl relative z-10 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-6 flex justify-center"
          >
            <span className="label-tag" style={{ background: 'rgba(86,192,43,0.1)', borderColor: 'rgba(86,192,43,0.3)', color: '#56C02B' }}>
              🌍 2030 Agenda
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="heading-hero text-white mb-6 mx-auto max-w-5xl leading-tight"
          >
            Sustainable Development{' '}
            <span className="gradient-text text-glow-green">Goals</span>
            {' '}&{' '}
            <span style={{ color: '#009DDB' }}>Waste Management</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-body-lg text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Waste management is not just sanitation — it is a cornerstone of sustainable
            development. Discover how our facilities and programs directly advance six of the
            United Nations&apos; 17 Sustainable Development Goals on the path to 2030.
          </motion.p>

          {/* SDG badge row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {sdgGoals.map((goal, i) => (
              <motion.a
                key={goal.number}
                href={`#sdg-${goal.number}`}
                whileHover={{ scale: 1.12, y: -5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.07 }}
                className="sdg-icon text-3xl"
                style={{ background: goal.color, width: 72, height: 72, fontSize: '2rem' }}
                title={`SDG ${goal.number}: ${goal.title}`}
              >
                {goal.emoji}
              </motion.a>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <a href="#overview" className="btn-crystal btn-crystal-primary">
              Explore Our Impact <ChevronRight className="w-4 h-4" />
            </a>
            <a
              href="https://sdgs.un.org"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-crystal btn-crystal-glass text-white"
            >
              UN SDGs Website <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40"
        >
          <span className="text-white text-xs">Scroll to explore</span>
          <div className="w-0.5 h-8 rounded-full" style={{ background: 'var(--green-primary)' }} />
        </motion.div>
      </section>

      {/* ── INTRO + OVERVIEW GRID ── */}
      <section className="section-padding" id="overview">
        <div className="container-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="crystal-card p-10 md:p-14 text-center relative overflow-hidden mb-6"
          >
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{ background: 'var(--gradient-brand)' }}
            />
            <div className="text-5xl mb-6">🌐</div>
            <h2 className="heading-lg gradient-text mb-6">
              Waste Management & the 2030 Agenda
            </h2>
            <p className="text-body-lg max-w-3xl mx-auto leading-relaxed mb-6">
              The United Nations&apos; 2030 Agenda encompasses 17 Sustainable Development Goals
              with 169 specific targets. Waste management systems are uniquely positioned at
              the intersection of environmental protection, public health, economic development,
              and social equity — making them powerful levers for SDG achievement.
            </p>
            <p className="text-body-lg max-w-3xl mx-auto leading-relaxed">
              Our integrated facilities directly advance{' '}
              <strong style={{ color: 'var(--green-primary)' }}>6 of the 17 SDGs</strong> —
              from ensuring clean water and building sustainable cities, to driving climate
              action and protecting biodiversity on land and at sea.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── GOALS OVERVIEW ── */}
      <GoalsOverview />

      {/* ── INDIVIDUAL SDG SECTIONS ── */}
      {sdgGoals.map((goal, i) => (
        <div id={`sdg-${goal.number}`} key={goal.number}>
          <SDGSection goal={goal} index={i} />
        </div>
      ))}

      {/* ── CTA ── */}
      <CTASection />
    </main>
  );
}
