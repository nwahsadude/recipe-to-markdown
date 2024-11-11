import React, { useState, useCallback } from 'react';
import { ChefHat } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { ImageSelector } from './components/ImageSelector';
import { TextEditor } from './components/TextEditor';
import { MarkdownPreview } from './components/MarkdownPreview';

type Step = 'upload' | 'select' | 'edit' | 'preview';

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

function App() {
  const [step, setStep] = useState<Step>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<{
    ingredients: string[];
    instructions: string[];
    boxes: Box[];
  }>({ ingredients: [], instructions: [], boxes: [] });
  const [markdown, setMarkdown] = useState('');

  const handleImageSelect = useCallback((file: File) => {
    setImageFile(file);
    setStep('select');
  }, []);

  const handleTextExtracted = useCallback((ingredients: string[], instructions: string[], boxes: Box[]) => {
    setExtractedText({ ingredients, instructions, boxes });
    setStep('edit');
  }, []);

  const handleTextOrganized = useCallback((title: string, ingredients: string[], instructions: string[]) => {
    const formattedMarkdown = `# ${title}

## Ingredients

${ingredients.map((ing) => `- ${ing.trim()}`).join('\n')}

## Instructions

${instructions.map((inst, i) => `${i + 1}. ${inst.trim()}`).join('\n')}

## Notes

- Prep Time: 
- Cook Time: 
- Servings: 
- Source: OCR Extracted Recipe
`;

    setMarkdown(formattedMarkdown);
    setStep('preview');
  }, []);

  const handleBack = useCallback(() => {
    setStep((prev) => {
      switch (prev) {
        case 'preview':
          return 'edit';
        case 'edit':
          return 'select';
        case 'select':
          return 'upload';
        default:
          return 'upload';
      }
    });
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(markdown);
    alert('Markdown copied to clipboard!');
  }, [markdown]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="flex flex-col items-center space-y-6 md:space-y-8">
          <div className="text-center space-y-3 md:space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <ChefHat className="w-8 h-8 md:w-12 md:h-12 text-blue-600" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Recipe Scanner</h1>
            </div>
            <p className="text-sm md:text-base text-gray-600 max-w-xl px-4">
              Transform your recipe images into perfectly formatted markdown text. Select text regions and organize your
              recipe with ease!
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 md:gap-4 text-xs md:text-sm font-medium overflow-x-auto w-full max-w-full px-4">
            {['upload', 'select', 'edit', 'preview'].map((s, index) => (
              <React.Fragment key={s}>
                <div
                  className={`flex items-center whitespace-nowrap ${step === s ? 'text-blue-600' : 'text-gray-500'}`}
                >
                  <span
                    className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center ${
                      step === s ? 'bg-blue-100' : 'bg-gray-100'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="ml-2 capitalize">{s}</span>
                </div>
                {index < 3 && <div className="w-8 md:w-12 h-px bg-gray-300" />}
              </React.Fragment>
            ))}
          </div>

          {step === 'upload' && <ImageUploader onImageSelect={handleImageSelect} />}

          {step === 'select' && imageFile && (
            <ImageSelector imageFile={imageFile} onComplete={handleTextExtracted} onBack={handleBack} />
          )}

          {step === 'edit' && (
            <TextEditor
              initialIngredients={extractedText.ingredients}
              initialInstructions={extractedText.instructions}
              boxes={extractedText.boxes}
              onOrganized={handleTextOrganized}
              onBack={handleBack}
            />
          )}

          {step === 'preview' && (
            <div className="w-full flex flex-col items-center space-y-4">
              <MarkdownPreview markdown={markdown} onCopy={handleCopy} />
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Editor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;