import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, RotateCcw, CheckCircle, Languages, Database, Loader2 } from 'lucide-react';

export default function ExtractionForm({ 
  fields, 
  setFields, 
  photoUrl, 
  notes, 
  setNotes, 
  onSave, 
  onReset, 
  isSaving,
  onSaveToTruckMaster,
  isSyncingTruck
}: any) {
  const handleFieldChange = (index: any, key: any, value: any) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    setFields(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-heading text-lg font-black text-slate-800">Review Extracted Data</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">Verify each field and make corrections if needed</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            {fields.length} fields extracted
          </Badge>
        </div>
      </div>

      {/* Photo preview if exists */}
      {photoUrl && (
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <img src={photoUrl} alt="Employee Photo" className="w-20 h-24 rounded-lg object-cover border border-slate-200" />
          <div>
            <p className="text-sm font-black text-slate-850">Employee Photo</p>
            <p className="text-xs text-slate-400 font-semibold">Extracted from document</p>
          </div>
        </div>
      )}

      {/* Fields grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="space-y-2 p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors shadow-sm"
          >
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-500 uppercase">
                {field.label}
              </Label>
              {field.original_arabic && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Languages className="w-3 h-3" />
                  Translated
                </Badge>
              )}
            </div>
            <Input
              value={field.value}
              onChange={(e: any) => handleFieldChange(index, 'value', e.target.value)}
              className="bg-slate-50/30"
            />
            {field.original_arabic && (
              <p className="text-xs text-slate-400/80 text-right font-medium" dir="rtl">
                {field.original_arabic}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-500 uppercase">Additional Notes (Optional)</Label>
        <Textarea
          value={notes}
          onChange={(e: any) => setNotes(e.target.value)}
          placeholder="Add any notes about this document..."
          className="bg-white min-h-[80px]"
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-150">
        <Button
          variant="outline"
          onClick={onReset}
          disabled={isSaving || isSyncingTruck}
          className="gap-2 text-xs font-black uppercase tracking-wider h-10 rounded-xl"
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </Button>
        <div className="flex gap-3">
          {onSaveToTruckMaster && (
            <Button
              type="button"
              onClick={onSaveToTruckMaster}
              disabled={isSaving || isSyncingTruck}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 px-6 text-xs font-black uppercase tracking-wider h-10 rounded-xl"
            >
              {isSyncingTruck ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )}
              {isSyncingTruck ? 'Syncing...' : 'Save to Truck Master'}
            </Button>
          )}
          <Button
            onClick={onSave}
            disabled={isSaving || isSyncingTruck}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 px-8 text-xs font-black uppercase tracking-wider h-10 rounded-xl"
          >
            {isSaving ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Save className="w-4 h-4" />
              </motion.div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Saving...' : 'Confirm & Save'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
