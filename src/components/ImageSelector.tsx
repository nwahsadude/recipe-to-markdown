import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ListOrdered, Trash2, UtensilsCrossed } from 'lucide-react';
import { Paragraph } from 'tesseract.js';

interface Box {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ingredient' | 'instruction';
  text?: string[];
  imageUrl?: string;
}

interface ImageSelectorProps {
  imageFile: File;
  onComplete: (ingredients: string[], instructions: string[], boxes: Box[]) => void;
  onBack: () => void;
}

export function ImageSelector({ imageFile, onComplete, onBack }: ImageSelectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [origImage, setOrigImage] = useState<HTMLImageElement | null>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [currentBox, setCurrentBox] = useState<Partial<Box> | null>(null);
  const [selectedType, setSelectedType] = useState<'ingredient' | 'instruction'>('ingredient');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scale, setScale] = useState(1);
  const [threshold, setThreshold] = useState(128);

  // Load and draw the image
  useEffect(() => {
    const img = new Image();
    img.src = URL.createObjectURL(imageFile);
    img.onload = () => {
      setImage(img);
      setOrigImage(img);
      if (canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

        // Calculate scale based on container width
        const containerWidth = container.clientWidth;
        const newScale = Math.min(1, containerWidth / img.width);
        setScale(newScale);

        canvas.width = img.width * newScale;
        canvas.height = img.height * newScale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };
    return () => URL.revokeObjectURL(img.src);
  }, [imageFile]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (image && canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

        const newScale = Math.min(1, container.clientWidth / image.width);
        setScale(newScale);

        canvas.width = image.width * newScale;
        canvas.height = image.height * newScale;

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [image]);

  const applyThresholding = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      // Get image data for processing

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Apply thresholding
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Convert to grayscale
        const grayscale = 0.3 * r + 0.59 * g + 0.11 * b;

        // Apply threshold
        const binaryColor = grayscale >= threshold ? 255 : 0;

        // Set each color channel to the binary color (black or white)
        data[i] = data[i + 1] = data[i + 2] = binaryColor;
      }

      // Put modified image data back to canvas
      ctx.putImageData(imageData, 0, 0);
    },
    [threshold],
  );

  // apply threshold when threshold slider changed
  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      applyThresholding(ctx, canvas);
    }
  }, [applyThresholding, image, threshold]);

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImage(origImage);
    setThreshold(parseInt(e.target.value));
  };

  const getCoordinates = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      return {
        x: (clientX - rect.left) / scale,
        y: (clientY - rect.top) / scale,
      };
    },
    [scale],
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const coords = getCoordinates(e);
      if (!coords) return;

      setDrawing(true);
      setCurrentBox({ x: coords.x, y: coords.y, type: selectedType });
    },
    [getCoordinates, selectedType],
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (!drawing || !currentBox) return;

      const coords = getCoordinates(e);
      if (!coords) return;

      setCurrentBox((prev) => ({
        ...prev!,
        width: coords.x - prev!.x!,
        height: coords.y - prev!.y!,
      }));
    },
    [drawing, currentBox, getCoordinates],
  );

  // Effect for drawing boxes
  useEffect(() => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    // Clear and redraw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    applyThresholding(ctx, canvas);

    boxes.forEach((box) => {
      ctx.strokeStyle = box.type === 'ingredient' ? '#3B82F6' : '#10B981';
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x * scale, box.y * scale, box.width * scale, box.height * scale);

      ctx.fillStyle = box.type === 'ingredient' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)';
      ctx.fillRect(box.x * scale, box.y * scale, box.width * scale, box.height * scale);
    });

    if (currentBox && currentBox.width && currentBox.height) {
      ctx.strokeStyle = selectedType === 'ingredient' ? '#3B82F6' : '#10B981';
      ctx.lineWidth = 2;
      ctx.strokeRect(currentBox.x! * scale, currentBox.y! * scale, currentBox.width * scale, currentBox.height * scale);
    }
  }, [boxes, currentBox, image, selectedType, scale, applyThresholding]);

  const stopDrawing = useCallback(async () => {
    if (!currentBox || !currentBox.width || !currentBox.height || !image) {
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
      // Create a temporary canvas for the cropped region
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
      tempCanvas.width = width;
      tempCanvas.height = height;
      tempCtx.drawImage(image, x!, y!, width, height, 0, 0, width, height);

      const imageUrl = tempCanvas.toDataURL('image/png');

      const newBox: Box = {
        id: Date.now().toString(),
        x: x!,
        y: y!,
        width: width,
        height: height,
        type: selectedType,
        text: [],
        imageUrl,
      };

      setBoxes((prev) => [...prev, newBox]);
    } finally {
      setIsProcessing(false);
      setDrawing(false);
      setCurrentBox(null);
    }
  }, [currentBox, selectedType, image]);

  // const removeBox = useCallback((id: string) => {
  //   setBoxes((prev) => prev.filter((box) => box.id !== id));
  // }, []);

  const processText = useCallback((text: Paragraph[], type: 'ingredient' | 'instruction'): string[] => {
    if (type === 'ingredient') {
      return text.flatMap((p) =>
        p.text
          .split(/\n/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0),
      );
    } else {
      return text
        .map((p) => p.text)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => line + '.');
    }
  }, []);

  const handleComplete = useCallback(async () => {
    setIsProcessing(true);
    try {
      const worker = await import('tesseract.js').then((m) => m.createWorker());

      const processedBoxes = await Promise.all(
        boxes.map(async (box) => {
          const {
            data: { paragraphs },
          } = await worker.recognize(box.imageUrl!);
          return { ...box, text: processText(paragraphs, box.type) };
        }),
      );

      await worker.terminate();

      const ingredients = processedBoxes.filter((box) => box.type === 'ingredient').flatMap((box) => box.text || []);

      const instructions = processedBoxes.filter((box) => box.type === 'instruction').flatMap((box) => box.text || []);

      onComplete(ingredients, instructions, processedBoxes);
    } finally {
      setIsProcessing(false);
    }
  }, [boxes, onComplete, processText]);

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-3 md:p-4 border-b">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
          <div className="flex gap-2 md:gap-4">
            <button
              onClick={() => setSelectedType('ingredient')}
              className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-sm ${
                selectedType === 'ingredient' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span className="hidden md:inline">Ingredient</span>
            </button>
            <button
              onClick={() => setSelectedType('instruction')}
              className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-sm ${
                selectedType === 'instruction' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span className="hidden md:inline">Instruction</span>
            </button>
          </div>
          <div className="text-xs md:text-sm text-gray-500">Draw boxes around text to categorize them</div>
          <div>
            <label>
              Threshold: {threshold}
              <input type="range" min="0" max="255" value={threshold} onChange={handleThresholdChange} />
            </label>
          </div>
        </div>
      </div>

      <div className="relative" ref={containerRef}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onTouchStart={startDrawing}
          onMouseMove={draw}
          onTouchMove={draw}
          onMouseUp={stopDrawing}
          onTouchEnd={stopDrawing}
          onMouseLeave={stopDrawing}
          className="max-w-full cursor-crosshair touch-none"
        />
        {isProcessing && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
            <div className="text-lg font-medium text-gray-700">Processing...</div>
          </div>
        )}
      </div>

      <div className="p-3 md:p-4 border-t bg-gray-50 flex flex-col md:flex-row justify-between items-stretch md:items-center space-y-3 md:space-y-0">
        <button onClick={onBack} className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm md:text-base">
          ← Back
        </button>
        <div className="flex gap-2 md:gap-4">
          <button
            onClick={() => setBoxes([])}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
            disabled={boxes.length === 0}
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden md:inline">Clear All</span>
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 md:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm md:text-base"
            disabled={boxes.length === 0 || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Extract Text'}
          </button>
        </div>
      </div>
    </div>
  );
}
