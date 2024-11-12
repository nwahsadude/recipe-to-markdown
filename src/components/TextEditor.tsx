import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Plus, X, Image as ImageIcon, PanelTop } from 'lucide-react';
import { TextareaAutosize } from '@mui/base';

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

interface TextEditorProps {
  initialIngredients: string[];
  initialInstructions: string[];
  boxes: Box[];
  onOrganized: (title: string, ingredients: string[], instructions: string[]) => void;
  onBack: () => void;
  onTextUpdated: (title: string, ingredients: string[], instructions: string[]) => void;
}

interface ImagePreviewProps {
  imageUrl: string | undefined;
  type: 'ingredient' | 'instruction';
  index: number;
}

function ImagePreview({ imageUrl, type, index }: ImagePreviewProps) {
  if (!imageUrl) return null;

  return (
    <div className="relative">
      <div className="bg-white rounded-lg shadow-lg p-3 border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {type === 'ingredient' ? 'Ingredient' : 'Instruction'} #{index + 1}
          </span>
        </div>
        <img src={imageUrl} alt={`${type} ${index + 1} preview`} className="max-h-[300px] w-auto rounded" />
      </div>
    </div>
  );
}

export function TextEditor({
  initialIngredients,
  initialInstructions,
  boxes,
  onOrganized,
  onBack,
  onTextUpdated,
}: TextEditorProps) {
  const [title, setTitle] = useState('Recipe Title');
  const [ingredients, setIngredients] = useState<string[]>(initialIngredients);
  const [instructions, setInstructions] = useState<string[]>(initialInstructions);
  const [newIngredient, setNewIngredient] = useState('');
  const [newInstruction, setNewInstruction] = useState('');
  const [selectedPreview, setSelectedPreview] = useState<{ type: 'ingredient' | 'instruction'; index: number } | null>(
    null,
  );

  const ingredientBoxes = boxes.filter((box) => box.type === 'ingredient');
  const instructionBoxes = boxes.filter((box) => box.type === 'instruction');

  const editIngredient = (text: string, i: number) => {
    setIngredients((prev) => prev.map((ingredient, index) => (i === index ? text : ingredient)));
  };

  useEffect(() => {
    onTextUpdated(title, ingredients, instructions);
  }, [title, ingredients, instructions, onTextUpdated]);

  const addIngredient = useCallback(() => {
    if (newIngredient.trim()) {
      setIngredients((prev) => [...prev, newIngredient.trim()]);
      setNewIngredient('');
    }
  }, [newIngredient]);

  const editInstruction = (text: string, i: number) => {
    setInstructions((prev) => prev.map((instruction, index) => (i === index ? text : instruction)));
  };
  const addInstruction = useCallback(() => {
    if (newInstruction.trim()) {
      setInstructions((prev) => [...prev, newInstruction.trim()]);
      setNewInstruction('');
    }
  }, [newInstruction]);

  const removeIngredient = useCallback((index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeInstruction = useCallback((index: number) => {
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleComplete = useCallback(() => {
    onOrganized(title, ingredients, instructions);
  }, [title, ingredients, instructions, onOrganized]);

  const togglePreview = useCallback((type: 'ingredient' | 'instruction', index: number) => {
    setSelectedPreview((prev) => (prev?.type === type && prev.index === index ? null : { type, index }));
  }, []);

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 md:p-6 border-b">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-xl md:text-2xl font-bold border-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
        />
      </div>

      {selectedPreview && (
        <div className="p-4 md:p-6 border-b bg-gray-50">
          <ImagePreview
            imageUrl={
              selectedPreview.type === 'ingredient'
                ? ingredientBoxes[selectedPreview.index]?.imageUrl
                : instructionBoxes[selectedPreview.index]?.imageUrl
            }
            type={selectedPreview.type}
            index={selectedPreview.index}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6">
        <div className="space-y-4">
          <div className="gap-2 flex">
            <h3 className="font-semibold text-gray-700">Ingredients</h3>
            <button
              onClick={() => togglePreview('ingredient', 0)}
              className={`p-1 rounded transition-colors ${
                selectedPreview?.type === 'ingredient' && selectedPreview.index === 0
                  ? 'text-blue-600 bg-blue-100'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title={
                selectedPreview?.type === 'ingredient' && selectedPreview.index === 0 ? 'Hide preview' : 'Show preview'
              }
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-start gap-2 group">
                <button
                  onClick={() => editIngredient(`#### ${ingredient}`, index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  title={'Make item a header'}
                  tabIndex={-1}
                >
                  <PanelTop className="w-4 h-4" />
                </button>
                <div className="flex-1 p-2 bg-blue-50 rounded text-sm">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => editIngredient(e.target.value, index)}
                    className="p-2 w-full text-blue-600 hover:bg-blue-50 rounded"
                  />
                </div>
                <button
                  onClick={() => removeIngredient(index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  tabIndex={-1}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyUp={(e) => e.key === 'Enter' && addIngredient()}
                placeholder="Add ingredient..."
                className="flex-1 p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={addIngredient} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <h3 className="font-semibold text-gray-700">Instructions</h3>
            <button
              onClick={() => togglePreview('instruction', 0)}
              className={`p-1 rounded transition-colors ${
                selectedPreview?.type === 'ingredient' && selectedPreview.index === 0
                  ? 'text-blue-600 bg-blue-100'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title={
                selectedPreview?.type === 'ingredient' && selectedPreview.index === 0 ? 'Hide preview' : 'Show preview'
              }
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {instructions.map((instruction, index) => (
              <div key={index} className="flex items-start gap-2 group">
                <div className="flex-1 p-2 bg-green-50 rounded text-sm">
                  <TextareaAutosize
                    value={instruction}
                    onChange={(e) => editInstruction(e.target.value, index)}
                    className="p-2 w-full"
                  />
                </div>
                <button
                  onClick={() => removeInstruction(index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <textarea
                value={newInstruction}
                rows={4}
                onChange={(e) => setNewInstruction(e.target.value)}
                onKeyUp={(e) => e.key === 'Enter' && addInstruction()}
                placeholder="Add instruction..."
                className="flex-1 p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={addInstruction} className="p-2 text-green-600 hover:bg-green-50 rounded">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center p-4 border-t bg-gray-50 space-y-3 md:space-y-0">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleComplete}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
          disabled={ingredients.length === 0 && instructions.length === 0}
        >
          Generate Recipe
        </button>
      </div>
    </div>
  );
}
