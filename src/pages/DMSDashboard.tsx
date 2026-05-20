import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/components/Router';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle, Clock, CreditCard, Car, Truck, Zap, ArrowRight } from 'lucide-react';
import TokenUsageCard from '@/components/documents/TokenUsageCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StatCard from '@/components/dashboard/StatCard';
import DocumentCard from '@/components/documents/DocumentCard';
import DocumentDetailDialog from '@/components/documents/DocumentDetailDialog';

export default function Dashboard() {
  const [selectedDoc, setSelectedDoc] = useState(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date', 50),
  });

  const docs = documents as any[];
  const confirmed = docs.filter((d: any) => d.status === 'confirmed').length;
  const pending = docs.filter((d: any) => d.status === 'pending').length;
  const recent = docs.slice(0, 6);

  const typeCounts: any = {
    muqeem: docs.filter((d: any) => d.document_type === 'muqeem').length,
    driving_license: docs.filter((d: any) => d.document_type === 'driving_license').length,
    vehicle_registration: docs.filter((d: any) => d.document_type === 'vehicle_registration').length,
    energy_permit: docs.filter((d: any) => d.document_type === 'energy_permit').length,
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Overview of your document extractions</p>
        </div>
        <Button asChild className="gap-2 shadow-lg shadow-primary/20">
          <Link to="/upload">
            <Upload className="w-4 h-4" />
            Upload Document
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Documents" value={docs.length} icon={FileText} color="bg-primary/10 text-primary" delay={0} />
        <StatCard label="Confirmed" value={confirmed} icon={CheckCircle} color="bg-accent/10 text-accent" delay={0.1} />
        <StatCard label="Pending" value={pending} icon={Clock} color="bg-chart-4/10 text-chart-4" delay={0.2} />
        <StatCard label="This Month" value={docs.filter((d: any) => new Date(d.created_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} icon={FileText} color="bg-chart-3/10 text-chart-3" delay={0.3} />
      </div>

      {/* Document type breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: 'muqeem', label: 'Muqeem', icon: CreditCard, color: 'bg-primary/5 border-primary/10 text-primary' },
          { key: 'driving_license', label: 'Driving License', icon: Car, color: 'bg-accent/5 border-accent/10 text-accent' },
          { key: 'vehicle_registration', label: 'Vehicle Reg.', icon: Truck, color: 'bg-chart-3/5 border-chart-3/10 text-chart-3' },
          { key: 'energy_permit', label: 'Energy Permit', icon: Zap, color: 'bg-chart-4/5 border-chart-4/10 text-chart-4' },
        ].map((t, i) => (
          <motion.div key={t.key} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.05 }}>
            <Card className={`p-4 border ${t.color} flex items-center gap-3`}>
              <t.icon className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t.label}</p>
                <p className="text-lg font-bold">{typeCounts[t.key]}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* LLM Token Usage Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TokenUsageCard />
        </div>
        <div className="flex flex-col gap-4">
          <Card className="p-5 flex-1 border-0 shadow-lg bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-violet-500" />
              <h4 className="font-heading font-bold text-sm text-slate-700 dark:text-white">Quick Tips</h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">•</span>
                <span>Each OCR extraction uses ~800-1,200 tokens depending on document complexity.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">•</span>
                <span>Image-heavy documents consume more tokens than text-based PDFs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">•</span>
                <span>Local fallback uses Tesseract.js (no API tokens) but accuracy may differ.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">•</span>
                <span>Token counts shown are estimates — actual API usage may vary slightly.</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Recent documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold">Recent Documents</h2>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" asChild>
            <Link to="/documents">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <Card key={i} className="p-5 animate-pulse">
                <div className="w-11 h-11 rounded-xl bg-muted mb-4" />
                <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </Card>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-foreground mb-1">No documents yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Upload your first document to get started</p>
            <Button asChild>
              <Link to="/upload">Upload Document</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((doc: any) => (
              <DocumentCard key={doc.id} document={doc} onView={setSelectedDoc} onArchive={() => {}} />
            ))}
          </div>
        )}
      </div>

      <DocumentDetailDialog document={selectedDoc} open={!!selectedDoc} onClose={() => setSelectedDoc(null)} />
    </div>
  );
}