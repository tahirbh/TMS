import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileImage, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FileDropZone({ files, setFiles, maxFiles = 2 }: any) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, [files]);

  const addFiles = (newFiles: any) => {
    const combined = [...files, ...newFiles].slice(0, maxFiles);
    setFiles(combined);
  };

  const removeFile = (index: any) => {
    setFiles(files.filter((_: any, i: any) => i !== index));
  };

  return (
    <div className="space-y-4">
      <motion.div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragging
            ? 'border-indigo-650 bg-indigo-50/10 scale-[1.02]'
            : 'border-slate-200 hover:border-indigo-600/40 hover:bg-slate-50/50'
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf"
          multiple={maxFiles > 1}
          onChange={(e) => addFiles(Array.from(e.target.files || []))}
        />
        <motion.div
          animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
          className="inline-flex"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100/50">
            <Upload className="w-7 h-7" />
          </div>
        </motion.div>
        <h3 className="font-heading font-black text-slate-800 text-lg">
          Drop your document here
        </h3>
        <p className="text-xs text-slate-400 font-semibold mt-2">
          or click to browse • Supports images & PDF • Up to {maxFiles} file{maxFiles > 1 ? 's' : ''}
        </p>
        <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mt-1.5">
          For Energy Permit, upload front & back sides
        </p>
      </motion.div>

      {/* File previews */}
      <AnimatePresence>
        {files.map((file: any, index: number) => (
          <motion.div
            key={file.name + index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <FileImage className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-black text-slate-800 truncate">{file.name}</p>
              <p className="text-[10px] text-slate-400 font-semibold">
                {(file.size / 1024 / 1024).toFixed(2)} MB
                {index === 0 && files.length > 1 && ' • Front side'}
                {index === 1 && ' • Back side'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
