import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

export function ImageUploader({ onImageSelect }: ImageUploaderProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        onImageSelect(file);
      }
    },
    [onImageSelect],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onImageSelect(file);
      }
    },
    [onImageSelect],
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="w-full max-w-2xl p-6 md:p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer bg-white/50 backdrop-blur-sm"
    >
      <label className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
        <Upload className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
        <div className="text-center">
          <p className="text-base md:text-lg font-medium text-gray-700">Drop your recipe image here</p>
          <p className="text-xs md:text-sm text-gray-500 mt-1">or tap to select a file</p>
        </div>
        <input type="file" className="hidden" accept="image/*" onChange={handleFileInput} capture="environment" />
      </label>
    </div>
  );
}
