import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileImage, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FileDropZone({ files, setFiles, maxFiles = 2 }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, [files]);

  const addFiles = (newFiles) => {
    const combined = [...files, ...newFiles].slice(0, maxFiles);
    setFiles(combined);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <motion.div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/40 hover:bg-muted/50'
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf"
          multiple={maxFiles > 1}
          onChange={(e) => addFiles(Array.from(e.target.files))}
        />
        <motion.div
          animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
          className="inline-flex"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7 text-primary" />
          </div>
        </motion.div>
        <h3 className="font-heading font-semibold text-lg text-foreground">
          Drop your document here
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          or click to browse • Supports images & PDF • Up to {maxFiles} file{maxFiles > 1 ? 's' : ''}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          For Energy Permit, upload front & back sides
        </p>
      </motion.div>

      {/* File previews */}
      <AnimatePresence>
        {files.map((file, index) => (
          <motion.div
            key={file.name + index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileImage className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
                {index === 0 && files.length > 1 && ' • Front side'}
                {index === 1 && ' • Back side'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
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