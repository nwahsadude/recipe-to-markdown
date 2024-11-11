import ReactMarkdown from 'react-markdown';
import { Copy } from 'lucide-react';

interface MarkdownPreviewProps {
  markdown: string;
  onCopy: () => void;
}

export function MarkdownPreview({ markdown, onCopy }: MarkdownPreviewProps) {
  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex justify-between items-center p-3 md:p-4 border-b">
        <h3 className="text-base md:text-lg font-semibold text-gray-700">Recipe Preview</h3>
        <button
          onClick={onCopy}
          className="flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Copy className="w-4 h-4" />
          <span className="hidden md:inline">Copy Markdown</span>
        </button>
      </div>
      <div className="p-4 md:p-6 prose max-w-none text-sm md:text-base">
        <ReactMarkdown>{markdown || '*No recipe text yet...*'}</ReactMarkdown>
      </div>
    </div>
  );
}
