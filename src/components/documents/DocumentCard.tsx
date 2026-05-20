import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Archive, Eye, CreditCard, Car, Truck, Zap } from 'lucide-react';

const icons: any = {
  muqeem: CreditCard,
  driving_license: Car,
  vehicle_registration: Truck,
  energy_permit: Zap
};

export default function DocumentCard({ document, onView, onArchive }: any) {
  const Icon = icons[document.document_type] || FileText;
  const isArchived = document.status === 'archived';

  return (
    <Card className="hover:shadow-xl transition-all border-slate-100 flex flex-col relative overflow-hidden group">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/50">
          <Icon className="w-6 h-6" />
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
          document.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
        }`}>
          {document.status}
        </span>
      </div>

      <h3 className="font-heading font-black text-slate-800 text-sm capitalize">
        {document.document_type.replace(/_/g, ' ')}
      </h3>
      <p className="text-xs text-slate-400 font-semibold mt-1 truncate">
        {document.extracted_fields?.find((f: any) => f.label.toLowerCase().includes('name'))?.value || 'No Name'}
      </p>

      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mt-4 border-t border-slate-50 pt-3">
        <Calendar size={12} />
        <span>{new Date(document.created_date).toLocaleDateString()}</span>
      </div>

      <div className="flex gap-2 mt-4 pt-1">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onView(document)}
          className="flex-1 text-[10px] font-black uppercase tracking-widest gap-1 h-8 rounded-xl"
        >
          <Eye size={12} /> View
        </Button>
        {!isArchived && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onArchive(document)}
            className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 px-3 rounded-xl"
          >
            <Archive size={12} />
          </Button>
        )}
      </div>
    </Card>
  );
}
