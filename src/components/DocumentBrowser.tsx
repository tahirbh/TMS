import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useConfirmStore } from '../store/confirmStore';
import { 
  FileText, 
  Search, 
  Clock, 
  ExternalLink, 
  Trash2,
  Loader2,
  FileSearch,
  Maximize2,
  User,
  RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import UploadModal from './UploadModal';

interface Document {
  id: string;
  name: string;
  type: string;
  expiry_date: string;
  status: 'valid' | 'near_expiry' | 'expired';
  file_url: string;
  entity_type: string;
  entity_id?: string;
  storage_path: string;
  created_at: string;
}

interface DocumentBrowserProps {
  entityType?: string;
  entityId?: string;
  title?: string;
}

export default function DocumentBrowser({ entityType, entityId, title = "Documents" }: DocumentBrowserProps) {
  const confirm = useConfirmStore(state => state.confirm);
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [syncing, setSyncing] = useState(false);

  const [profilesMap, setProfilesMap] = useState<Record<string, string>>({});
  const [vehiclesMap, setVehiclesMap] = useState<Record<string, string>>({});
  const [sponsorsMap, setSponsorsMap] = useState<Record<string, string>>({});

  const fetchEntityNames = useCallback(async () => {
    try {
      const [profilesRes, vehiclesRes, sponsorsRes] = await Promise.all([
        (supabase as any).from('profiles').select('id, full_name'),
        (supabase as any).from('vehicles').select('id, registration_number'),
        (supabase as any).from('sponsors').select('id, name')
      ]);

      if (profilesRes.data) {
        const pMap: Record<string, string> = {};
        profilesRes.data.forEach((p: any) => { pMap[p.id] = p.full_name; });
        setProfilesMap(pMap);
      }
      if (vehiclesRes.data) {
        const vMap: Record<string, string> = {};
        vehiclesRes.data.forEach((v: any) => { vMap[v.id] = v.registration_number; });
        setVehiclesMap(vMap);
      }
      if (sponsorsRes.data) {
        const sMap: Record<string, string> = {};
        sponsorsRes.data.forEach((s: any) => { sMap[s.id] = s.name; });
        setSponsorsMap(sMap);
      }
    } catch (err) {
      console.error('Error loading entity names:', err);
    }
  }, []);

  const getEntityPrefix = (doc: Document) => {
    if (!doc.entity_id || doc.entity_id === '00000000-0000-0000-0000-000000000000') return '';
    if (doc.entity_type === 'employee' || doc.entity_type === 'general' || doc.entity_type === 'labor' || doc.entity_type === 'driver') {
      const empName = profilesMap[doc.entity_id];
      return empName ? `${empName} - ` : '';
    }
    if (doc.entity_type === 'vehicle') {
      const plate = vehiclesMap[doc.entity_id];
      return plate ? `${plate} - ` : '';
    }
    if (doc.entity_type === 'sponsor') {
      const sponsorName = sponsorsMap[doc.entity_id];
      return sponsorName ? `${sponsorName} - ` : '';
    }
    return '';
  };

  const getEntityName = (doc: Document) => {
    if (!doc.entity_id || doc.entity_id === '00000000-0000-0000-0000-000000000000') return 'General / System';
    if (doc.entity_type === 'employee' || doc.entity_type === 'general' || doc.entity_type === 'labor' || doc.entity_type === 'driver') {
      return profilesMap[doc.entity_id] || 'Unknown Employee';
    }
    if (doc.entity_type === 'vehicle') {
      return vehiclesMap[doc.entity_id] || 'Unknown Vehicle';
    }
    if (doc.entity_type === 'sponsor') {
      return sponsorsMap[doc.entity_id] || 'Unknown Sponsor';
    }
    return 'General';
  };

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    if (entityId) {
      query = query.eq('entity_id', entityId);
    }

    const { data, error } = await query;
    if (!error && data) {
      const typedData = data as Document[];
      setDocs(typedData);
      if (typedData.length > 0) {
        setSelectedDoc((prev: Document | null) => {
          if (prev) {
            const stillExists = typedData.find(d => d.id === prev.id);
            if (stillExists) return stillExists;
          }
          return typedData[0];
        });
      } else {
        setSelectedDoc(null);
      }
    }
    setLoading(false);
  }, [entityType, entityId]);

  useEffect(() => {
    fetchDocs();
    fetchEntityNames();
  }, [fetchDocs, fetchEntityNames]);

  const handleDelete = async (id: string, path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await confirm({
      title: 'Delete Vault Document',
      message: 'Are you sure you want to delete this document? This will permanently erase the file from Supabase Storage and remove its register entry.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    
    try {
      // 1. Delete from Storage
      await supabase.storage.from('documents').remove([path]);
      // 2. Delete from DB
      await supabase.from('documents').delete().eq('id', id);
      
      fetchDocs();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSyncWithStorage = async () => {
    setSyncing(true);
    try {
      const { data: dbDocs, error } = await (supabase as any)
        .from('documents')
        .select('id, file_url, storage_path');

      if (error) throw error;
      if (!dbDocs || dbDocs.length === 0) {
        alert('No documents in registry to sync.');
        return;
      }

      let orphanedCount = 0;
      
      // Perform HEAD check on each file URL to verify storage existence.
      // If it returns 404 or 403, delete the orphaned DB record.
      const syncPromises = dbDocs.map(async (doc: any) => {
        try {
          const res = await fetch(doc.file_url, { method: 'HEAD' });
          if (res.status === 404 || res.status === 403) {
            await supabase.from('documents').delete().eq('id', doc.id);
            orphanedCount++;
          }
        } catch (fetchErr) {
          // If the URL is completely invalid or returns network error, also clean up
          await supabase.from('documents').delete().eq('id', doc.id);
          orphanedCount++;
        }
      });

      await Promise.all(syncPromises);
      alert(`Sync Complete! Cleaned up ${orphanedCount} orphaned database records whose storage files were deleted.`);
      fetchDocs();
    } catch (syncErr: any) {
      console.error('Sync error:', syncErr);
      alert(syncErr.message || 'Failed to sync with storage.');
    } finally {
      setSyncing(false);
    }
  };

  const filteredDocs = docs.filter(doc => {
    const term = search.toLowerCase();
    const docName = doc.name.toLowerCase();
    const docType = doc.type.toLowerCase();
    const entityName = getEntityName(doc).toLowerCase();
    
    return docName.includes(term) || docType.includes(term) || entityName.includes(term);
  });

  const isImageFile = (url: string) => {
    if (!url) return false;
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
  };

  const getDaysLeft = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    expiry.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{title}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">
            {docs.length} Items in Vault
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSyncWithStorage}
            disabled={syncing}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
            title="Scan database records and remove any references whose files have been deleted from storage"
          >
            {syncing ? (
              <Loader2 className="animate-spin w-3.5 h-3.5" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Sync Storage
          </button>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            Upload Document
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
        <input 
          type="text" 
          placeholder="Search by category or filename..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-150">
          <FileSearch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-bold">No documents matching filter</p>
          <p className="text-xs text-slate-400 mt-1">Upload a file to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Documents Listing */}
          <div className="lg:col-span-7 space-y-3">
            <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-100 grid grid-cols-12 gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {!entityType ? (
                <>
                  <div className="col-span-4">Employee / Entity Name</div>
                  <div className="col-span-4">Document Type</div>
                  <div className="col-span-4">Document Link</div>
                </>
              ) : (
                <>
                  <div className="col-span-5">Document Category</div>
                  <div className="col-span-7">File</div>
                </>
              )}
            </div>

            <div className="space-y-2 max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
              {filteredDocs.map((doc) => (
                <div 
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={cn(
                    "grid grid-cols-12 gap-4 items-center p-3 rounded-2xl border transition-all cursor-pointer group",
                    selectedDoc?.id === doc.id 
                      ? "bg-blue-50/40 border-blue-200 ring-2 ring-blue-500/5" 
                      : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
                  )}
                >
                  {!entityType ? (
                    <>
                      {/* Column 1: Employee / Entity Name */}
                      <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
                          <User size={14} />
                        </div>
                        <span className="text-xs font-bold text-slate-800 truncate" title={getEntityName(doc)}>
                          {getEntityName(doc)}
                        </span>
                      </div>

                      {/* Column 2: Document Type */}
                      <div className="col-span-4 flex flex-col justify-center min-w-0">
                        <div>
                          <span className={cn(
                            "text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded",
                            doc.status === 'expired' ? "bg-rose-100 text-rose-700" :
                            doc.status === 'near_expiry' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                          )}>
                            {doc.type}
                          </span>
                        </div>
                        {doc.expiry_date ? (
                          <p className={cn(
                            "text-[10px] font-bold mt-1.5",
                            doc.status === 'expired' ? "text-rose-500 font-extrabold animate-pulse" :
                            doc.status === 'near_expiry' ? "text-amber-500" : "text-emerald-600"
                          )}>
                            {getDaysLeft(doc.expiry_date) !== null && getDaysLeft(doc.expiry_date)! >= 0 
                              ? `${getDaysLeft(doc.expiry_date)} days left` 
                              : `Expired ${Math.abs(getDaysLeft(doc.expiry_date) || 0)} days ago`}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400 font-bold mt-1.5">No Expiry Date</p>
                        )}
                      </div>

                      {/* Column 3: Document Link */}
                      <div className="col-span-4 flex items-center justify-between min-w-0">
                        <a 
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoc(doc);
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-750 hover:underline flex items-center gap-1 truncate"
                        >
                          <ExternalLink size={12} className="shrink-0" />
                          View File
                        </a>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                          <button 
                            onClick={(e) => handleDelete(doc.id, doc.storage_path, e)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Compact Category Column */}
                      <div className="col-span-5 flex items-center gap-2">
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                          doc.status === 'expired' ? "bg-rose-50 text-rose-500" : 
                          doc.status === 'near_expiry' ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-600"
                        )}>
                          <FileText size={14} />
                        </div>
                        <span className="text-xs font-bold text-slate-800 truncate">{doc.type}</span>
                      </div>

                      {/* Compact File Column */}
                      <div className="col-span-7 flex items-center justify-between min-w-0">
                        <div className="min-w-0 pr-2">
                          <p className="text-xs text-slate-500 truncate font-semibold" title={doc.name}>
                            {getEntityPrefix(doc)}{doc.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Clock size={10} className="text-slate-400" />
                              <span className="text-[9px] text-slate-400 font-medium">
                                {new Date(doc.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {doc.expiry_date ? (
                              <span className={cn(
                                "text-[9px] font-black px-1.5 py-0.5 rounded border",
                                doc.status === 'expired' ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse" :
                                doc.status === 'near_expiry' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                              )}>
                                {getDaysLeft(doc.expiry_date) !== null && getDaysLeft(doc.expiry_date)! >= 0 
                                  ? `${getDaysLeft(doc.expiry_date)}d left` 
                                  : `Expired ${Math.abs(getDaysLeft(doc.expiry_date) || 0)}d ago`}
                              </span>
                            ) : (
                              <span className="text-[9px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                                No Expiry
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                          <button 
                            onClick={(e) => handleDelete(doc.id, doc.storage_path, e)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Dynamic File Viewer / Preview Card */}
          <div className="lg:col-span-5">
            {selectedDoc ? (
              <div className="bg-slate-50 border border-slate-150 rounded-[24px] p-5 space-y-4 flex flex-col h-full min-h-[400px]">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <span className="inline-block px-2.5 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {selectedDoc.type}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 mt-2 truncate" title={selectedDoc.name}>
                      {getEntityPrefix(selectedDoc)}{selectedDoc.name}
                    </h4>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <a 
                      href={selectedDoc.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
                      title="Open in new tab"
                    >
                      <Maximize2 size={14} />
                    </a>
                  </div>
                </div>

                {/* Dynamic Image/File Viewer Frame */}
                <div className="flex-1 bg-white border border-slate-100 rounded-2xl overflow-hidden relative min-h-[220px] flex items-center justify-center shadow-inner">
                  {isImageFile(selectedDoc.file_url) ? (
                    <img 
                      key={selectedDoc.id}
                      src={selectedDoc.file_url} 
                      alt={selectedDoc.name}
                      className="absolute inset-0 w-full h-full object-contain p-2 animate-fade-in"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shadow-sm">
                        <FileText size={28} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-700 uppercase tracking-widest">PDF Document</p>
                        <p className="text-[11px] text-slate-400 mt-1">Direct preview is not supported for PDFs.</p>
                      </div>
                      <a 
                        href={selectedDoc.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-orange-500/25"
                      >
                        <ExternalLink size={13} />
                        View PDF File
                      </a>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-100 rounded-xl p-3 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Status</span>
                  <span className={cn(
                    "font-bold uppercase tracking-widest",
                    selectedDoc.status === 'expired' ? "text-rose-500 font-extrabold animate-pulse" : 
                    selectedDoc.status === 'near_expiry' ? "text-amber-500" : "text-emerald-500"
                  )}>
                    {selectedDoc.status}
                  </span>
                </div>

                {selectedDoc.expiry_date && (
                  <>
                    <div className="bg-white border border-slate-100 rounded-xl p-3 flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 font-bold uppercase tracking-wider">Expiry Date (Gregorian)</span>
                      <span className="font-mono text-slate-700 font-black">
                        {selectedDoc.expiry_date}
                      </span>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-xl p-3 flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 font-bold uppercase tracking-wider">Validity Period</span>
                      <span className={cn(
                        "font-black uppercase tracking-wider",
                        selectedDoc.status === 'expired' ? "text-rose-500 font-extrabold animate-pulse" :
                        selectedDoc.status === 'near_expiry' ? "text-amber-500" : "text-emerald-500"
                      )}>
                        {getDaysLeft(selectedDoc.expiry_date) !== null && getDaysLeft(selectedDoc.expiry_date)! >= 0
                          ? `${getDaysLeft(selectedDoc.expiry_date)} days remaining`
                          : `Expired ${Math.abs(getDaysLeft(selectedDoc.expiry_date) || 0)} days ago`}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[24px] p-8 text-center flex flex-col items-center justify-center min-h-[400px] h-full">
                <FileText className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm font-bold">Select a document</p>
                <p className="text-slate-400 text-xs mt-1">Select any document from the list to preview it here dynamically.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <UploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={fetchDocs}
        entityType={entityType}
        entityId={entityId}
      />
    </div>
  );
}
