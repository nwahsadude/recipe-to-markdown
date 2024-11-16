import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface AdditionalDetailsProps {
  cookTimeState: string;
  prepTimeState: string;
  servingsState: string;
  onUpdated: (cookTime: string, prepTime: string, servings: string) => void;
  onBack: () => void;
  onHandleGenerateRecipe: () => void;
}

export function AdditionalDetails({
  cookTimeState,
  prepTimeState,
  servingsState,
  onUpdated,
  onBack,
  onHandleGenerateRecipe,
}: AdditionalDetailsProps) {
  const [cookTime, setCookTime] = useState(cookTimeState);
  const [prepTime, setPrepTime] = useState(prepTimeState);
  const [servings, setServings] = useState(servingsState);

  useEffect(() => {
    onUpdated(cookTime, prepTime, servings);
  }, [cookTime, prepTime, servings, onUpdated]);

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex justify-between items-center p-3 md:p-4 border-b">
        <h3 className="text-base md:text-lg font-semibold text-gray-700">Additional Details</h3>
      </div>
      <div className="p-4 md:p-6 prose max-w-none text-sm md:text-base">
        <form className="space-y-4">
          <div>
            <label htmlFor="prep-time" className="block text-sm font-medium text-gray-700">
              Prep Time
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="prep-time"
                id="prep-time"
                className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 10 minutes"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="cook-time" className="block text-sm font-medium text-gray-700">
              Cook Time
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="cook-time"
                id="cook-time"
                className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 1 hour"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="servings" className="block text-sm font-medium text-gray-700">
              Servings
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="servings"
                id="servings"
                className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 4"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
              />
            </div>
          </div>
        </form>

        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center p-4 border-t bg-gray-50 space-y-3 md:space-y-0">
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={onHandleGenerateRecipe}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
          >
            Generate Recipe
          </button>
        </div>
      </div>
    </div>
  );
}
