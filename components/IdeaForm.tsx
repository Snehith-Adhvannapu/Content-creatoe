import React, { useState } from 'react';

interface IdeaFormProps {
  onGenerate: (topic: string) => void;
  isLoading: boolean;
}

export const IdeaForm: React.FC<IdeaFormProps> = ({ onGenerate, isLoading }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onGenerate(topic);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="idea-topic" className="block text-sm font-medium text-gray-300">
          Niche / Topic
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="idea-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="block w-full rounded-md border-gray-600 bg-gray-900/50 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm text-white py-2 px-3"
            placeholder="e.g., AI productivity tools, sustainable fashion"
            required
          />
        </div>
      </div>
      <div>
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="flex w-full justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating Ideas...' : 'Get Viral Ideas'}
        </button>
      </div>
    </form>
  );
};
