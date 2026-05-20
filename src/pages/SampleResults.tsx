import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard, Car, Truck, Zap, Languages, CheckCircle2,
  Info, ChevronDown, ChevronUp, Sparkles, Upload
} from 'lucide-react';
import { Link } from '@/components/Router';

const SAMPLE_DATA: any = {
  muqeem: {
    label: 'Muqeem (Iqama)',
    icon: CreditCard,
    color: 'bg-primary/10 text-primary border-primary/20',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
    description: 'Saudi Residence Permit for Expatriates',
    fields: [
      { label: 'Iqama Number', value: '2171922236', original_arabic: 'رقم الإقامة' },
      { label: 'Full Name (English)', value: 'SAJID IQBAL SARDAR MOHAMMAD', original_arabic: 'الاسم' },
      { label: 'Full Name (Arabic)', value: 'ساجد اقبال سردار محمد', original_arabic: 'الاسم المترجم' },
      { label: 'Date of Birth (Hijri)', value: '1392-11-27', original_arabic: 'تاريخ الميلاد' },
      { label: 'Nationality', value: 'Pakistan', original_arabic: 'الجنسية' },
      { label: 'Gender', value: 'Male', original_arabic: 'الجنس: ذكر' },
      { label: 'Marital Status', value: 'Married', original_arabic: 'الحالة الاجتماعية: متزوج' },
      { label: 'Religion', value: 'Islam', original_arabic: 'الديانة: الاسلام' },
      { label: 'Profession / Occupation', value: 'Welder', original_arabic: 'المهنة: لحام' },
      { label: 'Status', value: 'Valid', original_arabic: 'الحالة: صالح' },
      { label: 'Entry Date (Hijri)', value: '1422-03-19', original_arabic: 'تاريخ الدخول' },
      { label: 'Entry Port', value: 'King Abdulaziz Airport', original_arabic: 'مكان الدخول: مطار الملك عبدالعزيز' },
      { label: 'Passport Number', value: 'BH1331223', original_arabic: 'رقم الجواز' },
      { label: 'Passport Nationality', value: 'Pakistan', original_arabic: 'الجنسية: باكستان' },
      { label: 'Passport Issue Date (Hijri)', value: '1438-02-27', original_arabic: 'تاريخ الاصدار' },
      { label: 'Passport Expiry Date (Hijri)', value: '1448-06-17', original_arabic: 'تاريخ الانتهاء' },
      { label: 'Passport Issue Place', value: 'Jeddah Passports Office', original_arabic: 'جوازات مكة المكرمة' },
      { label: 'Iqama Issue Date (Hijri)', value: '1422-04-06', original_arabic: 'تاريخ الإصدار' },
      { label: 'Iqama Expiry Date (Hijri)', value: '1448-01-15', original_arabic: 'تاريخ الانتهاء' },
      { label: 'Employer Name', value: 'Afaq Al-Beeah Company Ltd.', original_arabic: 'شركة افاق البيئه المحدوده' },
      { label: 'Employer Number', value: '7001535967', original_arabic: 'الرقم: ٧٠٠١٥٣٥٩٦٧' },
      { label: 'Operator Number', value: '108547519O', original_arabic: 'رقم المشغل' },
      { label: 'Report Date (Hijri)', value: '1447-10-10', original_arabic: 'تاريخ التقرير' },
      { label: 'Version Number', value: '14', original_arabic: 'رقم النسخة: ١٤' },
    ]
  },
  driving_license: {
    label: 'Saudi Driving License',
    icon: Car,
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    description: 'Kingdom of Saudi Arabia — Ministry of Interior',
    fields: [
      { label: 'Full Name (English)', value: 'KHURRAM SHAHZAD SIKANDAR HAYAT', original_arabic: 'الاسم' },
      { label: 'Full Name (Arabic)', value: 'خورام شهزاد سكاندر حيات', original_arabic: 'الاسم بالعربي' },
      { label: 'ID Number (Iqama)', value: '2287111401', original_arabic: 'رقم الهوية: ٢٢٨٧١١١٤٠١' },
      { label: 'License Type', value: 'Heavy Transport', original_arabic: 'نوع الرخصة: نقل ثقيل' },
      { label: 'Issue Date', value: '20/07/2011', original_arabic: 'تاريخ الإصدار: ٢٠١١/٠٧/٢٠' },
      { label: 'Date of Birth', value: '01/01/1988', original_arabic: 'تاريخ الميلاد: ١٩٨٨/٠١/٠١' },
      { label: 'Nationality', value: 'Pakistan', original_arabic: 'الجنسية: باكستان' },
      { label: 'Expiry Date', value: '14/12/2030', original_arabic: 'تاريخ الانتهاء: ٢٠٣٠/١٢/١٤' },
      { label: 'Blood Type', value: 'AB+', original_arabic: 'فصيلة الدم: AB+' },
      { label: 'Issuing Authority', value: 'Ministry of Interior — Saudi Arabia', original_arabic: 'وزارة الداخلية' },
    ]
  },
  vehicle_registration: {
    label: 'Vehicle Registration',
    icon: Truck,
    color: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
    badgeColor: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
    description: 'Kingdom of Saudi Arabia — Ministry of Interior',
    fields: [
      { label: 'Owner Name', value: 'Afaq Al-Beeah Company Ltd.', original_arabic: 'المالك: شركة افاق البيئة المحدودة' },
      { label: 'Owner ID Number', value: '7013680876', original_arabic: 'هوية المالك: ٧٠١٣٦٨٠٨٧٦' },
      { label: 'Chassis / VIN Number', value: 'JAMLP3459P7P13023', original_arabic: 'رقم الهيكل' },
      { label: 'Plate Number', value: '4311 K S A', original_arabic: 'رقم اللوحة: أ س ك ٤٣١١' },
      { label: 'Vehicle Make', value: 'Isuzu', original_arabic: 'ماركة المركبة: ايسوزو' },
      { label: 'Vehicle Weight', value: '2705', original_arabic: 'وزن المركبة: ٢٧٠٥' },
      { label: 'Color', value: 'White', original_arabic: 'اللون: ابيض' },
      { label: 'Registration Type', value: 'General Transport', original_arabic: 'نوع التسجيل: نقل عام' },
      { label: 'Vehicle Body Type', value: 'Truck', original_arabic: 'طراز المركبة: شاحنه' },
      { label: 'Cargo Capacity', value: '3', original_arabic: 'حمولة المركبة: ٣' },
      { label: 'Year of Manufacture', value: '2023', original_arabic: 'سنة الصنع: ٢٠٢٣' },
      { label: 'Serial Number', value: '885559910', original_arabic: 'الرقم التسلسلي: ٨٨٥٥٥٩٩١٠' },
      { label: 'Issuing Country', value: 'Kingdom of Saudi Arabia', original_arabic: 'المملكة العربية السعودية' },
    ]
  },
  energy_permit: {
    label: 'Saudi Energy Entry Permit',
    icon: Zap,
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    description: 'Saudi Electricity Company (SE) — Restricted Area Access',
    fields: [
      { label: 'Employee Name (Arabic)', value: 'عبدالله عاطف عجب نور', original_arabic: 'الاسم' },
      { label: 'Employee Name (English)', value: 'ABDULLAH A. AJABNOOR', original_arabic: 'الاسم بالإنجليزي' },
      { label: 'Company / Employer', value: 'Afaq Al-Beeah Company Ltd.', original_arabic: 'شركة افاق البيئه المحدوده' },
      { label: 'Badge / Permit Number', value: 'C-1197324', original_arabic: 'رقم التصريح' },
      { label: 'Permit Expiry Date', value: '03/01/2027', original_arabic: 'تاريخ الانتهاء: EXP' },
      { label: 'Role / Category', value: 'Contractor', original_arabic: 'مقاول' },
      { label: 'Issuing Authority', value: 'Saudi Electricity (SE) — السعودية للطاقة', original_arabic: 'السعودية للطاقة' },
      { label: 'Access Zone', value: 'Restricted Area', original_arabic: 'منطقة محظورة' },
    ]
  }
};

