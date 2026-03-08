"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { UploadCloud, File, X, AlertCircle, CheckCircle2, Zap, Download, RefreshCcw } from "lucide-react";
import { clsx } from "clsx";

interface UploadAreaProps {
  onUpload: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSizeMB?: number;
  isProcessing?: boolean;
  progress?: number;
  completedFileName?: string;
  serverError?: string | null;
  onDownload?: () => void;
  onReset?: () => void;
}

export default function UploadArea({
  onUpload,
  accept = { "application/pdf": [".pdf"] },
  maxFiles = 10,
  maxSizeMB = 50,
  isProcessing = false,
  progress = 0,
  completedFileName,
  serverError = null,
  onDownload,
  onReset,
}: UploadAreaProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setErrorMsg(null);
      
      if (fileRejections.length > 0) {
        setErrorMsg(`Failed to upload: ${fileRejections[0].errors[0].message}`);
        return;
      }

      if (acceptedFiles.length + selectedFiles.length > maxFiles) {
        setErrorMsg(`You can only upload up to ${maxFiles} files.`);
        return;
      }

      const totalSize = acceptedFiles.reduce((acc, file) => acc + file.size, 0);
      if (totalSize > maxSizeMB * 1024 * 1024) {
        setErrorMsg(`Total file size must be less than ${maxSizeMB}MB.`);
        return;
      }

      setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
    },
    [maxFiles, maxSizeMB, selectedFiles.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize: maxSizeMB * 1024 * 1024,
  });

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleProcess = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setErrorMsg(null);
    if (onReset) onReset();
  };

  // State: Completed
  if (completedFileName) {
    return (
      <div className="w-full bg-white border border-border rounded-3xl p-10 flex flex-col items-center justify-center min-h-[400px] text-center shadow-sm">
        <div className="bg-green-100 p-4 rounded-full mb-6 relative">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Processing Complete!</h3>
        <p className="text-muted-foreground mb-8">
          {completedFileName} is ready for download.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={onDownload}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 flex items-center justify-center gap-2 rounded-lg font-semibold transition-all shadow-md active:scale-95"
          >
            <Download className="h-5 w-5" /> Download File
          </button>
          <button 
            onClick={handleReset}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 flex items-center justify-center gap-2 rounded-lg font-semibold transition-all active:scale-95"
          >
            <RefreshCcw className="h-5 w-5" /> Process Another
          </button>
        </div>
      </div>
    );
  }

  // State: Processing
  if (isProcessing) {
    return (
      <div className="w-full bg-slate-50 border border-border rounded-3xl p-10 flex flex-col items-center justify-center min-h-[400px] text-center shadow-inner">
        <div className="relative w-24 h-24 mb-6">
          <svg className="animate-spin w-24 h-24 text-primary/20" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" stroke="currentColor" />
          </svg>
          <svg className="absolute top-0 left-0 w-24 h-24 text-primary" viewBox="0 0 100 100">
            <circle 
              cx="50" cy="50" r="45" fill="none" strokeWidth="8" stroke="currentColor" 
              strokeDasharray="283" strokeDashoffset={283 - (283 * progress) / 100}
              className="transition-all duration-300 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">{Math.round(progress)}%</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2 animate-pulse">Processing your files...</h3>
        <p className="text-muted-foreground">Please do not close this window.</p>
      </div>
    );
  }

  // State: Upload & List
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={clsx(
          "w-full rounded-3xl border-2 border-dashed transition-all p-12 flex flex-col items-center justify-center min-h-[300px] cursor-pointer text-center group",
          isDragActive
            ? "border-blue-500 bg-blue-50 scale-[1.02]"
            : "border-border bg-slate-50 hover:bg-slate-100 hover:border-blue-300"
        )}
      >
        <input {...getInputProps()} id="fileUpload" />
        <div className={clsx("p-5 rounded-full mb-4 transition-colors", isDragActive ? "bg-blue-200 text-blue-700" : "bg-white text-blue-600 shadow-sm group-hover:bg-blue-50")}>
          <UploadCloud className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-4">
          {isDragActive ? "Drop files here" : "Drag and drop your files or"}
        </h3>
        
        <button 
          type="button" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md font-medium mb-6 relative z-10 pointer-events-none"
        >
          Select File
        </button>

        <p className="text-sm text-muted-foreground max-w-sm">
          Supports: {Object.values(accept).flat().join(", ")}. Max file size: {maxSizeMB}MB. Up to {maxFiles} files.
        </p>
      </div>

      {(errorMsg || serverError) && (
        <div className="mt-4 p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{errorMsg || serverError}</p>
        </div>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-foreground">Selected Files ({selectedFiles.length})</h4>
            <button 
              onClick={() => setSelectedFiles([])}
              className="text-sm text-muted-foreground hover:text-rose-500 transition-colors"
            >
              Clear all
            </button>
          </div>
          <ul className="space-y-3 mb-8">
            {selectedFiles.map((file, idx) => (
              <li key={`${file.name}-${idx}`} className="flex items-center justify-between p-4 bg-white border border-border rounded-xl shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                    <File className="h-5 w-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeFile(idx)}
                  className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
          
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : <><Zap className="h-5 w-5" /> Start Processing</>}
          </button>
        </div>
      )}
    </div>
  );
}
