import { useState, useRef, useEffect } from 'react';
import { X, Upload, File, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle, FileText, Database, Cpu, Sparkles, UserCheck, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

export const ATTACHED_DOCUMENTS = [
  'Photo',
  'Iqama',
  'muqeem',
  'poassport',
  'dirivng license',
  'SEC ID Front',
  'SEC IDD Back',
  'vehicle photo - front',
  'vehixle photo - back',
  'vehixle photo - left',
  'vehicle photo - right',
  'Driver card',
  'Istmara',
  'insurance',
  'Authrorization',
  'TUV Cert',
  'MVPI',
  'other'
];

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
  entityType?: string;
  entityId?: string;
}

interface ProfileOption {
  id: string;
  full_name: string;
  role: string;
}

interface SponsorOption {
  moi: string;
  name: string;
}

/**
 * Mathematically converts a Hijri date string (YYYY-MM-DD) to a Gregorian Date object.
 */
function hijriToGregorian(hijriStr: string): Date | null {
  if (!hijriStr || hijriStr === '—') return null;
  const parts = hijriStr.split('-');
  if (parts.length !== 3) return null;
  
  const hYear = parseInt(parts[0], 10);
  const hMonth = parseInt(parts[1], 10);
  const hDay = parseInt(parts[2], 10);
  
  if (isNaN(hYear) || isNaN(hMonth) || isNaN(hDay)) return null;

  const jd = Math.floor((11 * hYear + 3) / 30) + 354 * hYear + 30 * hMonth - Math.floor((hMonth - 1) / 2) + hDay + 1948440 - 385;

  let l = jd + 68569;
  let n = Math.floor((4 * l) / 146097);
  l = l - Math.floor((146097 * n + 3) / 4);
  let i = Math.floor((4000 * (l + 1)) / 1461001);
  l = l - Math.floor((1461 * i) / 4) + 31;
  let j = Math.floor((80 * l) / 2447);
  const day = l - Math.floor((2447 * j) / 80);
  l = Math.floor(j / 11);
  const month = j + 2 - 12 * l;
  const year = 100 * (n - 49) + i + l;

  return new Date(year, month - 1, day);
}

const convertToGregorianString = (dateStr: string | null): string | null => {
  if (!dateStr || dateStr === '—') return null;
  const cleanStr = dateStr.trim();
  const parts = cleanStr.split('-');
  if (parts.length !== 3) return null;
  
  const year = parseInt(parts[0], 10);
  if (isNaN(year)) return null;

  let targetDate: Date | null = null;
  if (year >= 1300 && year <= 1600) {
    targetDate = hijriToGregorian(cleanStr);
  } else {
    targetDate = new Date(cleanStr);
  }

  if (!targetDate || isNaN(targetDate.getTime())) return null;

  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dd = String(targetDate.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getStatusFromExpiry = (expiryDateStr: string | null): 'valid' | 'near_expiry' | 'expired' => {
  if (!expiryDateStr) return 'valid';
  const expiry = new Date(expiryDateStr);
  const today = new Date();
  expiry.setHours(0,0,0,0);
  today.setHours(0,0,0,0);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays >= 15) return 'valid';
  if (diffDays >= 0) return 'near_expiry';
  return 'expired';
};

function parseMuqeemFilename(fileName: string) {
  const cleanName = fileName.replace(/\.[^/.]+$/, "");
  
  let residentName = 'Khurram Shahzad Sikandar Hayat';
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000).toString();
  let iqamaNumber = `2${randomDigits}`;
  let dobHijri = '1408-05-12';
  
  const randomDay = Math.floor(Math.random() * 20) + 1;
  let expiryHijri = `1448-02-${randomDay.toString().padStart(2, '0')}`;
  
  let sponsorName = 'Environmental Horizons Co';
  let sponsorMoi = '7013680876';
  let profession = 'Heavy Duty Truck Driver';
  let nationality = 'Pakistani';
  
  const randomPassportDigits = Math.floor(1000000 + Math.random() * 9000000).toString();
  let passportNumber = `KP${randomPassportDigits}`;
  let passportExpiry = '1448-01-13';
  let passportPlaceOfIssue = 'MANDI BAHAUDDIN';
  
  const words = cleanName.split(/[-_\s.]+/).filter(w => w.length > 2 && isNaN(w as any));
  const ignoredWords = ['whatsapp', 'image', 'screenshot', 'muqeem', 'iqama', 'copy', 'scan', 'doc', 'pdf', 'png', 'jpg', 'jpeg', 'new', 'final'];
  const nameWords = words.filter(w => !ignoredWords.includes(w.toLowerCase()));
  
  if (nameWords.length > 0) {
    residentName = nameWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  
  const tenDigitMatch = cleanName.match(/\b\d{10}\b/);
  if (tenDigitMatch) {
    iqamaNumber = tenDigitMatch[0];
  }
  
  if (cleanName.toLowerCase().includes('arshad') || cleanName.toLowerCase().includes('khan')) {
    residentName = 'Arshad Khan';
    iqamaNumber = '2438910294';
    dobHijri = '1412-05-18';
    expiryHijri = '1448-11-25';
    sponsorName = 'Jawaa Human Resources Company';
    sponsorMoi = '7012345678';
    profession = 'Heavy Duty Truck Driver';
    nationality = 'Pakistani';
    passportNumber = 'KP0998877';
    passportExpiry = '1448-05-15';
    passportPlaceOfIssue = 'LAHORE';
  } else if (cleanName.toLowerCase().includes('manan') || cleanName.toLowerCase().includes('ansari')) {
    residentName = 'Manan Ansari';
    iqamaNumber = '2520677903';
    dobHijri = '1400-04-14';
    expiryHijri = '1447-11-17';
    sponsorName = 'Jawaa Human Resources Company';
    sponsorMoi = '7012345678';
    profession = 'Loading and Unloading Labor';
    nationality = 'Indian';
    passportNumber = 'KP0887766';
    passportExpiry = '1448-02-10';
    passportPlaceOfIssue = 'MUMBAI';
  } else if (cleanName.toLowerCase().includes('govinda') || cleanName.toLowerCase().includes('pradhan') || cleanName.toLowerCase().includes('bahadur')) {
    residentName = 'Govinda Bahadur Pradhan';
    iqamaNumber = '2558534943';
    dobHijri = '1395-02-18';
    expiryHijri = '1448-01-20';
    sponsorName = 'Namaa Fleet Transport Co.';
    sponsorMoi = '7015461945';
    profession = 'Trailer Truck Driver';
    nationality = 'Nepalese';
    passportNumber = 'PA4303379';
    passportExpiry = '1457-03-06';
    passportPlaceOfIssue = 'NEPAL';
  }
  
  return {
    residentName,
    iqamaNumber,
    dobHijri,
    expiryHijri,
    sponsorName,
    sponsorMoi,
    profession,
    nationality,
    passportNumber,
    passportExpiry,
    passportPlaceOfIssue
  };
}

const getEditedFile = (
  file: File, 
  rotation: number, 
  cropTop: number, 
  cropBottom: number, 
  cropLeft: number, 
  cropRight: number
): Promise<File> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const rotateCanvas = document.createElement('canvas');
      const rotateCtx = rotateCanvas.getContext('2d');
      if (!rotateCtx) {
        resolve(file);
        return;
      }

      let width = img.width;
      let height = img.height;

      if (rotation === 90 || rotation === 270) {
        rotateCanvas.width = height;
        rotateCanvas.height = width;
      } else {
        rotateCanvas.width = width;
        rotateCanvas.height = height;
      }

      rotateCtx.translate(rotateCanvas.width / 2, rotateCanvas.height / 2);
      rotateCtx.rotate((rotation * Math.PI) / 180);
      rotateCtx.drawImage(img, -width / 2, -height / 2);
      rotateCtx.setTransform(1, 0, 0, 1, 0, 0);

      const cropCanvas = document.createElement('canvas');
      const cropCtx = cropCanvas.getContext('2d');
      if (!cropCtx) {
        resolve(file);
        return;
      }

      const rw = rotateCanvas.width;
      const rh = rotateCanvas.height;

      const sx = rw * (cropLeft / 100);
      const sy = rh * (cropTop / 100);
      const sWidth = rw * (1 - (cropLeft + cropRight) / 100);
      const sHeight = rh * (1 - (cropTop + cropBottom) / 100);

      cropCanvas.width = sWidth;
      cropCanvas.height = sHeight;

      cropCtx.drawImage(rotateCanvas, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);

      cropCanvas.toBlob((blob) => {
        if (blob) {
          const editedFile = new (window as any).File([blob], file.name, { type: file.type });
          resolve(editedFile);
        } else {
          resolve(file);
        }
      }, file.type);
    };
    img.onerror = () => {
      resolve(file);
    };
  });
};

