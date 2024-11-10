import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ListOrdered, Trash2, UtensilsCrossed} from 'lucide-react';
import {Paragraph} from "tesseract.js";

interface Box {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ingredient' | 'instruction';
  text?: string[];
}

interface ImageSelectorProps {
  imageFile: File;
  onComplete: (ingredients: string[], instructions: string[]) => void;
  onBack: () => void;
}

export function ImageSelector({ imageFile, onComplete, onBack }: ImageSelectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [currentBox, setCurrentBox] = useState<Partial<Box> | null>(null);
  const [selectedType, setSelectedType] = useState<'ingredient' | 'instruction'>('ingredient');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load and draw the image
  useEffect(() => {
    const img = new Image();
    img.src = URL.createObjectURL(imageFile);
    img.onload = () => {
      setImage(img);
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!;
        
        // Set canvas size to match image while maintaining aspect ratio
        const maxWidth = 800;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };
    return () => URL.revokeObjectURL(img.src);
  }, [imageFile]);

  // Draw boxes on canvas
  useEffect(() => {
    if (!canvasRef.current || !image) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    // Clear and redraw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    // Draw all boxes
    boxes.forEach(box => {
      ctx.strokeStyle = box.type === 'ingredient' ? '#3B82F6' : '#10B981';
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      
      // Semi-transparent fill
      ctx.fillStyle = box.type === 'ingredient' ? 
        'rgba(59, 130, 246, 0.1)' : 
        'rgba(16, 185, 129, 0.1)';
      ctx.fillRect(box.x, box.y, box.width, box.height);
    });
    
    // Draw current box if drawing
    if (currentBox && currentBox.width && currentBox.height) {
      ctx.strokeStyle = selectedType === 'ingredient' ? '#3B82F6' : '#10B981';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        currentBox.x!,
        currentBox.y!,
        currentBox.width,
        currentBox.height
      );
    }
  }, [boxes, currentBox, image, selectedType]);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDrawing(true);
    setCurrentBox({ x, y, type: selectedType });
  }, [selectedType]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !currentBox || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentBox(prev => ({
      ...prev!,
      width: x - prev!.x!,
      height: y - prev!.y!,
    }));
  }, [drawing, currentBox]);

  const stopDrawing = useCallback(async () => {
    if (!currentBox || !currentBox.width || !currentBox.height) {
      setDrawing(false);
      setCurrentBox(null);
      return;
    }

    // Normalize negative dimensions
    let { x, y, width, height } = currentBox;
    if (width! < 0) {
      x = x! + width!;
      width = Math.abs(width!);
    }
    if (height! < 0) {
      y = y! + height!;
      height = Math.abs(height!);
    }

    setIsProcessing(true);
    try {
      // Create a new box with normalized dimensions
      const newBox: Box = {
        id: Date.now().toString(),
        x: x!,
        y: y!,
        width,
        height,
        type: selectedType,
        text: [],
      };
      
      setBoxes(prev => [...prev, newBox]);
    } finally {
      setIsProcessing(false);
      setDrawing(false);
      setCurrentBox(null);
    }
  }, [currentBox, selectedType]);

  const removeBox = useCallback((id: string) => {
    setBoxes(prev => prev.filter(box => box.id !== id));
  }, []);

  const processText = useCallback((text: Paragraph[], type: 'ingredient' | 'instruction'): string[] => {
    if (type === 'ingredient') {
      return text.flatMap(p => p.text
          .split(/\n/)
          .map(line => line.trim())
          .filter(line => line.length > 0));
    } else {
      return text.map(p => p.text);
    }
  }, []);

  const handleComplete = useCallback(async () => {
    setIsProcessing(true);
    try {
      const worker = await import('tesseract.js').then(m => m.createWorker());
      
      // Process each box
      const processedBoxes = await Promise.all(
        boxes.map(async (box) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          canvas.width = box.width;
          canvas.height = box.height;
          
          ctx.drawImage(
            image!,
            box.x, box.y, box.width, box.height,
            0, 0, box.width, box.height
          );
          
          const blob = await new Promise<Blob>((resolve) => 
            canvas.toBlob(blob => resolve(blob!))
          );

          const { data}  = await worker.recognize(blob);
          return { ...box, text: processText(data.paragraphs, box.type) };
        })
      );

      await worker.terminate();

      // Flatten and combine all text from boxes of the same type
      const ingredients = processedBoxes
        .filter(box => box.type === 'ingredient')
        .flatMap(box => box.text || []);
      
      const instructions = processedBoxes
        .filter(box => box.type === 'instruction')
        .flatMap(box => box.text || []);

      onComplete(ingredients, instructions);
    } finally {
      setIsProcessing(false);
    }
  }, [boxes, image, onComplete, processText]);

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedType('ingredient')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              selectedType === 'ingredient'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            Ingredient
          </button>
          <button
            onClick={() => setSelectedType('instruction')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              selectedType === 'instruction'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            Instruction
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Draw boxes around text to categorize them
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="max-w-full cursor-crosshair"
        />
        {isProcessing && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
            <div className="text-lg font-medium text-gray-700">Processing...</div>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => setBoxes([])}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            disabled={boxes.length === 0}
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
          <button
            onClick={handleComplete}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={boxes.length === 0 || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Extract Text'}
          </button>
        </div>
      </div>
    </div>
  );
}