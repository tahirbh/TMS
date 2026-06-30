import { Globe, RefreshCw, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export default function WastePortalPage() {
  const [loading, setLoading] = useState(true);
  const portalUrl = 'https://waste-portal-pied.vercel.app';

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] w-full">
      {/* Control Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-200 shrink-0 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Globe size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Waste Management Excellence Portal</h2>
            <p className="text-[10px] text-slate-400 font-medium">Embedded Environmental Horizons Co. (EH) Public Portal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {loading && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <RefreshCw size={12} className="animate-spin" />
              <span>Loading public portal...</span>
            </div>
          )}
          <a 
            href={portalUrl} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            <span>Open in Tab</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Frame Wrapper */}
      <div className="flex-1 w-full bg-slate-100 relative rounded-b-xl overflow-hidden">
        <iframe
          src={portalUrl}
          title="Waste Management Excellence Portal"
          className="w-full h-full border-none"
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
}
