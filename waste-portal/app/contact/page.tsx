'use client';

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
  User,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const contactInfo = [
  {
    icon: Phone,
    label: 'Phone',
    value: '+966 11 234 5678',
    sub: 'Mon – Fri, 8 AM – 5 PM',
    color: '#00C47D',
    href: 'tel:+966112345678',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'info@wasteportal.sa',
    sub: 'We reply within 24 hours',
    color: '#006FEF',
    href: 'mailto:info@wasteportal.sa',
  },
  {
    icon: MapPin,
    label: 'Address',
    value: 'King Fahd District, Riyadh',
    sub: 'Saudi Arabia, 12371',
    color: '#8B5CF6',
    href: 'https://maps.openstreetmap.org/?mlat=24.7136&mlon=46.6753',
  },
  {
    icon: Clock,
    label: 'Working Hours',
    value: 'Sun – Thu: 8 AM – 5 PM',
    sub: 'Fri – Sat: Closed',
    color: '#F59E0B',
    href: null,
  },
];

const subjectOptions = [
  'General Inquiry',
  'Waste Collection Issue',
  'Recycling Information',
  'Hazardous Waste Disposal',
  'E-Waste Collection',
  'Report Illegal Dumping',
  'Partnership Proposal',
  'Media Inquiry',
  'Other',
];

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactPage() {
  const [form, setForm] = useState<FormData>({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required.';
    if (!form.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!form.subject) newErrors.subject = 'Please select a subject.';
    if (!form.message.trim()) {
      newErrors.message = 'Message is required.';
    } else if (form.message.trim().length < 20) {
      newErrors.message = 'Message must be at least 20 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // Simulate async submission
    await new Promise((res) => setTimeout(res, 1800));
    setSubmitting(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm({ name: '', email: '', subject: '', message: '' });
    setErrors({});
    setSubmitted(false);
  };

  const inputBase =
    'w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none focus:ring-2';

  const inputStyle = (field: keyof FormErrors) => ({
    background: 'rgba(255,255,255,0.04)',
    border: errors[field] ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-primary)',
    boxShadow: errors[field] ? '0 0 0 2px rgba(239,68,68,0.15)' : undefined,
  });

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary, #0A0F1C)' }}>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-28 text-center">
        <div className="orb orb-green" style={{ width: 600, height: 600, top: -200, left: -200, opacity: 0.28 }} />
        <div className="orb orb-blue" style={{ width: 500, height: 500, top: -150, right: -150, opacity: 0.22 }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 container-xl"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="label-tag">
              <MessageSquare size={13} className="inline mr-1" />
              Contact Us
            </span>
          </div>
          <h1 className="heading-hero gradient-text mb-6">Get In Touch</h1>
          <p className="text-body-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Have a question, feedback, or partnership proposal? Our team is ready to assist you.
          </p>
        </motion.div>
      </section>

      {/* ── Main Content ── */}
      <section className="container-xl pb-28">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* ── LEFT: Contact Form ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="crystal-card rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
                <Send size={18} className="text-white" />
              </div>
              <div>
                <h2 className="heading-md text-white">Send a Message</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>We'll get back to you within 24 hours</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {submitted ? (
                /* ── Success State ── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                    style={{ background: 'rgba(0,196,125,0.15)', border: '2px solid rgba(0,196,125,0.4)' }}
                  >
                    <CheckCircle size={40} style={{ color: '#00C47D' }} />
                  </motion.div>
                  <h3 className="heading-md text-white mb-3">Message Sent!</h3>
                  <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                    Thank you, <strong className="text-white">{form.name}</strong>. We've received your message and will reply to <strong className="text-white">{form.email}</strong> within 24 hours.
                  </p>
                  <motion.button
                    onClick={handleReset}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-crystal-outline px-6 py-3 rounded-xl text-sm font-bold"
                    style={{ border: '1px solid var(--green-primary)', color: 'var(--green-primary)' }}
                  >
                    Send Another Message
                  </motion.button>
                </motion.div>
              ) : (
                /* ── Form ── */
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-5"
                >
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <User size={12} className="inline mr-1" />
                      Full Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mohammed Al-Ahmad"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className={inputBase}
                      style={inputStyle('name')}
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#EF4444' }}>
                        <AlertCircle size={11} /> {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <Mail size={12} className="inline mr-1" />
                      Email Address <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={inputBase}
                      style={inputStyle('email')}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#EF4444' }}>
                        <AlertCircle size={11} /> {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <FileText size={12} className="inline mr-1" />
                      Subject <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <select
                      value={form.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      className={inputBase}
                      style={{ ...inputStyle('subject'), appearance: 'none', cursor: 'pointer' }}
                    >
                      <option value="" disabled>Select a subject...</option>
                      {subjectOptions.map((opt) => (
                        <option key={opt} value={opt} style={{ background: '#0A0F1C' }}>{opt}</option>
                      ))}
                    </select>
                    {errors.subject && (
                      <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#EF4444' }}>
                        <AlertCircle size={11} /> {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <MessageSquare size={12} className="inline mr-1" />
                      Message <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Tell us how we can help you..."
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className={inputBase}
                      style={{ ...inputStyle('message'), resize: 'vertical', minHeight: 120 }}
                    />
                    <div className="flex justify-between items-start mt-1.5">
                      {errors.message ? (
                        <p className="text-xs flex items-center gap-1" style={{ color: '#EF4444' }}>
                          <AlertCircle size={11} /> {errors.message}
                        </p>
                      ) : <span />}
                      <span className="text-xs" style={{ color: form.message.length >= 20 ? '#00C47D' : 'var(--text-secondary)' }}>
                        {form.message.length} / 20+
                      </span>
                    </div>
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: submitting ? 1 : 1.03 }}
                    whileTap={{ scale: submitting ? 1 : 0.97 }}
                    className="w-full py-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity"
                    style={{
                      background: 'var(--gradient-brand)',
                      opacity: submitting ? 0.8 : 1,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {submitting ? (
                      <>
                        <motion.div
                          className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── RIGHT: Info + Map ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            {/* Contact Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              {contactInfo.map((info, idx) => {
                const Icon = info.icon;
                const Inner = (
                  <motion.div
                    key={info.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + idx * 0.1 }}
                    className="glass-card rounded-2xl p-5 flex flex-col gap-3 cursor-pointer group"
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: info.color + '22', border: `1px solid ${info.color}33` }}
                    >
                      <Icon size={18} style={{ color: info.color }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
                        {info.label}
                      </p>
                      <p className="text-sm font-bold text-white group-hover:text-green-400 transition-colors leading-snug">
                        {info.value}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{info.sub}</p>
                    </div>
                  </motion.div>
                );

                return info.href ? (
                  <a key={info.label} href={info.href} target="_blank" rel="noopener noreferrer">
                    {Inner}
                  </a>
                ) : (
                  <div key={info.label}>{Inner}</div>
                );
              })}
            </div>

            {/* Embedded OpenStreetMap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="crystal-card rounded-2xl overflow-hidden"
              style={{ height: 320 }}
            >
              <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <MapPin size={15} style={{ color: 'var(--green-primary)' }} />
                <span className="text-sm font-semibold text-white">Our Location — Riyadh, Saudi Arabia</span>
              </div>
              <iframe
                title="Waste Management Excellence Portal Location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=46.6303%2C24.6936%2C46.7203%2C24.7336&layer=mapnik&marker=24.7136%2C46.6753"
                width="100%"
                height="270"
                style={{ border: 'none', display: 'block' }}
                loading="lazy"
                allowFullScreen
              />
            </motion.div>

            {/* Quick response note */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="glass-card rounded-2xl px-5 py-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,196,125,0.15)', border: '1px solid rgba(0,196,125,0.25)' }}>
                <CheckCircle size={18} style={{ color: '#00C47D' }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-0.5">Guaranteed Response</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  All inquiries are acknowledged within 4 hours and fully resolved within 24 business hours.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
