import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabase';
import { useRouter } from '@/components/Router';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import DocumentTypeSelector from '@/components/upload/DocumentTypeSelector';
import FileDropZone from '@/components/upload/FileDropZone';
import ExtractionProgress from '@/components/upload/ExtractionProgress';
import ExtractionForm from '@/components/upload/ExtractionForm';

const FIELD_TEMPLATES: Record<string, string[]> = {
  muqeem: [
    "Name (English)", "Name (Arabic)", "Iqama Number", "Nationality", "Occupation/Profession",
    "Sponsor/Employer", "Date of Birth", "Expiry Date (Hijri)", "Expiry Date (Gregorian)",
    "Gender", "Religion", "Passport Number", "Entry Date"
  ],
  driving_license: [
    "Full Name", "License Number", "Date of Birth", "Nationality", "License Type/Category",
    "Issue Date", "Expiry Date", "Blood Group", "Address"
  ],
  vehicle_registration: [
    "Owner Name", "Registration Number (Plate Number)", "Vehicle Make", "Vehicle Model",
    "Year of Manufacture", "Color", "VIN/Chassis Number", "Registration Expiry Date",
    "Insurance Expiry Date", "Cylinders", "Vehicle Type", "Sequence Number", "Serial Number"
  ],
  energy_permit: [
    "Employee Name", "Employee ID/Badge Number", "Iqama Number", "Company/Employer",
    "Position/Role", "Permit Number", "Issue Date", "Expiry Date", "Plant/Facility Name",
    "Access Level", "Blood Group", "Emergency Contact"
  ],
  mvpi_certificate: [
    "Owner Name", "Plate Number", "Chassis Number", "Manufacturer", "Vehicle Type",
    "Color", "Sequence Number", "Expiry Date"
  ],
};

function parseDateToGregorian(dateStr: string): string | null {
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    } else if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
  }
  return dateStr;
}

