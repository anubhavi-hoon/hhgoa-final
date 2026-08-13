'use client';

import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { convertHeicToPng } from '@/lib/imageUtils';

interface PhotoUploaderProps {
  onPhotoSelected: (dataUrl: string) => void;
}

export default function PhotoUploader({ onPhotoSelected }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      // Handle HEIC to PNG conversion dynamically on the client
      const convertedFile = await convertHeicToPng(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          onPhotoSelected(e.target.result);
        } else {
          setError('Failed to read image data');
        }
        setIsLoading(false);
      };
      reader.onerror = () => {
        setError('Error reading file data');
        setIsLoading(false);
      };
      reader.readAsDataURL(convertedFile);
    } catch (err) {
      console.error(err);
      setError('Failed to process image. Try a standard JPG or PNG.');
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/heic, image/heif"
        className="hidden"
      />
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`w-full min-h-[160px] border border-dashed rounded p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-orange-500 bg-orange-50/20'
            : 'border-neutral-300 hover:border-neutral-400 bg-white/40 hover:bg-white/60'
        }`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            <p className="text-xs font-semibold text-neutral-600 font-mono tracking-wider text-center uppercase">
              Converting HEIC to PNG...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-neutral-100 text-neutral-600 rounded-full mb-1">
              <Upload className="w-5 h-5" />
            </div>
            <p className="font-mono text-sm text-neutral-800 font-bold uppercase tracking-wider">
              Drop your photo here
            </p>
            <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider mb-2">
              Supports: JPG, PNG, HEIC
            </p>
            <button
              type="button"
              className="px-4 py-2 border border-neutral-800 text-neutral-800 font-mono text-xs rounded hover:bg-neutral-800 hover:text-white active:bg-neutral-900 transition-colors uppercase tracking-widest font-bold"
              onClick={(e) => {
                e.stopPropagation();
                triggerFileInput();
              }}
            >
              Choose Photo
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-xs text-red-500 font-mono uppercase tracking-wider">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
