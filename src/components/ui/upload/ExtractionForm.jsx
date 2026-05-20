import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, RotateCcw, CheckCircle, Languages } from 'lucide-react';

export default function ExtractionForm({ fields, setFields, photoUrl, notes, setNotes, onSave, onReset, isSaving }) {
  const handleFieldChange = (index, key, value) => {
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
          <h2 className="font-heading text-xl font-bold text-foreground">Review Extracted Data</h2>
          <p className="text-sm text-muted-foreground mt-1">Verify each field and make corrections if needed</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-accent border-accent/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            {fields.length} fields extracted
          </Badge>
        </div>
      </div>

      {/* Photo preview if exists */}
      {photoUrl && (
        <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
          <img src={photoUrl} alt="Employee Photo" className="w-20 h-24 rounded-lg object-cover border border-border" />
          <div>
            <p className="text-sm font-medium text-foreground">Employee Photo</p>
            <p className="text-xs text-muted-foreground">Extracted from document</p>
          </div>
        </div>
      )}

      {/* Fields grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="space-y-2 p-4 bg-card rounded-xl border border-border hover:border-primary/20 transition-colors"
          >
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-foreground">
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
              onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
              className="bg-background"
            />
            {field.original_arabic && (
              <p className="text-xs text-muted-foreground/70 text-right" dir="rtl">
                {field.original_arabic}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Additional Notes (Optional)</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this document..."
          className="bg-card min-h-[80px]"
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={onReset}
          disabled={isSaving}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </Button>
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 px-8"
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
    </motion.div>
  );
}