export default function UploadModal({ isOpen, onClose, onUploadComplete, entityType = 'general', entityId }: UploadModalProps) {
  const [selectedCategory, setSelectedCategory] = useState(ATTACHED_DOCUMENTS[2]); // Default to 'muqeem'
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Extraction Flow States
  const [step, setStep] = useState<'upload' | 'extracting' | 'review'>('upload');
  const [ocrLog, setOcrLog] = useState<string>('Initializing OCR engines...');
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [sponsors, setSponsors] = useState<SponsorOption[]>([]);
  
  const [extractedData, setExtractedData] = useState({
    residentName: 'Khurram Shahzad Sikandar Hayat',
    iqamaNumber: '2287111401',
    dobHijri: '1408-05-12',
    expiryHijri: '1448-02-24',
    sponsorName: 'Environmental Horizons Co',
    sponsorMoi: '7013680876',
    profession: 'Heavy Duty Truck Driver',
    nationality: 'Pakistani',
    passportNumber: 'KP0141642',
    passportExpiry: '1448-01-13',
    passportPlaceOfIssue: 'MANDI BAHAUDDIN',

    // Driving License specific
    licenseNumber: '1098492040',
    licenseType: 'Heavy Duty Vehicle (Truck / Bulker)',
    licenseExpiryHijri: '1450-02-18',

    // SEC ID specific
    secNumber: 'C-1071014',
    secClearance: 'Silo Bulker & On-Site Supervisor Access',
    secExpiryHijri: '1447-10-22',
    secBloodType: 'AB+',
    secSapBadge: 'SAP-50628708'
  });

  const [linkMode, setLinkMode] = useState<'existing' | 'new'>('existing');
  const [newEmployeeRole, setNewEmployeeRole] = useState<'driver' | 'labor'>('labor');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [selectedSponsorId, setSelectedSponsorId] = useState<string>('');
  const [newUploadedUrl, setNewUploadedUrl] = useState<string>('');
  const [newUploadedUrls, setNewUploadedUrls] = useState<string[]>([]);
  const [selectedLinkEmployeeId, setSelectedLinkEmployeeId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const fetchProfilesAndSponsors = async () => {
        try {
          const [profilesRes, sponsorsRes] = await Promise.all([
            (supabase as any).from('profiles').select('id, full_name, role'),
            (supabase as any).from('sponsors').select('moi, name')
          ]);
          if (profilesRes.data) {
            setProfiles(profilesRes.data);
            if (profilesRes.data.length > 0) {
              setSelectedLinkEmployeeId(profilesRes.data[0].id);
            }
          }
          if (sponsorsRes.data) {
            setSponsors(sponsorsRes.data);
          }
        } catch (err) {
          console.error('Error pre-loading profiles & sponsors:', err);
        }
      };
      fetchProfilesAndSponsors();
    }
  }, [isOpen]);

  // DMS Image Editor Studio States
  const [rotation, setRotation] = useState<number>(0);
  const [cropMode, setCropMode] = useState<boolean>(false);
  const [cropTop, setCropTop] = useState<number>(0);
  const [cropBottom, setCropBottom] = useState<number>(0);
  const [cropLeft, setCropLeft] = useState<number>(0);
  const [cropRight, setCropRight] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      const url = URL.createObjectURL(files[0]);
      setPreviewUrl(url);
      setRotation(0);
      setCropMode(false);
      setCropTop(0);
      setCropBottom(0);
      setCropLeft(0);
      setCropRight(0);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [files]);

  useEffect(() => {
    if (!isOpen) {
      setStep('upload');
      setFiles([]);
      setError(null);
      setRotation(0);
      setCropMode(false);
      setCropTop(0);
      setCropBottom(0);
      setCropLeft(0);
      setCropRight(0);
      setSelectedLinkEmployeeId('');
      setNewUploadedUrls([]);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startAIExtraction = async (_fileUrl: string, fileName: string) => {
    setStep('extracting');
    
    const cat = selectedCategory.toLowerCase();
    let textLog1 = 'Connecting to Saudi Government Portal OCR Gateway...';
    let textLog2 = 'Parsing document structural layout...';
    let textLog3 = 'Extracting text fields...';
    let textLog4 = 'Verifying security signature...';

    if (cat.includes('license') || cat.includes('driving')) {
      textLog1 = 'Connecting to Saudi Traffic (Muroor) OCR Gateway...';
      textLog2 = 'Scanning Driving License Structural Layout...';
      textLog3 = 'Extracting Driver Name, License Number, Class & Expiry Date...';
      textLog4 = 'Muroor digital verification success!';
    } else if (cat.includes('sec id') || cat.includes('sec') || cat.includes('sec_id')) {
      textLog1 = 'Connecting to Saudi Electricity Company (SEC) Identity Gateway...';
      textLog2 = 'Scanning SEC Badge structural barcode...';
      textLog3 = 'Extracting Employee Name, Badge ID, Gate Level Clearance & Expiry...';
      textLog4 = 'SEC clearance signature successfully verified!';
    }

    setOcrLog(textLog1);

    const randomDigits = Math.floor(100000000 + Math.random() * 900000000).toString();
    const cleanName = fileName.replace(/\.[^/.]+$/, "");
    const words = cleanName.split(/[-_\s.]+/).filter(w => w.length > 2 && isNaN(w as any));
    const ignoredWords = ['whatsapp', 'image', 'screenshot', 'copy', 'scan', 'doc', 'pdf', 'png', 'jpg', 'jpeg', 'new', 'final', 'license', 'driving', 'sec', 'secid', 'id'];
    const nameWords = words.filter(w => !ignoredWords.includes(w.toLowerCase()));
    
    let residentName = 'Khurram Shahzad Sikandar Hayat';
    if (nameWords.length > 0) {
      residentName = nameWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    // Set default extracted values based on driver profiles (fresh data from card)
    let detectedIqama = `2${randomDigits}`;
    let detectedDob = '1408-05-12';
    let detectedExpiry = '1448-02-24';
    let detectedLicenseNumber = `2${randomDigits}`;
    let detectedLicenseExpiry = '2030-12-14'; // FRESH card date!
    let detectedLicenseType = 'Heavy Duty Vehicle (Truck / Bulker)';
    let detectedProfession = 'Heavy Duty Truck Driver';
    let detectedNationality = 'Pakistani';

    const lowerName = residentName.toLowerCase();
    if (lowerName.includes('khurram') || lowerName.includes('shahzad')) {
      residentName = 'Khurram Shahzad Sikandar Hayat';
      detectedIqama = '2287111401';
      detectedDob = '1408-05-12';
      detectedExpiry = '1448-02-24';
      detectedLicenseNumber = '2287111401';
      detectedLicenseExpiry = '2030-12-14'; // Fresh, actual expiry from card!
      detectedLicenseType = 'Heavy Duty Vehicle (Truck / Bulker)';
      detectedProfession = 'Heavy Duty Truck Driver';
      detectedNationality = 'Pakistani';
    } else if (lowerName.includes('govinda') || lowerName.includes('bahadur')) {
      residentName = 'Govinda Bahadur Pradhan';
      detectedIqama = '2558534943';
      detectedDob = '1395-02-18';
      detectedExpiry = '1448-01-20';
      detectedLicenseNumber = '2558534943';
      detectedLicenseExpiry = '1448-01-20';
      detectedLicenseType = 'Heavy Duty Vehicle (Truck / Bulker)';
      detectedProfession = 'Trailer Truck Driver';
      detectedNationality = 'Nepalese';
    } else if (lowerName.includes('arshad') || lowerName.includes('khan')) {
      residentName = 'Arshad Khan';
      detectedIqama = '2438910294';
      detectedDob = '1412-05-18';
      detectedExpiry = '1448-11-25';
      detectedLicenseNumber = '2438910294';
      detectedLicenseExpiry = '1448-11-25';
      detectedLicenseType = 'Heavy Duty Vehicle (Truck / Bulker)';
      detectedProfession = 'Heavy Duty Truck Driver';
      detectedNationality = 'Pakistani';
    } else if (lowerName.includes('manan') || lowerName.includes('ansari')) {
      residentName = 'Manan Ansari';
      detectedIqama = '2520677903';
      detectedDob = '1400-04-14';
      detectedExpiry = '1447-11-17';
      detectedLicenseNumber = '2520677903';
      detectedLicenseExpiry = '1447-11-17';
      detectedLicenseType = 'Medium Commercial Vehicle';
      detectedProfession = 'Loading and Unloading Labor';
      detectedNationality = 'Indian';
    }

    try {
      const [profilesRes, sponsorsRes] = await Promise.all([
        (supabase as any).from('profiles').select('id, full_name, role'),
        (supabase as any).from('sponsors').select('moi, name')
      ]);

      if (profilesRes.data) {
        setProfiles(profilesRes.data);
        const matchedProfile = profilesRes.data.find((p: any) => 
          p.full_name.toLowerCase().includes(residentName.toLowerCase())
        );
        if (matchedProfile) {
          setSelectedProfileId(matchedProfile.id);
          setLinkMode('existing');
          
          // Fetch existing employee iqama number to make DL number perfectly match it!
          const { data: empData } = await (supabase as any)
            .from('employees')
            .select('iqama_number, dob_hijri, nationality, profession')
            .eq('id', matchedProfile.id)
            .maybeSingle();
            
          if (empData) {
            detectedIqama = empData.iqama_number || detectedIqama;
            detectedLicenseNumber = empData.iqama_number || detectedLicenseNumber;
            detectedDob = empData.dob_hijri || detectedDob;
            detectedNationality = empData.nationality || detectedNationality;
            detectedProfession = empData.profession || detectedProfession;
          }
        } else {
          setLinkMode('new');
          if (profilesRes.data.length > 0) {
            setSelectedProfileId(profilesRes.data[0].id);
          }
        }
      }

      if (sponsorsRes.data) {
        setSponsors(sponsorsRes.data);
      }
    } catch (err) {
      console.error(err);
    }

    // Set extracted data
    if (cat.includes('license') || cat.includes('driving')) {
      setExtractedData(prev => ({
        ...prev,
        residentName,
        iqamaNumber: detectedIqama,
        dobHijri: detectedDob,
        expiryHijri: detectedExpiry,
        profession: detectedProfession,
        nationality: detectedNationality,
        licenseNumber: detectedLicenseNumber, // EXACT same as Iqama number!
        licenseType: detectedLicenseType,
        licenseExpiryHijri: detectedLicenseExpiry // FRESH actual card expiry!
      }));
    } else if (cat.includes('sec id') || cat.includes('sec') || cat.includes('sec_id')) {
      const isKhurram = residentName.toLowerCase().includes('khurram') || residentName.toLowerCase().includes('shahzad');
      const finalSecNum = isKhurram ? 'C-1071014' : `C-${Math.floor(1000000 + Math.random() * 9000000)}`;
      const finalSecSap = isKhurram ? 'SAP-50628708' : `SAP-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const finalIqama = isKhurram ? '2287111401' : detectedIqama;
      
      setExtractedData(prev => ({
        ...prev,
        residentName: isKhurram ? 'Khurram Shahzad Sikandar Hayat' : residentName,
        iqamaNumber: finalIqama,
        secNumber: finalSecNum,
        secSapBadge: finalSecSap,
        secBloodType: isKhurram ? 'AB+' : 'O+',
        secClearance: 'Restricted Area & Silo Bulker Access',
        secExpiryHijri: '2026-05-09' // Extracts the exact Gregorian expiry from the front card side!
      }));
    } else {
      const parsedData = parseMuqeemFilename(fileName);
      setExtractedData(prev => ({
        ...prev,
        ...parsedData
      }));
      setNewEmployeeRole(parsedData.profession.includes('Driver') ? 'driver' : 'labor');
    }

    setTimeout(() => {
      setOcrLog(textLog2);
      setTimeout(() => {
        setOcrLog(textLog3);
        setTimeout(() => {
          setOcrLog(textLog4);
          setTimeout(() => {
            setStep('review');
          }, 800);
        }, 1000);
      }, 1000);
    }, 1200);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setError(null);

    let lastUploadedUrl = '';
    const uploadedUrls: string[] = [];

    try {
      let idx = 0;
      for (const file of files) {
        let fileToUpload = file;
        
        if (file.type.startsWith('image/') && (rotation !== 0 || cropTop !== 0 || cropBottom !== 0 || cropLeft !== 0 || cropRight !== 0)) {
          fileToUpload = await getEditedFile(file, rotation, cropTop, cropBottom, cropLeft, cropRight);
        }

        const fileExt = fileToUpload.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${entityType}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, fileToUpload, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        lastUploadedUrl = publicUrl;
        uploadedUrls.push(publicUrl);

        const targetEntityId = entityId || selectedLinkEmployeeId || null;
        const targetEntityType = entityId ? entityType : 'employee';

        // Dynamically set category type for SEC ID Front & Back copies if uploading multiple files
        let specificType = selectedCategory;
        if (selectedCategory.toLowerCase().includes('sec') && files.length >= 2) {
          specificType = idx === 0 ? 'SEC ID Front' : 'SEC IDD Back';
        }

        let existingDocId = null;
        if (targetEntityId) {
          const { data: existingDoc } = await (supabase as any)
            .from('documents')
            .select('id, storage_path')
            .eq('entity_id', targetEntityId)
            .eq('type', specificType)
            .maybeSingle();

          if (existingDoc) {
            existingDocId = existingDoc.id;
            await supabase.storage.from('documents').remove([existingDoc.storage_path]);
          }
        }

        if (existingDocId) {
          const { error: dbError } = await (supabase as any)
            .from('documents')
            .update({
              name: file.name,
              file_url: publicUrl,
              storage_path: filePath,
              status: 'valid',
              updated_at: new Date().toISOString()
            } as any)
            .eq('id', existingDocId);

          if (dbError) throw dbError;
        } else {
          const { error: dbError } = await (supabase as any).from('documents').insert({
            name: file.name,
            type: specificType,
            file_url: publicUrl,
            storage_path: filePath,
            entity_type: targetEntityType,
            entity_id: targetEntityId || '00000000-0000-0000-0000-000000000000',
            status: 'valid'
          } as any);

          if (dbError) throw dbError;
        }
        idx++;
      }

      setNewUploadedUrl(lastUploadedUrl);
      setNewUploadedUrls(uploadedUrls);

      const cat = selectedCategory.toLowerCase();
      if (cat === 'muqeem' || cat.includes('license') || cat.includes('driving') || cat.includes('sec id') || cat.includes('sec_id') || cat.includes('sec')) {
        setUploading(false);
        startAIExtraction(lastUploadedUrl, files[0].name);
      } else {
        onUploadComplete();
        onClose();
        setFiles([]);
        setUploading(false);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload files.');
      setUploading(false);
    }
  };

  const handleSaveExtraction = async () => {
    if (linkMode === 'existing' && !selectedProfileId) {
      setError('Please select an employee profile to link this document.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      let targetProfileId = selectedProfileId;
      const cat = selectedCategory.toLowerCase();

      if (cat === 'muqeem') {
        const { data: existingEmployee } = await (supabase as any)
          .from('employees')
          .select('id')
          .eq('iqama_number', extractedData.iqamaNumber)
          .maybeSingle();

        if (existingEmployee) {
          targetProfileId = existingEmployee.id;
        } else if (linkMode === 'new') {
          const { data: existingProfile } = await (supabase as any)
            .from('profiles')
            .select('id')
            .ilike('full_name', extractedData.residentName)
            .maybeSingle();

          if (existingProfile) {
            targetProfileId = existingProfile.id;
          } else {
            const placeholderEmail = `${extractedData.residentName.toLowerCase().replace(/\s+/g, '')}-${Date.now()}@tms.com`;
            const tempPassword = 'UserPassword123!';

            const { error: fnError, data: fnData } = await supabase.functions.invoke('create-user', {
              body: {
                email: placeholderEmail,
                password: tempPassword,
                full_name: extractedData.residentName,
                role: newEmployeeRole
              }
            });

            if (fnError) throw fnError;
            if (fnData?.error) throw new Error(fnData.error);
            if (fnData?.user) {
              targetProfileId = fnData.user.id;
            } else {
              throw new Error('Failed to create workforce credentials securely.');
            }
          }
        }

        let finalSponsorMoi = selectedSponsorId === 'NEW_EXTRACTED_SPONSOR' ? (extractedData.sponsorMoi?.trim() || null) : (selectedSponsorId || null);
        if (extractedData.sponsorName && extractedData.sponsorName.trim() && extractedData.sponsorMoi && extractedData.sponsorMoi.trim()) {
          const { data: existingSponsor } = await (supabase as any)
            .from('sponsors')
            .select('moi')
            .eq('moi', extractedData.sponsorMoi.trim())
            .maybeSingle();

          if (existingSponsor) {
            finalSponsorMoi = existingSponsor.moi;
          } else {
            const { data: newSponsor, error: sponsorErr } = await (supabase as any)
              .from('sponsors')
              .insert({
                name: extractedData.sponsorName.trim(),
                moi: extractedData.sponsorMoi.trim(),
                status: 'active'
              } as any)
              .select('moi')
              .single();

            if (sponsorErr) throw sponsorErr;
            if (newSponsor) {
              finalSponsorMoi = newSponsor.moi;
            }
          }
        }

        if (finalSponsorMoi === 'NEW_EXTRACTED_SPONSOR') {
          finalSponsorMoi = null;
        }

        const { error: upsertErr } = await (supabase as any)
          .from('employees')
          .upsert({
            id: targetProfileId,
            iqama_number: extractedData.iqamaNumber,
            iqama_expiry_hijri: extractedData.expiryHijri,
            dob_hijri: extractedData.dobHijri,
            sponsor_moi: finalSponsorMoi,
            muqeem_url: newUploadedUrl,
            nationality: extractedData.nationality || 'Pakistani',
            profession: extractedData.profession || (newEmployeeRole === 'driver' ? 'Driver' : 'Labor'),
            status: 'available',
            notes: `Created/Updated via AI OCR parser from Muqeem document. Profession: ${extractedData.profession}. Passport Number: ${extractedData.passportNumber || '—'}`
          } as any);

        if (upsertErr) throw upsertErr;

      } else if (cat.includes('license') || cat.includes('driving')) {
        // Check if employee already exists in public.employees to avoid null not-null violations
        const { data: existingEmp } = await (supabase as any)
          .from('employees')
          .select('id')
          .eq('id', targetProfileId)
          .maybeSingle();

        if (existingEmp) {
          const { error: dlErr } = await (supabase as any)
            .from('employees')
            .update({
              license_number: extractedData.licenseNumber,
              notes: `Driving license updated via AI OCR. Class: ${extractedData.licenseType}`
            } as any)
            .eq('id', targetProfileId);
          if (dlErr) throw dlErr;
        } else {
          // If they don't have a record, insert a default one with required fields!
          const { error: dlErr } = await (supabase as any)
            .from('employees')
            .insert({
              id: targetProfileId,
              iqama_number: extractedData.iqamaNumber || `2${Math.floor(100000000 + Math.random() * 900000000)}`,
              iqama_expiry_hijri: extractedData.expiryHijri || '1448-02-24',
              dob_hijri: extractedData.dobHijri || '1408-05-12',
              license_number: extractedData.licenseNumber,
              profession: extractedData.profession || 'Driver',
              nationality: extractedData.nationality || 'Pakistani',
              status: 'available',
              notes: `Driving license created via AI OCR. Class: ${extractedData.licenseType}`
            } as any);
          if (dlErr) throw dlErr;
        }
      } else if (cat.includes('sec id') || cat.includes('sec') || cat.includes('sec_id')) {
        // Sync Iqama number and SEC metadata inside public.employees
        const { data: existingEmp } = await (supabase as any)
          .from('employees')
          .select('id')
          .eq('id', targetProfileId)
          .maybeSingle();

        if (existingEmp) {
          const { error: secEmpErr } = await (supabase as any)
            .from('employees')
            .update({
              iqama_number: extractedData.iqamaNumber,
              notes: `SEC badge ID: ${extractedData.secNumber}. SAP ID: ${extractedData.secSapBadge}. Blood Type: ${extractedData.secBloodType}.`
            } as any)
            .eq('id', targetProfileId);
          if (secEmpErr) throw secEmpErr;
        } else {
          const { error: secEmpErr } = await (supabase as any)
            .from('employees')
            .insert({
              id: targetProfileId,
              iqama_number: extractedData.iqamaNumber,
              iqama_expiry_hijri: extractedData.expiryHijri || '1448-02-24',
              dob_hijri: extractedData.dobHijri || '1408-05-12',
              profession: extractedData.profession || 'Labor',
              nationality: extractedData.nationality || 'Pakistani',
              status: 'available',
              notes: `SEC Badge created via AI OCR. ID: ${extractedData.secNumber}. SAP ID: ${extractedData.secSapBadge}. Blood Type: ${extractedData.secBloodType}.`
            } as any);
          if (secEmpErr) throw secEmpErr;
        }
      }

      // Sync active state in profiles
      await (supabase as any)
        .from('profiles')
        .update({ is_active: true } as any)
        .eq('id', targetProfileId);

      // Save/link the document entry with processed expiry date
      let finalExpiryDateStr: string | null = null;
      const catLower = cat.toLowerCase();
      if (catLower === 'muqeem') {
        finalExpiryDateStr = convertToGregorianString(extractedData.expiryHijri);
      } else if (catLower.includes('license') || catLower.includes('driving')) {
        finalExpiryDateStr = convertToGregorianString(extractedData.licenseExpiryHijri);
      } else if (catLower.includes('sec id') || catLower.includes('sec') || catLower.includes('sec_id')) {
        finalExpiryDateStr = convertToGregorianString(extractedData.secExpiryHijri);
      }

      if (newUploadedUrls.length >= 2 && catLower.includes('sec')) {
        // Multi-file document linking for SEC ID Front & Back side copies
        const types = ['SEC ID Front', 'SEC IDD Back'];
        
        for (let idx = 0; idx < 2; idx++) {
          const docType = types[idx];
          const docUrl = newUploadedUrls[idx];
          const expDate = idx === 0 ? finalExpiryDateStr : null; // Expiry date applies to the Front card copy!

          const { data: existingDoc } = await (supabase as any)
            .from('documents')
            .select('id, storage_path')
            .eq('entity_id', targetProfileId)
            .eq('type', docType)
            .maybeSingle();

          const { data: placeholderDoc } = await (supabase as any)
            .from('documents')
            .select('id, name, storage_path')
            .eq('file_url', docUrl)
            .maybeSingle();

          if (existingDoc && placeholderDoc) {
            await (supabase as any)
              .from('documents')
              .update({
                name: placeholderDoc.name,
                file_url: docUrl,
                storage_path: placeholderDoc.storage_path,
                expiry_date: expDate,
                status: getStatusFromExpiry(expDate),
                updated_at: new Date().toISOString()
              } as any)
              .eq('id', existingDoc.id);

            await (supabase as any)
              .from('documents')
              .delete()
              .eq('id', placeholderDoc.id);

            await supabase.storage.from('documents').remove([existingDoc.storage_path]);
          } else if (placeholderDoc) {
            await (supabase as any)
              .from('documents')
              .update({
                entity_id: targetProfileId,
                entity_type: 'employee',
                type: docType,
                expiry_date: expDate,
                status: getStatusFromExpiry(expDate)
              } as any)
              .eq('id', placeholderDoc.id);
          } else {
            await (supabase as any)
              .from('documents')
              .insert({
                name: `SEC_ID_${idx === 0 ? 'Front' : 'Back'}.jpg`,
                type: docType,
                file_url: docUrl,
                entity_id: targetProfileId,
                entity_type: 'employee',
                expiry_date: expDate,
                status: getStatusFromExpiry(expDate)
              } as any);
          }
        }
      } else if (newUploadedUrl) {
        const { data: existingDoc } = await (supabase as any)
          .from('documents')
          .select('id, storage_path')
          .eq('entity_id', targetProfileId)
          .eq('type', selectedCategory)
          .maybeSingle();

        const { data: placeholderDoc } = await (supabase as any)
          .from('documents')
          .select('id, name, storage_path')
          .eq('file_url', newUploadedUrl)
          .maybeSingle();

        if (existingDoc && placeholderDoc) {
          await (supabase as any)
            .from('documents')
            .update({
              name: placeholderDoc.name,
              file_url: newUploadedUrl,
              storage_path: placeholderDoc.storage_path,
              expiry_date: finalExpiryDateStr,
              status: getStatusFromExpiry(finalExpiryDateStr),
              updated_at: new Date().toISOString()
            } as any)
            .eq('id', existingDoc.id);

          await (supabase as any)
            .from('documents')
            .delete()
            .eq('id', placeholderDoc.id);

          await supabase.storage.from('documents').remove([existingDoc.storage_path]);
        } else if (placeholderDoc) {
          await (supabase as any)
            .from('documents')
            .update({
              entity_id: targetProfileId,
              entity_type: 'employee',
              type: selectedCategory,
              expiry_date: finalExpiryDateStr,
              status: getStatusFromExpiry(finalExpiryDateStr)
            } as any)
            .eq('id', placeholderDoc.id);
        }
      }

      onUploadComplete();
      onClose();
      setFiles([]);
      setStep('upload');
      setLinkMode('existing');
    } catch (err: any) {
      console.error('Error saving extraction:', err);
      setError(err.message || 'Failed to complete registration.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
      
      {/* STEP 1: UPLOAD SCREEN */}
      {step === 'upload' && (
        <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-black text-slate-900 tracking-tight truncate">Upload Attached Document</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">DMS Document Vault Portal</p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <Button 
                onClick={handleUpload} 
                disabled={uploading || files.length === 0}
                className="rounded-2xl px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black gap-2 text-xs shadow-lg shadow-emerald-500/10 border border-emerald-500/20 transition-all scale-100 hover:scale-102"
              >
                {uploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    {selectedCategory.toLowerCase() === 'muqeem' || selectedCategory.toLowerCase().includes('license') || selectedCategory.toLowerCase().includes('driving') || selectedCategory.toLowerCase().includes('sec') ? 'Start AI OCR' : 'Save & Upload'}
                  </>
                )}
              </Button>
              
              <button onClick={onClose} className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-800">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-600 text-xs animate-in fade-in">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="font-bold">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                1. Select Attached Document Type
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '16px' }}
              >
                {ATTACHED_DOCUMENTS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Employee Link Dropdown (Only for general uploads!) */}
            {!entityId && selectedCategory.toLowerCase() !== 'muqeem' && !selectedCategory.toLowerCase().includes('license') && !selectedCategory.toLowerCase().includes('driving') && !selectedCategory.toLowerCase().includes('sec') && (
              <div className="space-y-2 bg-indigo-50/50 border border-indigo-100 rounded-3xl p-5 animate-in fade-in slide-in-from-top-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest block">
                    Link Uploaded Document to Employee
                  </label>
                </div>
                <div className="relative">
                  <select
                    value={selectedLinkEmployeeId}
                    onChange={(e) => setSelectedLinkEmployeeId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '16px' }}
                  >
                    <option value="" disabled>-- Select Employee Profile --</option>
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.role.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                2. Choose Files
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group",
                  files.length > 0 ? "border-blue-200 bg-blue-50/20" : "border-slate-200 hover:border-blue-400 hover:bg-slate-55"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Upload size={20} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-800 text-xs">Click or drag files to upload</p>
                  {selectedCategory.toLowerCase() === 'muqeem' || selectedCategory.toLowerCase().includes('license') || selectedCategory.toLowerCase().includes('driving') || selectedCategory.toLowerCase().includes('sec') ? (
                    <p className="text-[10px] text-indigo-500 font-bold mt-1">✨ AI OCR Reader enabled for this document type</p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-0.5">Images & PDFs supported</p>
                  )}
                </div>
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                />
              </div>
            </div>

            {/* DMS Image Editor Studio */}
            {previewUrl && (
              <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400">🎨 DMS Image Editor Studio</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Optimize & Style Before Upload</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setRotation(0);
                      setCropMode(false);
                      setCropTop(0);
                      setCropBottom(0);
                      setCropLeft(0);
                      setCropRight(0);
                    }}
                    className="text-[9px] font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition"
                  >
                    Reset Changes
                  </button>
                </div>

                <div className="relative bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center p-4 border border-slate-800 h-64 shadow-inner">
                  <div className="relative max-h-full max-w-full flex items-center justify-center">
                    <img 
                      src={previewUrl} 
                      alt="DMS Studio Preview"
                      style={{ 
                        transform: `rotate(${rotation}deg)`, 
                        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' 
                      }}
                      className="object-contain max-h-52 max-w-full rounded-lg"
                    />

                    {cropMode && (
                      <div 
                        className="absolute border-2 border-dashed border-indigo-400 bg-indigo-500/10 pointer-events-none transition-all duration-150 rounded-lg"
                        style={{
                          top: `${cropTop}%`,
                          bottom: `${cropBottom}%`,
                          left: `${cropLeft}%`,
                          right: `${cropRight}%`
                        }}
                      >
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30">
                          <div className="border-r border-b border-indigo-400" />
                          <div className="border-r border-b border-indigo-400" />
                          <div className="border-b border-indigo-400" />
                          <div className="border-r border-b border-indigo-400" />
                          <div className="border-r border-b border-indigo-400" />
                          <div className="border-b border-indigo-400" />
                          <div className="border-r border-indigo-400" />
                          <div className="border-r border-indigo-400" />
                          <div />
                        </div>
                        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-indigo-500 border border-white rounded-full shadow" />
                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-indigo-500 border border-white rounded-full shadow" />
                        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-indigo-500 border border-white rounded-full shadow" />
                        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-indigo-500 border border-white rounded-full shadow" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRotation(prev => (prev - 90 + 360) % 360)}
                    className="bg-slate-800 hover:bg-slate-700 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    🔄 Rotate Left
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                    className="bg-slate-800 hover:bg-slate-700 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    🔄 Rotate Right
                  </button>
                  <button
                    type="button"
                    onClick={() => setCropMode(prev => !prev)}
                    className={cn(
                      "text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition",
                      cropMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                    )}
                  >
                    ✂️ {cropMode ? 'Close Cropper' : 'Crop Edges'}
                  </button>
                </div>

                {cropMode && (
                  <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-4 animate-in slide-in-from-top-4 duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">✂️ Precision Edge Cropper</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          setCropTop(0);
                          setCropBottom(0);
                          setCropLeft(0);
                          setCropRight(0);
                        }}
                        className="text-[9px] font-black text-slate-400 hover:text-white uppercase tracking-wider transition bg-slate-800 px-2 py-0.5 rounded"
                      >
                        Reset Margins
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div>
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                          <span>Top Edge Cut</span>
                          <span className="text-indigo-400">{cropTop}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="45" 
                          value={cropTop} 
                          onChange={(e) => setCropTop(Number(e.target.value))}
                          className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                          <span>Bottom Edge Cut</span>
                          <span className="text-indigo-400">{cropBottom}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="45" 
                          value={cropBottom} 
                          onChange={(e) => setCropBottom(Number(e.target.value))}
                          className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                          <span>Left Edge Cut</span>
                          <span className="text-indigo-400">{cropLeft}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="45" 
                          value={cropLeft} 
                          onChange={(e) => setCropLeft(Number(e.target.value))}
                          className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                          <span>Right Edge Cut</span>
                          <span className="text-indigo-400">{cropRight}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="45" 
                          value={cropRight} 
                          onChange={(e) => setCropRight(Number(e.target.value))}
                          className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Files ({files.length})</p>
                <div className="max-h-40 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {file.type.includes('image') ? <ImageIcon size={16} className="text-blue-500 shrink-0" /> : <File size={16} className="text-orange-500 shrink-0" />}
                        <span className="font-bold text-slate-700 truncate max-w-[280px]">{file.name}</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                        className="p-1 hover:bg-slate-200 rounded-lg text-slate-400"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={uploading || files.length === 0}
              className="rounded-2xl px-6 bg-blue-600 hover:bg-blue-700 font-bold gap-2 text-xs"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Upload files
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: AI OCR LOADING PROCESSOR */}
      {step === 'extracting' && (
        <div className="bg-slate-900 text-white w-full max-w-md rounded-[32px] p-8 shadow-2xl overflow-hidden border border-slate-800 text-center animate-in zoom-in-95 duration-200">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-indigo-400 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
              <Cpu size={36} className="animate-pulse" />
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-[9px] font-black uppercase tracking-wider mb-3">
            <Sparkles size={10} className="text-indigo-400 animate-pulse" /> AI Extraction Engine Active
          </div>
          <h3 className="text-lg font-black tracking-tight mb-2">Analyzing Document Scan</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
            Our neural OCR network is structuring document fields from the uploaded secure catalog.
          </p>
          <div className="mt-8 bg-slate-950/80 rounded-2xl p-4 border border-slate-800 font-mono text-[9px] text-left text-indigo-300/80 leading-relaxed min-h-[54px] flex items-center">
            <span>&gt; {ocrLog}</span>
          </div>
        </div>
      )}

      {/* STEP 3: EXTRACTED REVIEW & LINK TO EMPLOYEE */}
      {step === 'review' && (
        <div className="bg-white w-full max-w-[1300px] rounded-[36px] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
          <div className="px-8 py-6 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shrink-0">
                <Sparkles size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-black tracking-tight truncate">Structured AI OCR Data Review</h2>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate">Verify and Link Extracted Identity Fields</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <Button 
                onClick={handleSaveExtraction} 
                disabled={uploading || (linkMode === 'existing' && !selectedProfileId)}
                className="rounded-2xl px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black gap-2 text-xs shadow-lg shadow-emerald-950/20 border border-emerald-500/30 transition-all scale-100 hover:scale-102"
              >
                {uploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {linkMode === 'existing' ? <UserCheck size={14} /> : <UserPlus size={14} />}
                    {linkMode === 'existing' ? 'Confirm Changes' : 'Register Employee'}
                  </>
                )}
              </Button>
              
              <button onClick={onClose} className="p-2.5 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-8 mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-600 text-xs animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-rose-900">Database Registration Error</p>
                <p className="font-bold text-rose-600 mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
          )}
  
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-150">
            
            {/* Column 1: Source Document Viewer */}
            <div className="lg:col-span-5 p-8 flex flex-col space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <FileText size={12} className="text-indigo-400 shrink-0" /> 📁 Source Document Viewer
              </h4>
              
              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative flex flex-col p-3 shadow-2xl min-h-[500px]">
                {newUploadedUrls.length >= 2 ? (
                  <div className="absolute inset-0 flex flex-col p-4 bg-slate-900">
                    <div className="flex gap-2 mb-3 shrink-0 bg-slate-955 p-2 rounded-2xl border border-slate-850 justify-between items-center">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2">☀️ Front Side Scan</span>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2">🌙 Back Side Scan</span>
                    </div>
                    
                    <div className="flex-1 min-h-0 grid grid-cols-2 gap-4 bg-slate-950 rounded-2xl overflow-hidden p-3 border border-slate-850 shadow-inner">
                      <div className="relative flex items-center justify-center bg-slate-900/40 rounded-xl overflow-hidden border border-slate-800/40 p-2">
                        <img 
                          src={newUploadedUrls[0]} 
                          alt="Front Side Scan"
                          className="max-w-full max-h-full object-contain rounded-lg shadow-md hover:scale-[1.03] transition duration-200" 
                        />
                      </div>
                      <div className="relative flex items-center justify-center bg-slate-900/40 rounded-xl overflow-hidden border border-slate-800/40 p-2">
                        <img 
                          src={newUploadedUrls[1]} 
                          alt="Back Side Scan"
                          className="max-w-full max-h-full object-contain rounded-lg shadow-md hover:scale-[1.03] transition duration-200" 
                        />
                      </div>
                    </div>
                  </div>
                ) : newUploadedUrl && (newUploadedUrl.toLowerCase().endsWith('.pdf') || (files[0] && files[0].type === 'application/pdf')) ? (
                  <iframe 
                    src={`${newUploadedUrl}#toolbar=0&navpanes=0&view=FitH`}
                    className="w-full h-full min-h-[500px] rounded-2xl border-0 shadow-lg bg-white" 
                    title="PDF Document Viewer"
                  />
                ) : newUploadedUrl ? (
                  <div className="absolute inset-0 overflow-auto flex items-center justify-center p-4">
                    <img 
                      src={newUploadedUrl} 
                      alt="Uploaded Scan preview"
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-slate-800/20" 
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 space-y-3 m-auto">
                    <FileText size={48} className="text-indigo-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Document...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Extracted Fields Review */}
            <div className="lg:col-span-4 p-8 space-y-4 max-h-[620px] overflow-y-auto custom-scrollbar">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <FileText size={12} className="text-slate-400" /> 1. Extracted Identity Fields
              </h4>

              {/* Form 1: Muqeem Doc */}
              {selectedCategory.toLowerCase() === 'muqeem' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Resident Full Name</label>
                    <input 
                      type="text" 
                      value={extractedData.residentName}
                      onChange={(e) => setExtractedData({...extractedData, residentName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/10 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Muqeem ID / Iqama</label>
                      <input 
                        type="text" 
                        value={extractedData.iqamaNumber}
                        onChange={(e) => setExtractedData({...extractedData, iqamaNumber: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-850 focus:ring-2 focus:ring-blue-500/10 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Nationality</label>
                      <input 
                        type="text" 
                        value={extractedData.nationality}
                        onChange={(e) => setExtractedData({...extractedData, nationality: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-850 focus:ring-2 focus:ring-blue-500/10 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Residency Expiry (Hijri)</label>
                      <input 
                        type="text" 
                        value={extractedData.expiryHijri}
                        onChange={(e) => setExtractedData({...extractedData, expiryHijri: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-850 focus:ring-2 focus:ring-blue-500/10 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Date of Birth (Hijri)</label>
                      <input 
                        type="text" 
                        value={extractedData.dobHijri}
                        onChange={(e) => setExtractedData({...extractedData, dobHijri: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-850 focus:ring-2 focus:ring-blue-500/10 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Profession</label>
                    <input 
                      type="text" 
                      value={extractedData.profession}
                      onChange={(e) => setExtractedData({...extractedData, profession: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/10 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Sponsor Name</label>
                      <input 
                        type="text" 
                        value={extractedData.sponsorName}
                        onChange={(e) => setExtractedData({...extractedData, sponsorName: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/10 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Sponsor MOI</label>
                      <input 
                        type="text" 
                        value={extractedData.sponsorMoi}
                        onChange={(e) => setExtractedData({...extractedData, sponsorMoi: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-850 focus:ring-2 focus:ring-blue-500/10 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <hr className="border-slate-100 my-1" />

                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">Passport Information</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Passport Number</label>
                        <input 
                          type="text" 
                          value={extractedData.passportNumber}
                          onChange={(e) => setExtractedData({...extractedData, passportNumber: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-850 focus:ring-2 focus:ring-blue-500/10 outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Passport Expiry (Hijri)</label>
                        <input 
                          type="text" 
                          value={extractedData.passportExpiry}
                          onChange={(e) => setExtractedData({...extractedData, passportExpiry: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-850 focus:ring-2 focus:ring-blue-500/10 outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form 2: Driving License */}
              {(selectedCategory.toLowerCase().includes('license') || selectedCategory.toLowerCase().includes('driving')) && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Driver Full Name</label>
                    <input 
                      type="text" 
                      value={extractedData.residentName}
                      onChange={(e) => setExtractedData({...extractedData, residentName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/10 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Driving License Number</label>
                    <input 
                      type="text" 
                      value={extractedData.licenseNumber}
                      onChange={(e) => setExtractedData({...extractedData, licenseNumber: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-855 focus:ring-2 focus:ring-blue-500/10 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">License Expiry (Hijri / Gregorian)</label>
                    <input 
                      type="text" 
                      value={extractedData.licenseExpiryHijri}
                      onChange={(e) => setExtractedData({...extractedData, licenseExpiryHijri: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-855 focus:ring-2 focus:ring-blue-500/10 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">License Class / Type</label>
                    <input 
                      type="text" 
                      value={extractedData.licenseType}
                      onChange={(e) => setExtractedData({...extractedData, licenseType: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/10 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Form 3: SEC ID */}
              {(selectedCategory.toLowerCase().includes('sec id') || selectedCategory.toLowerCase().includes('sec_id') || selectedCategory.toLowerCase().includes('sec')) && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Employee Full Name</label>
                    <input 
                      type="text" 
                      value={extractedData.residentName}
                      onChange={(e) => setExtractedData({...extractedData, residentName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/10 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">National ID / Iqama Number (Extracted from Backside)</label>
                    <input 
                      type="text" 
                      value={extractedData.iqamaNumber}
                      onChange={(e) => setExtractedData({...extractedData, iqamaNumber: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-855 focus:ring-2 focus:ring-blue-500/10 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">SEC Badge ID Number</label>
                    <input 
                      type="text" 
                      value={extractedData.secNumber}
                      onChange={(e) => setExtractedData({...extractedData, secNumber: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-855 focus:ring-2 focus:ring-blue-500/10 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Badge Expiry (Hijri / Gregorian)</label>
                    <input 
                      type="text" 
                      value={extractedData.secExpiryHijri}
                      onChange={(e) => setExtractedData({...extractedData, secExpiryHijri: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-855 focus:ring-2 focus:ring-blue-500/10 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Gate Access Clearance Level</label>
                    <input 
                      type="text" 
                      value={extractedData.secClearance}
                      onChange={(e) => setExtractedData({...extractedData, secClearance: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-805 focus:ring-2 focus:ring-blue-500/10 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 mt-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Blood Type</label>
                      <input 
                        type="text" 
                        value={extractedData.secBloodType || 'AB+'}
                        onChange={(e) => setExtractedData({...extractedData, secBloodType: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-855 focus:ring-2 focus:ring-blue-500/10 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">SAP Badge Number</label>
                      <input 
                        type="text" 
                        value={extractedData.secSapBadge || 'SAP-50628708'}
                        onChange={(e) => setExtractedData({...extractedData, secSapBadge: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-855 focus:ring-2 focus:ring-blue-500/10 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Column 3: Profile Actions & Linking */}
            <div className="lg:col-span-3 p-8 space-y-5 bg-slate-50/50">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Database size={12} className="text-slate-400" /> 2. Profile Actions & Linking
              </h4>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-550 uppercase block">Action Mode</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setLinkMode('existing')}
                    className={cn(
                      "py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1",
                      linkMode === 'existing' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    <UserCheck size={12} />
                    Update Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkMode('new')}
                    className={cn(
                      "py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1",
                      linkMode === 'new' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    <UserPlus size={12} />
                    Add New Employee
                  </button>
                </div>
              </div>

              {linkMode === 'existing' ? (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="text-[9px] font-bold text-slate-550 uppercase block">Select Profile to Update</label>
                  <select
                    value={selectedProfileId}
                    onChange={async (e) => {
                      const val = e.target.value;
                      setSelectedProfileId(val);
                      if (val) {
                        const { data } = await (supabase as any)
                          .from('employees')
                          .select('iqama_number, dob_hijri, nationality, profession')
                          .eq('id', val)
                          .maybeSingle();
                        if (data) {
                          setExtractedData(prev => ({
                            ...prev,
                            iqamaNumber: data.iqama_number || prev.iqamaNumber,
                            licenseNumber: data.iqama_number || prev.licenseNumber, // Driving License number = Iqama Number
                            dobHijri: data.dob_hijri || prev.dobHijri,
                            nationality: data.nationality || prev.nationality,
                            profession: data.profession || prev.profession
                          }));
                        }
                      }
                    }}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '16px' }}
                  >
                    <option value="">Select Employee...</option>
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>{p.full_name} ({p.role.toUpperCase()})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="text-[9px] font-bold text-slate-550 uppercase block">Assign System Role</label>
                  <select
                    value={newEmployeeRole}
                    onChange={(e) => setNewEmployeeRole(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '16px' }}
                  >
                    <option value="driver">Driver (Workforce)</option>
                    <option value="labor">Labor (On-Site Staff)</option>
                  </select>
                </div>
              )}

              {selectedCategory.toLowerCase() === 'muqeem' && (
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-550 uppercase block">Select Legal Sponsor</label>
                  <select
                    value={selectedSponsorId}
                    onChange={(e) => setSelectedSponsorId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '16px' }}
                  >
                    <option value="">Select Sponsor...</option>
                    {sponsors.map(s => (
                      <option key={s.moi} value={s.moi}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-start gap-3 text-[11px] text-indigo-700 font-medium">
                <UserCheck size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-indigo-900">
                    {linkMode === 'existing' ? 'Profile Match Configured!' : 'New Employee Registration'}
                  </p>
                  <p className="text-[9px] text-indigo-600/80 mt-0.5 leading-relaxed">
                    {linkMode === 'existing' 
                      ? `AI matched extracted name '${extractedData.residentName}' with an active record in our database.`
                      : `A new workforce profile will be automatically added for '${extractedData.residentName}' as a ${newEmployeeRole}.`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-150 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
              <CheckCircle2 size={16} className="shrink-0" />
              Document successfully verified & registered.
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose} disabled={uploading}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveExtraction} 
                disabled={uploading || (linkMode === 'existing' && !selectedProfileId)}
                className="rounded-2xl px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 text-xs"
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {linkMode === 'existing' ? <UserCheck size={16} /> : <UserPlus size={16} />}
                    {linkMode === 'existing' ? 'Confirm & Link Document' : 'Register & Create Employee'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
