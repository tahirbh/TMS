'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Image,
  Newspaper,
  BookOpen,
  Users,
  BarChart2,
  LogOut,
  TrendingUp,
  Eye,
  Mail,
  Trash2,
  Edit,
  ChevronRight,
  Bell,
  Settings,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Globe,
  X,
  UploadCloud,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const monthlyViews = [
  { month: 'Jan', views: 3200, visitors: 1800 },
  { month: 'Feb', views: 4100, visitors: 2300 },
  { month: 'Mar', views: 3800, visitors: 2100 },
  { month: 'Apr', views: 5200, visitors: 2900 },
  { month: 'May', views: 4700, visitors: 2600 },
  { month: 'Jun', views: 6100, visitors: 3400 },
];

const articles = [
  { id: 1, title: 'The Future of Plastic Recycling', category: 'Recycling', date: '2026-06-20', views: 1245, status: 'Published' },
  { id: 2, title: 'Zero Waste Living Guide 2026', category: 'Lifestyle', date: '2026-06-18', views: 987, status: 'Published' },
  { id: 3, title: 'Composting at Home: A Beginner\'s Guide', category: 'Composting', date: '2026-06-15', views: 832, status: 'Published' },
  { id: 4, title: 'E-Waste Crisis: What You Need to Know', category: 'E-Waste', date: '2026-06-12', views: 1567, status: 'Published' },
  { id: 5, title: 'SDG 12: Responsible Consumption Progress', category: 'Policy', date: '2026-06-10', views: 654, status: 'Draft' },
  { id: 6, title: 'Circular Economy Explained Simply', category: 'Education', date: '2026-06-08', views: 1102, status: 'Published' },
  { id: 7, title: 'Community Recycling Programs That Work', category: 'Community', date: '2026-06-05', views: 445, status: 'Draft' },
];

