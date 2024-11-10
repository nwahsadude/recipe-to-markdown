import React, { useState, useCallback } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';

interface TextEditorProps {
  initialIngredients: string[];
  initialInstructions: string[];
  onOrganized: (
    title: string,
    ingredients: string[],
    instructions: string[]
  ) => void;
  onBack: () => void;
}

export function TextEditor({
  initialIngredients,
  initialInstructions,
  onOrganized,
  onBack,
}: TextEditorProps) {
  const [title, setTitle] = useState('Recipe Title');
  const [ingredients, setIngredients] = useState<string[]>(initialIngredients);
  const [instructions, setInstructions] =
    useState<string[]>(initialInstructions);
  const [newIngredient, setNewIngredient] = useState('');
  const [newInstruction, setNewInstruction] = useState('');

  const editIngredient = (text: string, i: number) => {
   setIngredients((prev) => prev.map(ingredient: string, index: number) => {})
  }

  const addIngredient = useCallback(() => {
    if (newIngredient.trim()) {
      setIngredients((prev) => [...prev, newIngredient.trim()]);
      setNewIngredient('');
    }
  }, [newIngredient]);

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

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold border-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 p-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Ingredients</h3>
          <div className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-start gap-2 group">
                <div className="flex-1 p-2 bg-blue-50 rounded text-sm">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => updateIngredient(e.target.value, index)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  />
                </div>
                <button
                  onClick={() => removeIngredient(index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
                onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                placeholder="Add ingredient..."
                className="flex-1 p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addIngredient}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Instructions</h3>
          <div className="space-y-2">
            {instructions.map((instruction, index) => (
              <div key={index} className="flex items-start gap-2 group">
                <div className="flex-1 p-2 bg-green-50 rounded text-sm">
                  {instruction}
                </div>
                <button
                  onClick={() => removeInstruction(index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addInstruction()}
                placeholder="Add instruction..."
                className="flex-1 p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addInstruction}
                className="p-2 text-green-600 hover:bg-green-50 rounded"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center p-4 border-t bg-gray-50">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleComplete}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={ingredients.length === 0 && instructions.length === 0}
        >
          Generate Recipe
        </button>
      </div>
    </div>
  );
}