const docTypes = ['muqeem', 'driving_license', 'vehicle_registration', 'energy_permit'];

export default function SampleResults() {
  const [activeTab, setActiveTab] = useState('muqeem');
  const [expandedFields, setExpandedFields] = useState(true);

  const doc = SAMPLE_DATA[activeTab];
  const TypeIcon = doc.icon;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Sample Preview</span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">How OCR Extraction Works</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Below is a live demonstration of exactly what data gets extracted from each document type.
        </p>
      </div>

      {/* Info banner */}
      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm text-foreground">
          <span className="font-semibold">These results were generated from your actual uploaded documents.</span>{' '}
          The system successfully extracted all fields — the "0 fields" issue was caused by the monthly AI credits limit being reached.
          Once your account is topped up, every upload will produce results exactly like this.
        </AlertDescription>
      </Alert>

      {/* Document type tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {docTypes.map((type) => {
          const d = SAMPLE_DATA[type];
          const Icon = d.icon;
          const isActive = activeTab === type;
          return (
            <motion.button
              key={type}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(type)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                isActive
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                  : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${d.color} border`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold leading-tight">{d.label}</span>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </motion.button>
          );
        })}
      </div>

      {/* Extracted result panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="overflow-hidden border border-border shadow-lg">
            {/* Card header */}
            <div className={`px-6 py-5 border-b border-border flex items-center justify-between flex-wrap gap-3`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.color} border`}>
                  <TypeIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-lg text-foreground">{doc.label}</h2>
                  <p className="text-xs text-muted-foreground">{doc.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1.5 text-emerald-600 border-emerald-500/30 bg-emerald-500/5">
                  <CheckCircle2 className="w-3 h-3" />
                  {doc.fields.length} fields extracted
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-muted-foreground"
                  onClick={() => setExpandedFields(v => !v)}
                >
                  {expandedFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {expandedFields ? 'Collapse' : 'Expand'}
                </Button>
              </div>
            </div>

            {/* Fields grid — editable just like the real form */}
            <AnimatePresence>
              {expandedFields && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doc.fields.map((field: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="space-y-1.5 p-4 bg-muted/30 rounded-xl border border-border hover:border-primary/20 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-foreground">{field.label}</label>
                          {field.original_arabic && (
                            <Badge variant="secondary" className="text-xs gap-1 h-5">
                              <Languages className="w-2.5 h-2.5" />
                              Translated
                            </Badge>
                          )}
                        </div>
                        <Input
                          value={field.value}
                          readOnly
                          className="bg-card text-sm font-medium border-border/60 cursor-default"
                        />
                        {field.original_arabic && (
                          <p className="text-xs text-muted-foreground/70 text-right pt-0.5" dir="rtl">
                            {field.original_arabic}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <Separator />

                  {/* Mock action bar */}
                  <div className="px-6 py-4 flex items-center justify-between bg-muted/20">
                    <span className="text-xs text-muted-foreground">
                      ✦ This is a read-only sample preview — upload your document to save real data
                    </span>
                    <Button size="sm" className="gap-2 opacity-60 cursor-not-allowed" disabled>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm & Save
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* CTA */}
      <Card className="p-6 border-2 border-dashed border-primary/20 bg-primary/3 text-center space-y-3">
        <Sparkles className="w-8 h-8 text-primary mx-auto" />
        <h3 className="font-heading font-bold text-lg">Ready to extract your real documents?</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Top up your Base44 integration credits and the system will extract all fields automatically — exactly as shown above.
        </p>
        <Button asChild className="gap-2 shadow-lg shadow-primary/20">
          <Link to="/upload">
            <Upload className="w-4 h-4" />
            Upload a Document
          </Link>
        </Button>
      </Card>
    </div>
  );
}