const galleryItems = [
  { id: 1, title: 'Recycling Station', category: 'Infrastructure', src: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=300&q=80' },
  { id: 2, title: 'Composting Facility', category: 'Facility', src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80' },
  { id: 3, title: 'Community Cleanup', category: 'Events', src: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&q=80' },
  { id: 4, title: 'Ocean Cleanup Drive', category: 'Events', src: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=300&q=80' },
  { id: 5, title: 'Green City Initiative', category: 'Urban', src: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300&q=80' },
  { id: 6, title: 'Solar Powered Facility', category: 'Infrastructure', src: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&q=80' },
];

const recentActivity = [
  { action: 'New article published', user: 'Admin', time: '2 mins ago', type: 'article' },
  { action: 'Gallery item added', user: 'Editor', time: '15 mins ago', type: 'gallery' },
  { action: 'New subscriber', user: 'john.doe@email.com', time: '32 mins ago', type: 'user' },
  { action: 'Article updated', user: 'Admin', time: '1 hour ago', type: 'article' },
  { action: 'Comment moderated', user: 'Moderator', time: '2 hours ago', type: 'comment' },
  { action: 'Resource uploaded', user: 'Editor', time: '3 hours ago', type: 'resource' },
];

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'articles', label: 'Articles', icon: FileText },
  { id: 'gallery', label: 'Gallery', icon: Image },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'resources', label: 'Resources', icon: BookOpen },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  icon: Icon,
  color,
  change,
  positive,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  change: string;
  positive: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="glass-card rounded-2xl p-6 relative overflow-hidden"
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 opacity-10"
        style={{ background: color }}
      />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            {title}
          </p>
          <p className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
          <div className={`flex items-center gap-1 text-xs font-medium ${positive ? 'text-green-500' : 'text-red-400'}`}>
            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {change} vs last month
          </div>
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `${color}22`, border: `1px solid ${color}44` }}
        >
          <Icon size={22} style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────

function DashboardView() {
  return (
    <div className="space-y-8">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KpiCard title="Total Articles" value="45" icon={FileText} color="#00C47D" change="+12%" positive={true} />
        <KpiCard title="Gallery Items" value="120" icon={Image} color="#006FEF" change="+8%" positive={true} />
        <KpiCard title="Newsletter Subscribers" value="2,847" icon={Mail} color="#8B5CF6" change="+23%" positive={true} />
        <KpiCard title="Monthly Visitors" value="18,420" icon={Globe} color="#F59E0B" change="-3%" positive={false} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-6" style={{ color: 'var(--text-primary)' }}>
            Monthly Article Views
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyViews}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,196,125,0.2)', borderRadius: 12 }}
              />
              <Bar dataKey="views" fill="#00C47D" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-6" style={{ color: 'var(--text-primary)' }}>
            Visitor Trend
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyViews}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,111,239,0.2)', borderRadius: 12 }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#006FEF"
                strokeWidth={2.5}
                dot={{ fill: '#006FEF', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
            Recent Activity
          </h3>
          <button className="text-sm font-medium" style={{ color: 'var(--green-primary)' }}>
            View all
          </button>
        </div>
        <div className="space-y-4">
          {recentActivity.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between py-3 border-b"
              style={{ borderColor: 'rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,196,125,0.15)' }}
                >
                  <Activity size={14} style={{ color: 'var(--green-primary)' }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.action}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.user}</p>
                </div>
              </div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Articles View ────────────────────────────────────────────────────────────

function ArticlesView() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Articles</h2>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #00C47D, #006FEF)' }}
        >
          <Plus size={16} /> New Article
        </motion.button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                {['Title', 'Category', 'Date', 'Views', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articles.map((a, i) => (
                <motion.tr
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group"
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium truncate max-w-xs" style={{ color: 'var(--text-primary)' }}>
                      {a.title}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{ background: 'rgba(0,196,125,0.1)', color: 'var(--green-primary)' }}
                    >
                      {a.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {a.date}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Eye size={13} /> {a.views.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{
                        background: a.status === 'Published' ? 'rgba(0,196,125,0.1)' : 'rgba(251,191,36,0.1)',
                        color: a.status === 'Published' ? '#00C47D' : '#F59E0B',
                      }}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-1.5 rounded-lg"
                        style={{ background: 'rgba(0,111,239,0.1)', color: '#006FEF' }}
                      >
                        <Edit size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-1.5 rounded-lg"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Gallery View ─────────────────────────────────────────────────────────────

function GalleryView() {
  const [items, setItems] = useState(galleryItems);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Infrastructure');
  const [imgSrc, setImgSrc] = useState('https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=300&q=80');
  const [mockFileName, setMockFileName] = useState('');
  const [successToast, setSuccessToast] = useState(false);

  const presets = [
    { name: 'Smart Bin', url: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=300&q=80' },
    { name: 'Conveyor Sort', url: 'https://images.unsplash.com/photo-1605600611220-b89b74021265?w=300&q=80' },
    { name: 'Compost Soil', url: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300&q=80' },
    { name: 'Solar Panels', url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=300&q=80' },
  ];

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem = {
      id: Date.now(),
      title: title.trim(),
      category,
      src: imgSrc,
    };

    setItems([newItem, ...items]);
    setTitle('');
    setCategory('Infrastructure');
    setImgSrc(presets[0].url);
    setMockFileName('');
    setShowModal(false);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  const handleMockFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMockFileName(file.name);
      const randomPreset = presets[Math.floor(Math.random() * presets.length)].url;
      setImgSrc(randomPreset);
    }
  };

  const handleDelete = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div>
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 9999,
              background: 'var(--green-primary)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 196, 125, 0.3)',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            🎉 Image uploaded to gallery successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Gallery</h2>
        <motion.button
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #00C47D, #006FEF)', cursor: 'pointer' }}
        >
          <Plus size={16} /> Upload Image
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(i * 0.05, 0.4) }}
            whileHover={{ y: -4 }}
            className="glass-card rounded-2xl overflow-hidden group"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white"
                >
                  <Edit size={16} />
                </motion.button>
                <motion.button
                  onClick={() => handleDelete(item.id)}
                  whileHover={{ scale: 1.1 }}
                  className="p-2 rounded-lg bg-red-500/70 backdrop-blur-sm text-white"
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
            </div>
            <div className="p-4">
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
              <span
                className="text-xs mt-1 inline-block px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,111,239,0.1)', color: '#006FEF' }}
              >
                {item.category}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'black',
                zIndex: 9990,
              }}
            />
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9995,
                width: 'min(480px, 90vw)',
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 196, 125, 0.25)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 20px 80px rgba(0,0,0,0.15)',
              }}
            >
              <div className="flex items-center justify-between mb-6 pb-2 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Upload New Image</h3>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Image Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Clean Energy Systems"
                    className="input-crystal"
                    style={{ background: 'white', color: 'black', border: '1px solid #ccc' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-crystal"
                    style={{ background: 'white', color: 'black', border: '1px solid #ccc' }}
                  >
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Facility">Facility</option>
                    <option value="Events">Events</option>
                    <option value="Urban">Urban</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Select Image File</label>
                  <div
                    style={{
                      border: '2px dashed rgba(0, 196, 125, 0.3)',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                      background: 'rgba(0,196,125,0.03)',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMockFileChange}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        cursor: 'pointer',
                      }}
                    />
                    <UploadCloud size={32} style={{ color: 'var(--green-primary)', margin: '0 auto 10px' }} />
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {mockFileName ? `Selected: ${mockFileName}` : 'Click to choose image file'}
                    </p>
                    <p className="text-xxs text-gray-400 mt-1">PNG, JPG, or SVG up to 5MB</p>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Or Choose Unsplash Preset</label>
                  <div className="grid grid-cols-4 gap-2">
                    {presets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setImgSrc(preset.url);
                          setMockFileName(`[Preset] ${preset.name}`);
                        }}
                        style={{
                          height: '50px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: imgSrc === preset.url ? '2.5px solid var(--green-primary)' : '1px solid #ddd',
                          padding: 0,
                          cursor: 'pointer',
                        }}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-300 hover:bg-gray-100"
                    style={{ background: 'transparent', color: '#666', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90"
                    style={{ background: 'var(--green-primary)', border: 'none', cursor: 'pointer' }}
                  >
                    Add to Gallery
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Placeholder View ─────────────────────────────────────────────────────────

function PlaceholderView({ title }: { title: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #00C47D, #006FEF)' }}
        >
          <Plus size={16} /> Add New
        </motion.button>
      </div>
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                {['Name', 'Type', 'Date Added', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
                >
                  <td className="px-5 py-4">
                    <div className="h-3 w-40 rounded animate-pulse" style={{ background: 'rgba(0,0,0,0.06)' }} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-3 w-20 rounded animate-pulse" style={{ background: 'rgba(0,0,0,0.06)' }} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-3 w-24 rounded animate-pulse" style={{ background: 'rgba(0,0,0,0.06)' }} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-5 w-16 rounded-full animate-pulse" style={{ background: 'rgba(0,196,125,0.1)' }} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <div className="h-7 w-7 rounded-lg animate-pulse" style={{ background: 'rgba(0,111,239,0.1)' }} />
                      <div className="h-7 w-7 rounded-lg animate-pulse" style={{ background: 'rgba(239,68,68,0.1)' }} />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 text-center" style={{ color: 'var(--text-secondary)' }}>
          <p className="text-sm">No {title.toLowerCase()} data yet. Click &quot;Add New&quot; to get started.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics View ───────────────────────────────────────────────────────────

function AnalyticsView() {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Analytics Overview</h2>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Avg. Session Duration', value: '4m 32s', icon: TrendingUp, color: '#00C47D' },
          { label: 'Bounce Rate', value: '38.2%', icon: Activity, color: '#006FEF' },
          { label: 'Page Views Today', value: '642', icon: Eye, color: '#8B5CF6' },
          { label: 'New Users This Week', value: '283', icon: Users, color: '#F59E0B' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -3 }}
            className="glass-card rounded-2xl p-5"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${stat.color}22` }}
            >
              <stat.icon size={20} style={{ color: stat.color }} />
            </div>
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-6" style={{ color: 'var(--text-primary)' }}>Traffic Overview (6 Months)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyViews}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12 }} />
            <Legend />
            <Bar dataKey="views" name="Views" fill="#00C47D" radius={[5, 5, 0, 0]} />
            <Bar dataKey="visitors" name="Visitors" fill="#006FEF" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'articles': return <ArticlesView />;
      case 'gallery': return <GalleryView />;
      case 'news': return <PlaceholderView title="News" />;
      case 'resources': return <PlaceholderView title="Resources" />;
      case 'users': return <PlaceholderView title="Users" />;
      case 'analytics': return <AnalyticsView />;
      default: return <DashboardView />;
    }
  };

  const activeLabel = navItems.find((n) => n.id === activeView)?.label ?? 'Dashboard';

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base, #f0faf5)' }}>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-shrink-0 h-screen sticky top-0 flex flex-col"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(0,196,125,0.15)',
          boxShadow: '4px 0 24px rgba(0,196,125,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00C47D, #006FEF)' }}
          >
            <LayoutDashboard size={18} color="white" />
          </div>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="font-bold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>
                WM Portal
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Admin Panel</p>
            </motion.div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200"
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(0,196,125,0.15), rgba(0,111,239,0.10))' : 'transparent',
                  color: isActive ? 'var(--green-primary)' : 'var(--text-secondary)',
                  borderLeft: isActive ? '3px solid #00C47D' : '3px solid transparent',
                }}
              >
                <item.icon size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium flex-1"
                  >
                    {item.label}
                  </motion.span>
                )}
                {!sidebarCollapsed && isActive && (
                  <ChevronRight size={14} className="opacity-50" />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-2 pb-4 space-y-1 border-t pt-3" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <motion.button
            whileHover={{ x: 2 }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left"
            style={{ color: 'var(--text-secondary)' }}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Settings size={18} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Collapse</span>}
          </motion.button>
          <motion.button
            whileHover={{ x: 2 }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left"
            style={{ color: '#EF4444' }}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div>
            <h1 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
              {activeLabel}
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Waste Management Excellence Portal
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
              style={{
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <Search size={14} style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none w-40 text-sm"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            {/* Bell */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <Bell size={16} style={{ color: 'var(--text-secondary)' }} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: '#00C47D' }}
              />
            </motion.button>

            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #00C47D, #006FEF)' }}
            >
              A
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
