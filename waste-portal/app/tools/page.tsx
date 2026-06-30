'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Leaf,
  HelpCircle,
  Bot,
  Send,
  RotateCcw,
  Download,
  Share2,
  ChevronRight,
  CheckCircle,
  XCircle,
  Trophy,
  Zap,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & TYPES
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'waste', label: 'Waste Calculator', icon: Calculator },
  { id: 'carbon', label: 'Carbon Footprint', icon: Leaf },
  { id: 'quiz', label: 'Interactive Quiz', icon: HelpCircle },
  { id: 'ai', label: 'AI Assistant', icon: Bot },
];

const PIE_COLORS = ['#00C47D', '#006FEF', '#F59E0B', '#EF4444'];

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1 — WASTE CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────

function WasteCalculator() {
  const [householdSize, setHouseholdSize] = useState('2');
  const [foodWaste, setFoodWaste] = useState(3);
  const [recyclables, setRecyclables] = useState(2);
  const [nonRecyclable, setNonRecyclable] = useState(4);
  const [calculated, setCalculated] = useState(false);

  const multiplier = parseInt(householdSize);
  const totalFood = foodWaste * multiplier;
  const totalRecyclables = recyclables * multiplier;
  const totalNonRecyclable = nonRecyclable * multiplier;
  const totalWaste = totalFood + totalRecyclables + totalNonRecyclable;

  const pieData = [
    { name: 'Food Waste', value: totalFood },
    { name: 'Recyclables', value: totalRecyclables },
    { name: 'Non-Recyclable', value: totalNonRecyclable },
  ];

  const tips = [
    foodWaste > 3 && '🍎 Reduce food waste by meal planning and composting scraps.',
    recyclables > 3 && '♻️ Great recycling — make sure items are clean before placing in the bin.',
    nonRecyclable > 5 && '🚫 Try switching to reusable alternatives to cut landfill waste.',
    totalWaste > 15 && '🌍 Your household waste is above average — small changes make a big impact.',
    totalWaste <= 8 && '🌟 Excellent! Your household generates minimal waste. Keep it up!',
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="glass-card rounded-2xl p-7 space-y-6">
          <h3 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
            Tell us about your household
          </h3>

          {/* Household size */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Household Size
            </label>
            <select
              value={householdSize}
              onChange={(e) => setHouseholdSize(e.target.value)}
              className="input-crystal w-full px-4 py-3 rounded-xl text-sm font-medium"
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(0,196,125,0.3)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              {['1', '2', '3', '4', '5', '6+'].map((n) => (
                <option key={n} value={n === '6+' ? '6' : n}>
                  {n} {n === '1' ? 'person' : 'people'}
                </option>
              ))}
            </select>
          </div>

          {/* Sliders */}
          {[
            { label: 'Food waste per week (kg)', value: foodWaste, setter: setFoodWaste, color: '#00C47D', max: 15 },
            { label: 'Recyclables per week (kg)', value: recyclables, setter: setRecyclables, color: '#006FEF', max: 10 },
            { label: 'Non-recyclable per week (kg)', value: nonRecyclable, setter: setNonRecyclable, color: '#EF4444', max: 15 },
          ].map(({ label, value, setter, color, max }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span className="font-bold" style={{ color }}>{value} kg</span>
              </div>
              <input
                type="range"
                min={0}
                max={max}
                value={value}
                onChange={(e) => setter(Number(e.target.value))}
                className="w-full h-2 rounded-full outline-none cursor-pointer"
                style={{
                  accentColor: color,
                  background: `linear-gradient(to right, ${color} 0%, ${color} ${(value / max) * 100}%, rgba(0,0,0,0.1) ${(value / max) * 100}%, rgba(0,0,0,0.1) 100%)`,
                }}
              />
            </div>
          ))}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setCalculated(true)}
            className="w-full py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #00C47D, #006FEF)' }}
          >
            Calculate My Waste
          </motion.button>
        </div>

        {/* Result */}
        <div className="glass-card rounded-2xl p-7 flex flex-col items-center justify-center">
          {calculated ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              <div className="text-center mb-4">
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Your weekly waste estimate
                </p>
                <p className="text-4xl font-black" style={{
                  background: 'linear-gradient(135deg, #00C47D, #006FEF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {totalWaste} kg
                </p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v} kg`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              {tips.length > 0 && (
                <div className="mt-4 space-y-2">
                  {tips.map((tip, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="text-xs p-3 rounded-xl"
                      style={{ background: 'rgba(0,196,125,0.08)', color: 'var(--text-secondary)' }}
                    >
                      {tip}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="text-center opacity-50">
              <Calculator size={64} style={{ color: 'var(--green-primary)', margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Fill in the form and click Calculate to see your results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2 — CARBON FOOTPRINT CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────

function CarbonCalculator() {
  const [plasticBags, setPlasticBags] = useState(5);
  const [foodWasted, setFoodWasted] = useState(2);
  const [itemsThrown, setItemsThrown] = useState(3);
  const [newProducts, setNewProducts] = useState(2);
  const [calculated, setCalculated] = useState(false);

  // Rough CO2 coefficients (kg CO2e)
  const co2 = plasticBags * 0.6 + foodWasted * 3.3 + itemsThrown * 2.5 + newProducts * 8;
  const avgCo2 = 30; // kg CO2e per week average
  const diff = Math.round(((co2 - avgCo2) / avgCo2) * 100);
  const gaugePercent = Math.min(100, (co2 / 60) * 100);

  const gaugeColor = gaugePercent < 40 ? '#00C47D' : gaugePercent < 70 ? '#F59E0B' : '#EF4444';

  const radialData = [{ name: 'CO2', value: gaugePercent, fill: gaugeColor }];

  const reductionTips = [
    plasticBags > 5 && '🛍️ Switch to reusable bags — saves ~0.6 kg CO2 per bag per week.',
    foodWasted > 2 && '🍽️ Plan meals to waste less food — food waste is a huge CO2 contributor.',
    itemsThrown > 3 && '♻️ Recycle more items instead of throwing them — saves ~2.5 kg CO2 each.',
    newProducts > 2 && '🔄 Buy second-hand or refurbished products when possible.',
    co2 < avgCo2 && '🌟 Your carbon footprint from waste is below average. Great work!',
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card rounded-2xl p-7 space-y-6">
          <h3 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
            Your Waste Carbon Impact
          </h3>
          {[
            { label: 'Plastic bags used per week', value: plasticBags, setter: setPlasticBags, max: 20, color: '#006FEF' },
            { label: 'Food wasted per week (kg)', value: foodWasted, setter: setFoodWasted, max: 10, color: '#F59E0B' },
            { label: 'Items thrown instead of recycled/week', value: itemsThrown, setter: setItemsThrown, max: 15, color: '#EF4444' },
            { label: 'New products (instead of second-hand)/month', value: newProducts, setter: setNewProducts, max: 10, color: '#8B5CF6' },
          ].map(({ label, value, setter, max, color }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span className="font-bold" style={{ color }}>{value}</span>
              </div>
              <input
                type="range" min={0} max={max} value={value}
                onChange={(e) => setter(Number(e.target.value))}
                className="w-full h-2 rounded-full outline-none cursor-pointer"
                style={{
                  accentColor: color,
                  background: `linear-gradient(to right, ${color} 0%, ${color} ${(value / max) * 100}%, rgba(0,0,0,0.1) ${(value / max) * 100}%, rgba(0,0,0,0.1) 100%)`,
                }}
              />
            </div>
          ))}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setCalculated(true)}
            className="w-full py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #006FEF, #00C47D)' }}
          >
            Calculate Carbon Footprint
          </motion.button>
        </div>

        {/* Gauge result */}
        <div className="glass-card rounded-2xl p-7 flex flex-col items-center justify-center">
          {calculated ? (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center">
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Estimated CO₂ Equivalent
              </p>
              <p className="text-4xl font-black mb-1" style={{ color: gaugeColor }}>
                {co2.toFixed(1)} kg
              </p>
              <p className="text-xs mb-6 font-medium" style={{ color: 'var(--text-secondary)' }}>CO₂e per week</p>

              <ResponsiveContainer width="100%" height={180}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="90%"
                  startAngle={180}
                  endAngle={0}
                  data={radialData}
                >
                  <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'rgba(0,0,0,0.06)' }} />
                </RadialBarChart>
              </ResponsiveContainer>

              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4"
                style={{
                  background: diff > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(0,196,125,0.1)',
                  color: diff > 0 ? '#EF4444' : '#00C47D',
                }}
              >
                {diff > 0 ? `📈 ${diff}% above average` : `📉 ${Math.abs(diff)}% below average`}
              </div>

              <div className="space-y-2 text-left">
                {reductionTips.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-xs p-3 rounded-xl"
                    style={{ background: 'rgba(0,111,239,0.06)', color: 'var(--text-secondary)' }}
                  >
                    {tip}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="text-center opacity-50">
              <Leaf size={64} style={{ color: 'var(--green-primary)', margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Fill in the form to calculate your carbon footprint.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3 — INTERACTIVE QUIZ
// ─────────────────────────────────────────────────────────────────────────────

const quizQuestions = [
  {
    q: 'Which bin should glass bottles go into?',
    options: ['General waste (black)', 'Glass recycling bin', 'Organic waste', 'Hazardous waste'],
    correct: 1,
    explanation: 'Glass bottles should be rinsed and placed in the glass recycling bin.',
  },
  {
    q: 'What is the correct way to dispose of a used pizza box?',
    options: ['Recycle it whole', 'Throw it in the trash', 'If clean, recycle; if greasy, compost/trash', 'Always compost'],
    correct: 2,
    explanation: 'Greasy pizza boxes contaminate paper recycling. Clean parts can be recycled.',
  },
  {
    q: 'Where should you take old mobile phones?',
    options: ['Regular garbage bin', 'Paper recycling', 'E-waste facility', 'Compost bin'],
    correct: 2,
    explanation: 'E-waste contains hazardous materials and valuable metals. Never landfill electronics.',
  },
  {
    q: 'What does "upcycling" mean?',
    options: [
      'Throwing items upward into bins',
      'Turning waste into something of higher value',
      'Cycling to the recycling center',
      'Buying new products to replace old ones',
    ],
    correct: 1,
    explanation: 'Upcycling transforms unwanted items into new products of greater value or quality.',
  },
  {
    q: 'Which of these is NOT recyclable in most standard recycling programs?',
    options: ['Cardboard boxes', 'Newspaper', 'Styrofoam', 'Aluminum cans'],
    correct: 2,
    explanation: 'Styrofoam (EPS) is generally not recyclable in standard programs. Check locally.',
  },
  {
    q: 'How should you prepare cardboard for recycling?',
    options: [
      'Leave it as-is',
      'Flatten it and remove tape/staples',
      'Wet it before placing in the bin',
      'Cut into small pieces',
    ],
    correct: 1,
    explanation: 'Flatten cardboard to save space and remove tape/staples which are not recyclable.',
  },
  {
    q: 'What should you do with old batteries?',
    options: [
      'Throw them in the regular trash',
      'Flush them down the toilet',
      'Take them to a battery recycling drop-off point',
      'Bury them in the garden',
    ],
    correct: 2,
    explanation: 'Batteries contain toxic chemicals. Take them to designated battery recycling points.',
  },
  {
    q: 'What is the correct order of the waste hierarchy?',
    options: [
      'Recycle → Reduce → Reuse → Recover → Dispose',
      'Reduce → Reuse → Recycle → Recover → Dispose',
      'Dispose → Recover → Recycle → Reuse → Reduce',
      'Reuse → Reduce → Recycle → Dispose → Recover',
    ],
    correct: 1,
    explanation: 'Reduce first, then Reuse, Recycle, Recover energy, and finally Dispose responsibly.',
  },
];

function InteractiveQuiz() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const question = quizQuestions[current];
  const progress = ((current) / quizQuestions.length) * 100;

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const correct = idx === question.correct;
    if (correct) setScore((s) => s + 1);
    setAnswers((prev) => [...prev, correct]);
  };

  const handleNext = () => {
    if (current + 1 >= quizQuestions.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
    setAnswers([]);
  };

  const generateCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 800;
    canvas.height = 560;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 800, 560);
    grad.addColorStop(0, '#f0faf5');
    grad.addColorStop(1, '#e8f4ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 560);

    // Border
    ctx.strokeStyle = '#00C47D';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 760, 520);
    ctx.strokeStyle = '#006FEF';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, 740, 500);

    // Title
    ctx.fillStyle = '#1a3a2a';
    ctx.font = 'bold 42px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Achievement', 400, 110);

    // Subtitle
    ctx.fillStyle = '#00C47D';
    ctx.font = '20px Georgia, serif';
    ctx.fillText('Waste Management Excellence Portal', 400, 150);

    // Body
    ctx.fillStyle = '#374151';
    ctx.font = '18px Georgia, serif';
    ctx.fillText('This certifies that you have successfully completed the', 400, 220);
    ctx.fillText('Waste Management Knowledge Quiz', 400, 250);

    // Score
    ctx.fillStyle = '#006FEF';
    ctx.font = 'bold 52px Georgia, serif';
    ctx.fillText(`${score} / ${quizQuestions.length}`, 400, 340);

    ctx.fillStyle = '#374151';
    ctx.font = '16px Georgia, serif';
    ctx.fillText('Score', 400, 370);

    // Date
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Georgia, serif';
    ctx.fillText(`Issued: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 400, 470);

    // Download
    const link = document.createElement('a');
    link.download = 'waste-management-certificate.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShare = async () => {
    const text = `I scored ${score}/${quizQuestions.length} on the Waste Management Quiz! 🌿♻️ Test your knowledge at the Waste Management Excellence Portal.`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Result copied to clipboard!');
    }
  };

  if (finished) {
    const pct = Math.round((score / quizQuestions.length) * 100);
    const grade = pct >= 87 ? { label: 'Expert', color: '#00C47D' } : pct >= 62 ? { label: 'Proficient', color: '#006FEF' } : { label: 'Learner', color: '#F59E0B' };
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-10 max-w-xl mx-auto text-center"
      >
        <canvas ref={canvasRef} className="hidden" />
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <Trophy size={72} className="mx-auto mb-4" style={{ color: '#F59E0B' }} />
        </motion.div>
        <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
          Quiz Complete!
        </h2>
        <div
          className="text-6xl font-black my-4"
          style={{
            background: 'linear-gradient(135deg, #00C47D, #006FEF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {score} / {quizQuestions.length}
        </div>
        <div
          className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-6"
          style={{ background: `${grade.color}22`, color: grade.color }}
        >
          {grade.label}
        </div>

        {/* Answer summary */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {answers.map((correct, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: correct ? '#00C47D' : '#EF4444' }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={generateCertificate}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #00C47D, #006FEF)' }}
          >
            <Download size={16} /> Download Certificate
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm"
            style={{ background: 'rgba(0,111,239,0.1)', color: '#006FEF', border: '1px solid rgba(0,111,239,0.3)' }}
          >
            <Share2 size={16} /> Share Results
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRestart}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm"
            style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)' }}
          >
            <RotateCcw size={16} /> Restart
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
          <span>Question {current + 1} of {quizQuestions.length}</span>
          <span>{score} correct</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(135deg, #00C47D, #006FEF)' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="glass-card rounded-2xl p-8"
        >
          <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            {question.q}
          </h3>

          <div className="space-y-3">
            {question.options.map((opt, idx) => {
              let bg = 'rgba(255,255,255,0.6)';
              let border = '1px solid rgba(0,0,0,0.08)';
              let textColor = 'var(--text-primary)';
              if (answered) {
                if (idx === question.correct) {
                  bg = 'rgba(0,196,125,0.15)'; border = '1px solid #00C47D'; textColor = '#00C47D';
                } else if (idx === selected) {
                  bg = 'rgba(239,68,68,0.1)'; border = '1px solid #EF4444'; textColor = '#EF4444';
                }
              } else if (selected === idx) {
                bg = 'rgba(0,111,239,0.1)'; border = '1px solid #006FEF'; textColor = '#006FEF';
              }

              return (
                <motion.button
                  key={idx}
                  whileHover={!answered ? { x: 4, scale: 1.01 } : {}}
                  whileTap={!answered ? { scale: 0.98 } : {}}
                  onClick={() => handleSelect(idx)}
                  className="quiz-option w-full text-left px-5 py-3.5 rounded-xl text-sm font-medium flex items-center justify-between transition-all"
                  style={{ background: bg, border, color: textColor, cursor: answered ? 'default' : 'pointer' }}
                >
                  <span>{opt}</span>
                  {answered && idx === question.correct && <CheckCircle size={18} className="text-green-500" />}
                  {answered && idx === selected && idx !== question.correct && <XCircle size={18} className="text-red-400" />}
                </motion.button>
              );
            })}
          </div>

          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 p-4 rounded-xl text-sm"
              style={{ background: 'rgba(0,196,125,0.08)', color: 'var(--text-secondary)' }}
            >
              <span className="font-semibold" style={{ color: 'var(--green-primary)' }}>💡 Explanation: </span>
              {question.explanation}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {answered && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #00C47D, #006FEF)' }}
          >
            {current + 1 >= quizQuestions.length ? 'See Results' : 'Next Question'} <ChevronRight size={16} />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 4 — AI WASTE ASSISTANT
// ─────────────────────────────────────────────────────────────────────────────

type ChatMessage = { role: 'user' | 'assistant'; text: string };

const wasteDatabase: Record<string, { category: string; instructions: string; tips: string[] }> = {
  'plastic bottle': {
    category: 'Recyclable',
    instructions: 'Rinse the bottle thoroughly, check the recycling number on the bottom (1-7), remove the cap (recycle separately), and place in the blue recycling bin.',
    tips: ['♻️ Numbers 1 (PET) and 2 (HDPE) are widely recyclable', '🚿 Always rinse to avoid contaminating other recyclables', '🗜️ Crush to save space'],
  },
  'plastic': {
    category: 'Recyclable (check type)',
    instructions: 'Check the recycling number. Numbers 1 (PET) and 2 (HDPE) are widely accepted. Numbers 3, 6, 7 are often not recyclable.',
    tips: ['♻️ Look for the recycling symbol with a number', '🚿 Rinse before recycling', '🔍 Check your local guidelines'],
  },
  'old phone': {
    category: '⚠️ E-Waste',
    instructions: 'Never place in regular trash or recycling. Take to a certified e-waste facility or electronics retailer drop-off. Wipe all personal data first!',
    tips: ['🔐 Factory reset and remove SIM/memory card', '🏪 Many phone stores offer free take-back programs', '⚠️ Contains lead, mercury, and other toxins'],
  },
  'phone': {
    category: '⚠️ E-Waste',
    instructions: 'Old phones are e-waste and must go to a certified e-waste facility or electronics retailer drop-off. Always wipe personal data first.',
    tips: ['🔐 Factory reset your device first', '🏪 Carrier stores often have recycling programs', '💰 Consider selling/donating working phones'],
  },
  'pizza box': {
    category: 'Depends on condition',
    instructions: 'If the box is clean and grease-free → recycle in the paper bin. If it\'s greasy/soiled → compost or general waste. You can tear off and recycle the clean top portion.',
    tips: ['✂️ Tear and separate clean parts for recycling', '🌿 Greasy portions can go in compost', '🚫 Grease contaminates paper recycling'],
  },
  'battery': {
    category: '⚠️ Hazardous',
    instructions: 'Batteries are hazardous and must NEVER go in regular trash or recycling. Take to designated battery collection points (often at supermarkets, hardware stores, or electronics shops).',
    tips: ['⚠️ Contains toxic chemicals like cadmium and lead', '🔋 Rechargeable batteries: Li-ion recycling programs exist', '📍 Many retailers have battery drop-off boxes'],
  },
  'batteries': {
    category: '⚠️ Hazardous',
    instructions: 'Batteries are hazardous and must NEVER go in regular trash. Take to designated battery collection points at supermarkets, hardware stores, or electronics retailers.',
    tips: ['⚠️ Toxic chemicals can leach into soil and water', '🔋 Switch to rechargeable batteries to reduce waste', '📍 Many shops have free battery drop-off points'],
  },
  'newspaper': {
    category: 'Recyclable',
    instructions: 'Remove any plastic sleeves or wrappers first (recycle or dispose separately). Place dry newspapers in the paper/card recycling bin.',
    tips: ['🚫 Remove all plastic wrapping first', '📰 Keep dry — wet paper cannot be recycled', '📦 Bundle or stack for easier handling'],
  },
  'food scraps': {
    category: 'Compostable / Organic',
    instructions: 'Most food scraps can be composted. Place in your green/organic waste bin or a home compost bin. Avoid composting meat, dairy, and oily foods in home composters.',
    tips: ['🌿 Home composting: ideal for fruit/veg scraps', '🐛 Consider a worm farm for kitchen scraps', '🚫 No meat or dairy in home compost (attracts pests)'],
  },
  'food': {
    category: 'Compostable / Organic',
    instructions: 'Food scraps go in the organic/green waste bin or home compost. Avoid composting meat and dairy at home.',
    tips: ['🌿 Composting enriches soil naturally', '📉 Reduce food waste by planning meals', '🐛 Worm farms are great for apartment composting'],
  },
  'paint': {
    category: '⚠️ Hazardous',
    instructions: 'Paint cans (especially oil-based) are hazardous waste. Take to your local hazardous waste collection facility. Water-based/latex paint can sometimes be donated.',
    tips: ['🎨 Latex paint: let dry completely before disposal', '🏪 Hardware stores sometimes accept old paint', '♻️ Check for community paint-swap programs'],
  },
  'paint can': {
    category: '⚠️ Hazardous',
    instructions: 'Paint cans with residue must go to a hazardous waste facility. Empty, dry cans can often be recycled as metal.',
    tips: ['🎨 Donate usable paint to community projects', '🏪 Some stores have paint take-back programs', '🔓 Leave lid off so paint dries for safer disposal'],
  },
  'clothes': {
    category: 'Donate / Textile Recycling',
    instructions: 'If clothes are in good condition → donate to charity shops or clothing drives. If worn out/damaged → take to textile recycling bins (many clothing stores have them).',
    tips: ['👕 Good condition: donate to charity or sell online', '🧵 Worn out: look for H&M, Zara, or Primark take-back bins', '♻️ Fabric can be recycled into insulation or rags'],
  },
  'clothing': {
    category: 'Donate / Textile Recycling',
    instructions: 'Wearable clothing should be donated. Damaged clothing can go to textile recycling bins found at many retail stores.',
    tips: ['👕 Check Vinted, Depop, or eBay for selling', '🧵 Torn fabric: look for textile recycling points', '🌿 Natural fibres biodegrade; synthetics do not'],
  },
  'light bulb': {
    category: 'Depends on type',
    instructions: 'CFL (spiral) bulbs → hazardous, take to collection point. LED bulbs → recyclable at e-waste or designated points. Incandescent bulbs → general trash (non-recyclable).',
    tips: ['💡 CFL contains mercury — handle with care', '🔵 LEDs last 25x longer, saving waste long-term', '🏪 Many hardware stores accept CFL bulbs'],
  },
  'lightbulb': {
    category: 'Depends on type',
    instructions: 'CFL bulbs contain mercury → hazardous waste facility. LED bulbs → e-waste recycling. Old incandescent bulbs → general trash.',
    tips: ['💡 Never break a CFL — mercury vapour is toxic', '🌿 Switch to LED to reduce both waste and energy use', '🏪 Retail stores often have bulb drop-off programs'],
  },
  'cardboard': {
    category: 'Recyclable',
    instructions: 'Flatten all cardboard boxes to save space. Remove any tape, staples, or non-paper elements. Place in the paper/card recycling bin.',
    tips: ['📦 Flatten to save space in recycling bins', '🚫 Remove tape and bubble wrap', '💧 Keep dry — wet cardboard cannot be recycled'],
  },
  'glass bottle': {
    category: 'Recyclable',
    instructions: 'Rinse the bottle thoroughly. Remove metal lids (recycle separately). Place in the glass recycling bin — usually sorted by colour (clear, green, brown).',
    tips: ['🔵 Some areas sort by glass colour', '🚫 Do not mix with window glass or mirrors (different composition)', '♻️ Glass can be recycled indefinitely'],
  },
  'glass': {
    category: 'Recyclable (bottles & jars)',
    instructions: 'Rinse glass containers and place in glass recycling. Window glass, mirrors, and ovenware are NOT recyclable in standard glass bins.',
    tips: ['🔵 Check if your area sorts by colour', '🚫 No window panes or broken mirrors in glass bin', '♻️ Glass is 100% recyclable without quality loss'],
  },
  'car battery': {
    category: '⚠️ Hazardous / Auto Recycling',
    instructions: 'Car batteries must never go in regular trash. Take to an auto parts store (most accept them for free), a mechanic, or a hazardous waste facility.',
    tips: ['🔋 Auto parts stores (e.g., Halfords) accept them for free', '⚠️ Contains sulfuric acid — handle with care', '♻️ Lead-acid batteries are highly recyclable'],
  },
  'styrofoam': {
    category: '⚠️ Usually NOT Recyclable',
    instructions: 'Styrofoam (EPS) is typically not accepted in standard recycling programs. Check locally for specialised EPS recycling. Otherwise, place in general waste.',
    tips: ['🔍 Some areas have dedicated Styrofoam drop-off points', '🚫 Do not place in regular recycling bins', '🌿 Avoid Styrofoam by choosing alternatives with less packaging'],
  },
  'medical waste': {
    category: '⚠️ Special Medical Waste',
    instructions: 'Never place medical waste in regular bins. Take to a pharmacy (many accept sharps, medicines, and medical waste) or a dedicated medical waste collection point.',
    tips: ['💊 Medicines: return to pharmacy for safe disposal', '💉 Sharps: use a sharps container, return to pharmacy', '⚠️ Never flush medicines down the toilet (harms water supply)'],
  },
  'medicine': {
    category: '⚠️ Special Disposal',
    instructions: 'Take unused or expired medicines to a pharmacy. Never flush down the toilet or throw in regular trash.',
    tips: ['💊 Pharmacies have medicine take-back programs', '🚫 Never flush — affects water ecosystems', '📦 Keep in original packaging when returning'],
  },
};

function getWasteAdvice(input: string): string {
  const lower = input.toLowerCase().trim();

  // Try to match known items
  for (const [key, data] of Object.entries(wasteDatabase)) {
    if (lower.includes(key)) {
      return `**📦 Item: ${input.trim()}**\n**Category: ${data.category}**\n\n${data.instructions}\n\n**Tips:**\n${data.tips.join('\n')}`;
    }
  }

  return `I'm not sure about "${input.trim()}". Please check your **local waste authority guidelines** or visit your municipality's website for specific disposal instructions.\n\n🌐 General tip: When in doubt, keep it out of the recycling bin to avoid contaminating other recyclables.`;
}

const QUICK_CHIPS = ['Plastic Bottle', 'Old Phone', 'Pizza Box', 'Batteries', 'Old Clothes'];

function formatMessage(text: string) {
  return text
    .split('\n')
    .map((line, i) => {
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return `<span key="${i}">${boldLine}</span>`;
    })
    .join('<br/>');
}

function AiAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: 'Hi! 👋 I\'m your AI Waste Segregation Assistant. Tell me any waste item (e.g. "plastic bottle", "old phone", "batteries") and I\'ll tell you exactly how to dispose of it responsibly!' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getWasteAdvice(text);
      setMessages((prev) => [...prev, { role: 'assistant', text: response }]);
      setIsTyping(false);
    }, 900 + Math.random() * 400);
  };

  const handleSend = () => sendMessage(input);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 600 }}>
      {/* Chat window */}
      <div
        className="glass-card rounded-2xl flex-1 overflow-y-auto p-5 space-y-4 mb-4"
        style={{ minHeight: 0 }}
      >
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              {msg.role === 'assistant' && (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ background: 'linear-gradient(135deg, #00C47D, #006FEF)' }}
                >
                  <Bot size={18} color="white" />
                </div>
              )}
              {msg.role === 'user' && (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 text-white text-sm font-bold"
                  style={{ background: 'rgba(0,111,239,0.8)' }}
                >
                  U
                </div>
              )}

              {/* Bubble */}
              <div
                className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={
                  msg.role === 'user'
                    ? {
                        background: 'linear-gradient(135deg, #006FEF, #00C47D)',
                        color: 'white',
                        borderBottomRightRadius: 4,
                      }
                    : {
                        background: 'rgba(255,255,255,0.85)',
                        color: 'var(--text-primary)',
                        border: '1px solid rgba(0,196,125,0.2)',
                        borderBottomLeftRadius: 4,
                      }
                }
              >
                <span
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-3"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #00C47D, #006FEF)' }}
            >
              <Bot size={18} color="white" />
            </div>
            <div
              className="rounded-2xl px-4 py-3 flex items-center gap-1"
              style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,196,125,0.2)', borderBottomLeftRadius: 4 }}
            >
              {[0, 1, 2].map((d) => (
                <motion.div
                  key={d}
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#00C47D' }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick chips */}
      <div className="flex gap-2 flex-wrap mb-3">
        {QUICK_CHIPS.map((chip) => (
          <motion.button
            key={chip}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage(chip)}
            className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
            style={{
              background: 'rgba(0,196,125,0.1)',
              color: 'var(--green-primary)',
              border: '1px solid rgba(0,196,125,0.3)',
            }}
          >
            {chip}
          </motion.button>
        ))}
      </div>

      {/* Input */}
      <div
        className="flex gap-3 p-3 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.8)',
          border: '1px solid rgba(0,196,125,0.3)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a waste item (e.g. 'pizza box', 'old phone')..."
          className="flex-1 bg-transparent outline-none text-sm px-2"
          style={{ color: 'var(--text-primary)' }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #00C47D, #006FEF)' }}
        >
          <Send size={16} />
        </motion.button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TOOLS PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState('waste');

  const renderTab = () => {
    switch (activeTab) {
      case 'waste': return <WasteCalculator />;
      case 'carbon': return <CarbonCalculator />;
      case 'quiz': return <InteractiveQuiz />;
      case 'ai': return <AiAssistant />;
      default: return <WasteCalculator />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base, #f0faf5)' }}>
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ background: 'var(--green-primary)' }} />
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ background: 'var(--blue-primary)' }} />
      </div>

      <div className="relative z-10">
        {/* Hero Header */}
        <div
          className="text-center py-16 px-6"
          style={{ background: 'linear-gradient(135deg, rgba(0,196,125,0.05) 0%, rgba(0,111,239,0.05) 100%)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap size={16} style={{ color: 'var(--green-primary)' }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--green-primary)' }}>
                Interactive Tools
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
              Sustainability{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #00C47D, #006FEF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Tools
              </span>
            </h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Calculate your waste footprint, test your knowledge, and get AI-powered disposal guidance.
            </p>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="sticky top-0 z-20 px-6 pb-0"
          style={{
            background: 'rgba(240,250,245,0.9)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(0,196,125,0.15)',
          }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex overflow-x-auto hide-scrollbar gap-0">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition-all relative flex-shrink-0"
                    style={{ color: isActive ? 'var(--green-primary)' : 'var(--text-secondary)' }}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                        style={{ background: 'var(--green-primary)' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-5xl mx-auto px-6 py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
