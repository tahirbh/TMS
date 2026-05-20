import DocumentBrowser from '../components/DocumentBrowser';

const DMSEngine = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Document Management Engine</h1>
        <p className="text-slate-500 text-sm">Enterprise-grade document lifecycle and vault.</p>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
        <DocumentBrowser title="Global Document Vault" />
      </div>
    </div>
  );
};

export default DMSEngine;
