import { X, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DocumentDetailDialog({ document, open, onClose }: any) {
  if (!open || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Document Registry Details</span>
            <h2 className="text-xl font-black text-slate-800 capitalize mt-0.5">
              {document.document_type.replace(/_/g, ' ')}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-450 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Extracted fields */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Extracted Fields</h3>
            <div className="grid grid-cols-1 gap-3.5">
              {document.extracted_fields?.map((field: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                  <span className="text-[10px] font-bold text-slate-450 uppercase">{field.label}</span>
                  <span className="text-sm font-black text-slate-800 mt-1">{field.value}</span>
                  {field.original_arabic && (
                    <span className="text-xs text-slate-400/80 text-right mt-1 font-semibold" dir="rtl">
                      {field.original_arabic}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {document.notes && (
              <div className="mt-6 p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
                <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Notes</h4>
                <p className="text-xs text-amber-900 font-medium leading-relaxed">{document.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column: File Preview */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Source Document Viewer</h3>
            {document.original_file_url ? (
              <div className="flex-1 bg-slate-950 border border-slate-850 rounded-[24px] overflow-hidden min-h-[300px] flex items-center justify-center p-3 relative shadow-inner">
                {document.original_file_url.toLowerCase().endsWith('.pdf') ? (
                  <iframe 
                    src={`${document.original_file_url}#toolbar=0`} 
                    className="w-full h-full min-h-[300px] border-0" 
                    title="Source Document"
                  />
                ) : (
                  <img 
                    src={document.original_file_url} 
                    alt="Source Scan" 
                    className="max-w-full max-h-[380px] object-contain rounded-xl"
                  />
                )}
                
                {/* Download / Open external link overlay */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button 
                    asChild 
                    variant="outline" 
                    size="sm" 
                    className="bg-white/90 backdrop-blur hover:bg-white text-[10px] font-black uppercase tracking-widest h-8 rounded-xl"
                  >
                    <a href={document.original_file_url} target="_blank" rel="noopener noreferrer" className="gap-1">
                      <ExternalLink size={12} /> Open File
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-[24px] flex flex-col items-center justify-center p-8 text-slate-400 text-center">
                <FileText size={40} className="text-slate-300 animate-pulse mb-3" />
                <span className="text-xs font-bold uppercase tracking-widest">No Scan File Attached</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