export default function UploadDocument() {
  const [step, setStep] = useState(0); // 0: type, 1: upload, 2: processing, 3: review
  const [docType, setDocType] = useState('');
  const [files, setFiles] = useState([]);
  const [extractionStep, setExtractionStep] = useState(0);
  const [fields, setFields] = useState([]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [extractionError, setExtractionError] = useState('');

  const { navigate } = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleExtract = async () => {
    setStep(2);
    setExtractionStep(0);
    setExtractionError('');

    const uploadedUrls: string[] = [];
    try {
      // Step 1: Upload files
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }
      setFileUrl(uploadedUrls[0]);
      setExtractionStep(1);

      // Step 2 & 3: OCR + Translation via LLM
      const expectedFields = FIELD_TEMPLATES[docType] || [];
      const isEnergyPermit = docType === 'energy_permit';

      const prompt = `You are an expert OCR and data extraction system for Saudi Arabian official documents. 
Carefully analyze the provided document image(s) and extract ALL visible text and information.

Document type: ${docType.replace(/_/g, ' ').toUpperCase()}

CRITICAL INSTRUCTIONS:
1. Read EVERY piece of text visible in the document, including headers, labels, and values.
2. For Arabic text: translate the VALUE to English. Store the original Arabic in "original_arabic" field.
3. For Hijri dates (١٤٤٨-٠١-١٥ format using Arabic numerals, or YYYY-MM-DD format): keep EXACTLY as-is, just label them as "Hijri". Do NOT convert to Gregorian.
4. Extract ALL data fields you see, do not skip anything.
5. If the document is a PDF or has structured layout, extract each labeled field as a separate entry.
6. For Muqeem documents: fields like رقم الإقامة=Iqama Number, تاريخ الانتهاء=Expiry Date, الاسم=Name, الجنسية=Nationality, المهنة=Profession, صاحب العمل=Employer, تاريخ الميلاد=Date of Birth, الجنس=Gender, الديانة=Religion, الحالة الاجتماعية=Marital Status.
${isEnergyPermit ? '7. Image 1 = FRONT (employee photo, name, expiry). Image 2 = BACK (Iqama number, other details).' : ''}
${docType === 'vehicle_registration' ? '7. Image 1 = FRONT (plate number, make, model, chassis). Image 2 = BACK (Owner Name / المالك, Sequence Number / الرقم التسلسلي, Serial Number). Extract fields from both images. IMPORTANT: Translate the Arabic "Owner Name" (المالك) to English in the "value" field (e.g. "شركة افاق البيئة المحدودة" to "Afaq Al-Beeah Company Ltd.") and keep the original Arabic text in "original_arabic".' : ''}
${docType === 'mvpi_certificate' ? '7. Extract MVPI Certificate fields: Plate Number (رقم اللوحة), Chassis Number (رقم الهيكل), Manufacturer (الشركة الصانعة), Vehicle Type (نوع السيارة), Color (اللون), Sequence Number (الرقم التسلسلي), and Expiry Date (تاريخ انتهاء الفحص / صالحة حتى تاريخ). Note: translate any Arabic text values to English and keep the original Arabic text in "original_arabic".' : ''}

Expected fields: ${expectedFields.join(', ')}

Extract every visible field and return as structured JSON array.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: uploadedUrls,
        response_json_schema: {
          type: "object",
          properties: {
            fields: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string", description: "Field name in English" },
                  value: { type: "string", description: "Field value in English. Keep Hijri dates exactly as-is." },
                  original_arabic: { type: "string", description: "Original Arabic text if source was Arabic, otherwise empty string" }
                },
                required: ["label", "value", "original_arabic"]
              }
            }
          },
          required: ["fields"]
        }
      });

      setExtractionStep(2);
      await new Promise(r => setTimeout(r, 400));
      setExtractionStep(3);
      await new Promise(r => setTimeout(r, 400));

      const extractedFields = result?.fields || [];
      if (extractedFields.length === 0) {
        setExtractionError('No fields could be extracted. The document may be unclear or in an unsupported format. Please try with a clearer image.');
        setStep(1);
        return;
      }
      setFields(extractedFields);
      setPhotoUrl('');
      setStep(3);
    } catch (err) {
      const msg = (err as Error).message || String(err);
      if (msg.includes('limit') || msg.includes('upgrade') || msg.includes('credits')) {
        setExtractionError('You have reached the monthly AI integration credits limit. Please upgrade your Base44 plan to continue using OCR extraction.');
      } else {
        setExtractionError(`Extraction failed: ${msg}. Please try again.`);
      }
      setStep(1);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const getFieldValue = (labelPart: string) => {
        const f = (fields as any[]).find((field: any) => field.label.toLowerCase().includes(labelPart.toLowerCase()));
        return (f ? f.value : '').trim();
      };

      // ── 1. Save to Base44 AI DMS ─────────────────────────────────────────
      await base44.entities.Document.create({
        document_type: docType,
        original_file_url: fileUrl,
        extracted_fields: fields,
        status: 'confirmed',
        notes: notes,
        photo_url: photoUrl || '',
      });

      // ── 2. Resolve entity + compute expiry ───────────────────────────────
      const docTypeLabel = docType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const rawExpiry =
        getFieldValue('expiry date (gregorian)') ||
        getFieldValue('expiry date') ||
        getFieldValue('expiry') ||
        getFieldValue('valid until');
      const expiryDate: string | null = parseDateToGregorian(rawExpiry) || null;

      let entityId: string | null = null;
      let entityType = 'general';
      let docName = docTypeLabel;

      // ── Employee docs ──────────────────────────────────────────────────
      if (['muqeem', 'driving_license', 'energy_permit'].includes(docType)) {
        entityType = 'employee';
        const iqama =
          getFieldValue('iqama number') ||
          getFieldValue('iqama') ||
          getFieldValue('employee id') ||
          getFieldValue('badge number');
        const personName =
          getFieldValue('name (english)') ||
          getFieldValue('full name') ||
          getFieldValue('employee name') ||
          getFieldValue('name');
        docName = personName || iqama || docTypeLabel;

        if (iqama) {
          // employees.id IS the same as the profile_id — direct lookup by iqama
          const { data: empRows, error: empLookupErr } = await (supabase as any)
            .from('employees')
            .select('id')
            .eq('iqama_number', iqama)
            .limit(1);
          if (empLookupErr) console.warn('Employee lookup:', empLookupErr.message);
          if (empRows && empRows.length > 0) {
            entityId = empRows[0].id;
            const upd: Record<string, string> = {};
            if (docType === 'muqeem'         && expiryDate) upd.iqama_expiry            = expiryDate;
            if (docType === 'driving_license' && expiryDate) upd.driving_license_expiry  = expiryDate;
            if (docType === 'energy_permit'   && expiryDate) upd.sec_permit_expiry       = expiryDate;
            if (Object.keys(upd).length > 0) {
              const { error: upErr } = await (supabase as any).from('employees').update(upd).eq('id', entityId);
              if (upErr) console.warn('Employee update:', upErr.message);
            }
          }
        }
        // Fallback: search profiles by name if iqama lookup failed
        if (!entityId && docName && docName !== docTypeLabel) {
          const { data: pRows } = await (supabase as any)
            .from('profiles')
            .select('id')
            .ilike('full_name', `%${docName}%`)
            .limit(1);
          if (pRows && pRows.length > 0) entityId = pRows[0].id;
        }
      }

      // ── Vehicle docs ────────────────────────────────────────────────────
      if (['vehicle_registration', 'mvpi_certificate'].includes(docType)) {
        entityType = 'vehicle';
        const plate = getFieldValue('plate number') || getFieldValue('plate') || getFieldValue('registration number');
        const seq   = getFieldValue('sequence number') || getFieldValue('sequence') || getFieldValue('serial');
        const owner = getFieldValue('owner name') || getFieldValue('owner');
        docName = plate || seq || docTypeLabel;

        let vQ = (supabase as any).from('vehicles').select('id');
        if (seq) vQ = vQ.eq('sequence_number', seq);
        else if (plate) vQ = vQ.ilike('registration_number', `%${plate}%`);
        const { data: vRows } = await vQ.limit(1);

        if (vRows && vRows.length > 0) {
          entityId = vRows[0].id;
          const vUpd: Record<string, string> = {};
          if (docType === 'vehicle_registration' && expiryDate) vUpd.registration_expiry = expiryDate;
          if (docType === 'mvpi_certificate'      && expiryDate) vUpd.mvpi_expiry         = expiryDate;
          if (owner) vUpd.owner_name = owner;
          if (Object.keys(vUpd).length > 0)
            await (supabase as any).from('vehicles').update(vUpd).eq('id', entityId);
        }
      }

      // ── 3. Insert into DMS Engine `documents` table ──────────────────────
      // entity_id must never be SQL NULL — use nil-UUID as fallback
      const safeEntityId = entityId || '00000000-0000-0000-0000-000000000000';

      const dmsPayload: Record<string, unknown> = {
        name:         docName,
        type:         docTypeLabel,
        file_url:     fileUrl,
        storage_path: fileUrl,
        entity_type:  entityType,
        entity_id:    safeEntityId,
        status:       'valid',
      };
      if (expiryDate) dmsPayload.expiry_date = expiryDate;

      const { error: dmsErr } = await (supabase as any)
        .from('documents')
        .insert([dmsPayload]);

      if (dmsErr) {
        throw new Error(
          `DMS Engine insert failed: ${dmsErr.message}` +
          (dmsErr.hint ? ` — hint: ${dmsErr.hint}` : '') +
          (dmsErr.code ? ` (code: ${dmsErr.code})` : '')
        );
      }

      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: '✅ Document saved!',
        description: entityId
          ? `Linked to ${entityType} "${docName}" — now visible in DMS Engine.`
          : `Added to DMS Engine as "${docName}" (no matching record auto-linked).`,
      });
    } catch (err: any) {
      console.error('handleSave error:', err);
      toast({
        title: '❌ Save failed',
        description: err.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
      navigate('/documents');
    }
  };

  const handleReset = () => {
    setStep(0);
    setDocType('');
    setFiles([]);
    setFields([]);
    setPhotoUrl('');
    setNotes('');
    setFileUrl('');
  };

  const [isSyncingTruck, setIsSyncingTruck] = useState(false);

  const handleSaveToTruckMaster = async () => {
    setIsSyncingTruck(true);
    try {
      const getFieldValue = (labelPart: string) => {
        const f = fields.find((field: any) => field.label.toLowerCase().includes(labelPart.toLowerCase()));
        return f ? f.value : '';
      };

      const plateNumber = getFieldValue('plate') || getFieldValue('registration number') || getFieldValue('registration_number');
      const seqNumber = getFieldValue('sequence') || getFieldValue('serial');
      const ownerName = getFieldValue('owner');
      const make = getFieldValue('make') || getFieldValue('manufacturer');
      const model = getFieldValue('model') || getFieldValue('vehicle type') || getFieldValue('vehicle_type');
      const color = getFieldValue('color');
      const expiryDateRaw = getFieldValue('expiry') || getFieldValue('expiry date') || getFieldValue('expiry_date');
      const expiryDate = parseDateToGregorian(expiryDateRaw);

      if (!plateNumber && !seqNumber) {
        toast({
          title: 'Sync Failed',
          description: 'Could not find Plate Number or Sequence Number in extracted fields.',
          variant: 'destructive',
        });
        setIsSyncingTruck(false);
        return;
      }

      let query = supabase.from('vehicles').select('*');
      if (seqNumber) {
        query = query.eq('sequence_number', seqNumber);
      } else {
        query = query.eq('registration_number', plateNumber);
      }

      const { data: existingVehicles, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      const vehicleData: any = {
        updated_at: new Date().toISOString(),
      };

      if (plateNumber) vehicleData.registration_number = plateNumber;
      if (seqNumber) vehicleData.sequence_number = seqNumber;
      if (ownerName) vehicleData.owner_name = ownerName;
      if (make) vehicleData.make = make;
      if (model) vehicleData.model = model;
      if (color) vehicleData.color = color;

      if (docType === 'mvpi_certificate') {
        if (expiryDate) vehicleData.mvpi_expiry = expiryDate;
        vehicleData.mvpi_url = fileUrl;
      } else if (docType === 'vehicle_registration') {
        if (expiryDate) vehicleData.registration_expiry = expiryDate;
        vehicleData.registration_url = fileUrl;
      }

      if (existingVehicles && existingVehicles.length > 0) {
        const vehicleId = existingVehicles[0].id;
        const { error: updateErr } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', vehicleId);

        if (updateErr) throw updateErr;
        toast({
          title: 'Truck Master Updated',
          description: `Vehicle ${plateNumber || seqNumber} successfully updated.`,
        });
      } else {
        const newVehicle = {
          ...vehicleData,
          type: 'truck',
          status: 'available',
          capacity_tons: 0,
          notes: `Created via OCR extraction from ${docType === 'mvpi_certificate' ? 'MVPI Certificate' : 'Istmara Vehicle Registration'}.`,
        };
        const { error: insertErr } = await supabase
          .from('vehicles')
          .insert([newVehicle]);

        if (insertErr) throw insertErr;
        toast({
          title: 'Vehicle Enrolled',
          description: `New Vehicle ${plateNumber || seqNumber} has been added to Truck Master.`,
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error Saving to Truck Master',
        description: err.message || 'An unexpected database error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncingTruck(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <Button variant="ghost" className="gap-1.5 text-muted-foreground mb-4 -ml-2" onClick={() => step > 0 && step !== 2 ? setStep(step - 1) : navigate('/')}>
          <ArrowLeft className="w-4 h-4" />
          {step > 0 && step !== 2 ? 'Back' : 'Dashboard'}
        </Button>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">Upload Document</h1>
        <p className="text-muted-foreground text-sm mt-1">Extract data from Saudi documents using AI-powered OCR</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {['Document Type', 'Upload File', 'Processing', 'Review & Save'].map((label, i) => (
          <React.Fragment key={i}>
            <div className={`flex items-center gap-2 ${i <= step ? 'text-primary' : 'text-muted-foreground/40'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'bg-primary text-primary-foreground' :
                i === step ? 'bg-primary/10 text-primary border-2 border-primary' :
                'bg-muted text-muted-foreground/40'
              }`}>
                {i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:inline">{label}</span>
            </div>
            {i < 3 && <div className={`flex-1 h-0.5 rounded ${i < step ? 'bg-primary' : 'bg-border'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <DocumentTypeSelector selected={docType} onSelect={setDocType} />
            <div className="flex justify-end mt-6">
              <Button disabled={!docType} onClick={() => setStep(1)} className="gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            {extractionError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Extraction Failed</AlertTitle>
                <AlertDescription>{extractionError}</AlertDescription>
              </Alert>
            )}
            <FileDropZone files={files} setFiles={setFiles} maxFiles={(docType === 'energy_permit' || docType === 'vehicle_registration' || docType === 'mvpi_certificate') ? 2 : 1} />
            <div className="flex justify-end mt-6">
              <Button disabled={files.length === 0} onClick={handleExtract} className="gap-2 shadow-lg shadow-primary/20">
                <Sparkles className="w-4 h-4" />
                Extract Data
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <ExtractionProgress currentStep={extractionStep} />
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <ExtractionForm
              fields={fields}
              setFields={setFields}
              photoUrl={photoUrl}
              notes={notes}
              setNotes={setNotes}
              onSave={handleSave}
              onReset={handleReset}
              isSaving={isSaving}
              onSaveToTruckMaster={(docType === 'mvpi_certificate' || docType === 'vehicle_registration') ? handleSaveToTruckMaster : undefined}
              isSyncingTruck={isSyncingTruck}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}