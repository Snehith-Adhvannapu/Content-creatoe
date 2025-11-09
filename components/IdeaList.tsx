import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface IdeaListProps {
  ideas: string[];
  onSelectIdea: (idea: string) => void;
  onClear: () => void;
}

export const IdeaList: React.FC<IdeaListProps> = ({ ideas, onSelectIdea, onClear }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Choose an Idea to Expand</h3>
        <button 
          onClick={onClear} 
          className="text-sm text-gray-400 hover:text-white"
          title="Clear ideas"
        >
          &times; Clear
        </button>
      </div>
      <ul className="space-y-3">
        {ideas.map((idea, index) => (
          <li key={index}>
            <button
              onClick={() => onSelectIdea(idea)}
              className="w-full text-left p-4 rounded-md bg-gray-900/50 hover:bg-purple-900/40 border border-gray-700 hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 group"
            >
              <div className="flex items-start space-x-3">
                <SparklesIcon className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 group-hover:text-white">{idea}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-center text-gray-500 pt-2">
        Clicking an idea will populate it in the form below for content generation.
      </p>
    </div>
  );
};

// Simple fade-in animation
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }
`;
document.head.appendChild(style);
