'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  FolderOpen,
  BookOpen,
  Microscope,
  LayoutTemplate,
  Gavel,
  FileText,
  File,
  FileBadge,
  FileSpreadsheet,
  Filter,
} from 'lucide-react';

interface Resource {
  id: number;
  title: string;
  type: string;
  description: string;
  fileSize: string;
  fileType: string;
  year: number;
  color: string;
}

const resources: Resource[] = [
  { id: 1, title: 'Waste Collection SOP v3.2', type: 'SOPs', description: 'Standard Operating Procedure for municipal solid waste collection routes and schedules.', fileSize: '2.4 MB', fileType: 'PDF', year: 2025, color: '#00C47D' },
  { id: 2, title: 'Hazardous Waste Handling SOP', type: 'SOPs', description: 'Comprehensive SOP for identification, segregation, and safe handling of hazardous waste streams.', fileSize: '3.8 MB', fileType: 'PDF', year: 2025, color: '#00C47D' },
  { id: 3, title: 'MRF Operations Guideline', type: 'Guidelines', description: 'Operational guideline for Materials Recovery Facilities covering sorting, quality control, and baling.', fileSize: '5.1 MB', fileType: 'PDF', year: 2026, color: '#006FEF' },
  { id: 4, title: 'Composting Facility Design Guidelines', type: 'Guidelines', description: 'Site planning, design criteria, and performance standards for municipal composting facilities.', fileSize: '4.7 MB', fileType: 'PDF', year: 2024, color: '#006FEF' },
  { id: 5, title: 'Circular Economy Transition Study', type: 'Research', description: 'Peer-reviewed study on circular economy implementation barriers and enablers in arid-region cities.', fileSize: '6.2 MB', fileType: 'PDF', year: 2026, color: '#8B5CF6' },
  { id: 6, title: 'Urban Mining Economic Feasibility Report', type: 'Research', description: 'Techno-economic analysis of precious metal recovery from regional e-waste streams.', fileSize: '4.4 MB', fileType: 'PDF', year: 2025, color: '#8B5CF6' },
  { id: 7, title: 'Waste Audit Data Collection Template', type: 'Templates', description: 'Excel-based template for conducting gravimetric waste composition audits at household and commercial levels.', fileSize: '0.8 MB', fileType: 'XLSX', year: 2025, color: '#F59E0B' },
  { id: 8, title: 'Environmental Impact Assessment Template', type: 'Templates', description: 'Standard template for EIA screening and scoping of waste management infrastructure projects.', fileSize: '1.2 MB', fileType: 'DOCX', year: 2024, color: '#F59E0B' },
  { id: 9, title: 'National Waste Management Regulation 2024', type: 'Legislation', description: 'Full text of the National Waste Management and Recycling Regulation with annexures and schedules.', fileSize: '3.3 MB', fileType: 'PDF', year: 2024, color: '#EF4444' },
  { id: 10, title: 'EPR Framework Legislation', type: 'Legislation', description: 'Extended Producer Responsibility legislative framework covering packaging, electronics, and batteries.', fileSize: '2.7 MB', fileType: 'PDF', year: 2026, color: '#EF4444' },
  { id: 11, title: 'E-Waste Classification & Handling Guidelines', type: 'Guidelines', description: 'Regulatory guide for classifying and managing end-of-life electronic equipment under national law.', fileSize: '2.1 MB', fileType: 'PDF', year: 2025, color: '#006FEF' },
  { id: 12, title: 'Annual Performance Reporting Template', type: 'Templates', description: 'Dashboard template for municipalities to report key waste management KPIs to the national authority.', fileSize: '1.5 MB', fileType: 'XLSX', year: 2026, color: '#F59E0B' },
];

const filterTypes = ['All', 'SOPs', 'Guidelines', 'Research', 'Templates', 'Legislation'];

const typeIconMap: Record<string, React.ElementType> = {
  SOPs: FolderOpen,
  Guidelines: BookOpen,
  Research: Microscope,
  Templates: LayoutTemplate,
  Legislation: Gavel,
};

const fileTypeIconMap: Record<string, React.ElementType> = {
  PDF: FileText,
  XLSX: FileSpreadsheet,
  DOCX: FileBadge,
};

export default function ResourcesPage() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All' ? resources : resources.filter((r) => r.type === activeFilter);

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

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
            <span className="label-tag"><Download size={13} className="inline mr-1" />Library</span>
          </div>
          <h1 className="heading-hero gradient-text mb-6">Resources & Downloads</h1>
          <p className="text-body-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            A curated library of SOPs, guidelines, research papers, templates, and legislation for waste management professionals.
          </p>
        </motion.div>
      </section>

      {/* ── Filter ── */}
      <section className="container-xl pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          {filterTypes.map((type) => {
            const Icon = type === 'All' ? Filter : typeIconMap[type] ?? File;
            const isActive = activeFilter === type;
            return (
              <motion.button
                key={type}
                onClick={() => setActiveFilter(type)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${isActive ? '' : 'glass-card hover:border-green-400/40'}`}
                style={isActive ? { background: 'var(--gradient-brand)', color: '#fff' } : { color: 'var(--text-secondary)' }}
              >
                <Icon size={14} />
                {type}
              </motion.button>
            );
          })}
        </motion.div>
      </section>

      {/* ── Count ── */}
      <section className="container-xl pb-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span className="font-bold" style={{ color: 'var(--green-primary)' }}>{filtered.length}</span>{' '}
          resource{filtered.length !== 1 ? 's' : ''} available
        </motion.div>
      </section>

      {/* ── Resource Cards ── */}
      <section className="container-xl pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((res) => {
              const TypeIcon = typeIconMap[res.type] ?? File;
              const FileIcon = fileTypeIconMap[res.fileType] ?? File;
              return (
                <motion.div
                  key={res.id}
                  variants={itemVariants}
                  className="crystal-card rounded-2xl p-6 flex flex-col gap-4 group cursor-pointer"
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                >
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: res.color + '22', border: `1px solid ${res.color}33` }}
                    >
                      <TypeIcon size={22} style={{ color: res.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2 inline-block"
                        style={{ background: res.color + '22', color: res.color, border: `1px solid ${res.color}44` }}
                      >
                        {res.type}
                      </span>
                      <h3 className="text-white font-bold text-sm leading-snug group-hover:text-green-400 transition-colors">
                        {res.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                    {res.description}
                  </p>

                  {/* Meta + Download */}
                  <div className="flex items-center justify-between mt-auto pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center gap-1">
                        <FileIcon size={12} />
                        {res.fileType}
                      </span>
                      <span>{res.fileSize}</span>
                      <span>{res.year}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-crystal inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
                      style={{ background: 'var(--gradient-brand)' }}
                    >
                      <Download size={13} />
                      Download
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>
            <FolderOpen size={52} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">No resources found in this category.</p>
          </div>
        )}
      </section>
    </main>
  );
}
