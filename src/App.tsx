import React, { useState, useCallback, useEffect } from 'react';
import { ChefHat } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { ImageSelector } from './components/ImageSelector';
import { TextEditor } from './components/TextEditor';
import { MarkdownPreview } from './components/MarkdownPreview';
import { AdditionalDetails } from './components/AdditionalDetails.tsx';

type Step = 'upload' | 'select' | 'edit' | 'details' | 'preview';

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
  const [recipeState, setRecipeState] = useState<{
    ingredients: string[];
    instructions: string[];
    title: string;
    prepTime: string;
    cookTime: string;
    servings: string;
  }>({ cookTime: '', prepTime: '', servings: '', ingredients: [], instructions: [], title: 'Recipe Title' });
  const [boxesState, setBoxesState] = useState<Box[]>([]);
  const [markdown, setMarkdown] = useState('');

  const handleImageSelect = useCallback((file: File) => {
    setImageFile(file);
    setStep('select');
  }, []);

  const handleTextUpdated = useCallback((title: string, ingredients: string[], instructions: string[]) => {
    setRecipeState((prevState) => {
      return { ...prevState, ingredients: ingredients, instructions: instructions, title: title };
    });
  }, []);

  const handleAdditionalDetails = useCallback((cookTime: string, prepTime: string, servings: string) => {
    setRecipeState((prevState) => {
      return { ...prevState, cookTime: cookTime, prepTime: prepTime, servings: servings };
    });
  }, []);

  const handleTextExtracted = useCallback((ingredients: string[], instructions: string[], boxes: Box[]) => {
    setRecipeState((prevState) => {
      return { ...prevState, ingredients: ingredients, instructions: instructions };
    });
    setBoxesState(boxes);
    setStep('edit');
  }, []);

  useEffect(() => {
    console.log(recipeState);
  }, [recipeState]);

  const handleGenerateRecipe = useCallback(() => {
    const { title, ingredients, instructions, prepTime, cookTime, servings } = recipeState;

    console.log(recipeState, title, prepTime);
    const formattedMarkdown = `# ${title}

## Ingredients

${ingredients.map((ing) => `${ing.substring(0, 4) === '####' ? '' : '-'} ${ing.trim()}`).join('\n')}

## Instructions

${instructions.map((inst, i) => `${i + 1}. ${inst.trim()}`).join('\n')}

## Notes

- Prep Time: ${prepTime}
- Cook Time: ${cookTime}
- Servings: ${servings}
`;

    setMarkdown(formattedMarkdown);
    setStep('preview');
  }, [recipeState]);

  const handleBack = useCallback(() => {
    setStep((prev) => {
      switch (prev) {
        case 'preview':
          return 'details';
        case 'details':
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

  const handleAddDetails = useCallback(() => {
    setStep('details');
  }, []);

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
            {['upload', 'select', 'edit', 'details', 'preview'].map((s, index) => (
              <React.Fragment key={s}>
                <div
                  onClick={() => setStep(s as Step)}
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
                {index < 4 && <div className="w-8 md:w-12 h-px bg-gray-300" />}
              </React.Fragment>
            ))}
          </div>

          {step === 'upload' && <ImageUploader onImageSelect={handleImageSelect} />}

          {step === 'select' && imageFile && (
            <ImageSelector
              imageFile={imageFile}
              boxesState={boxesState}
              onComplete={handleTextExtracted}
              onBack={handleBack}
            />
          )}

          {step === 'edit' && (
            <TextEditor
              ingredientState={recipeState.ingredients}
              instructionState={recipeState.instructions}
              titleState={recipeState.title}
              boxes={boxesState}
              onAddDetails={handleAddDetails}
              onBack={handleBack}
              onTextUpdated={handleTextUpdated}
            />
          )}

          {step === 'details' && (
            <AdditionalDetails
              cookTimeState={recipeState.cookTime}
              prepTimeState={recipeState.prepTime}
              servingsState={recipeState.servings}
              onUpdated={handleAdditionalDetails}
              onBack={handleBack}
              onHandleGenerateRecipe={handleGenerateRecipe}
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
