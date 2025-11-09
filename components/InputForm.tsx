import React from 'react';
import { FormData, SocialPlatform } from '../types';

interface InputFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
}

const platforms: SocialPlatform[] = ['Twitter', 'LinkedIn', 'Instagram'];

export const InputForm: React.FC<InputFormProps> = ({ formData, setFormData, onSubmit, isLoading }) => {
  const { topic, tone, customInstructions, customImagePrompt, generateCarousel } = formData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    setFormData(prev => ({ 
        ...prev, 
        [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value 
    }));
  };
  
  const handlePlatformChange = (platform: SocialPlatform) => {
    setFormData(prev => {
        const currentPlatforms = prev.platforms || [];
        const newPlatforms = currentPlatforms.includes(platform)
            ? currentPlatforms.filter(p => p !== platform)
            : [...currentPlatforms, platform];
        return { ...prev, platforms: newPlatforms };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && formData.platforms.length > 0) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-300">
          Content Topic
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="topic"
            name="topic"
            value={topic}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-600 bg-gray-900/50 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm text-white py-2 px-3"
            placeholder="e.g., Launch of a new AI-powered analytics tool"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="tone" className="block text-sm font-medium text-gray-300">
          Tone of Voice
        </label>
        <select
          id="tone"
          name="tone"
          value={tone}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-600 bg-gray-900/50 py-2 pl-3 pr-10 text-base focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm text-white"
        >
          <option>Professional</option>
          <option>Casual</option>
          <option>Witty</option>
          <option>Enthusiastic</option>
          <option>Informative</option>
        </select>
      </div>
      
       <div>
        <label className="block text-sm font-medium text-gray-300">
          Platforms
        </label>
        <div className="mt-2 grid grid-cols-3 gap-2">
            {platforms.map(platform => (
                <div key={platform} className="relative flex items-start">
                    <div className="flex h-6 items-center">
                        <input
                            id={`platform-${platform}`}
                            name="platforms"
                            type="checkbox"
                            checked={formData.platforms?.includes(platform)}
                            onChange={() => handlePlatformChange(platform)}
                            className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-purple-600 focus:ring-purple-600"
                        />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                        <label htmlFor={`platform-${platform}`} className="font-medium text-gray-300">
                            {platform}
                        </label>
                    </div>
                </div>
            ))}
        </div>
      </div>
      
      <div className="relative flex items-start">
        <div className="flex h-6 items-center">
          <input
            id="generateCarousel"
            name="generateCarousel"
            type="checkbox"
            checked={generateCarousel}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-purple-600 focus:ring-purple-600"
          />
        </div>
        <div className="ml-3 text-sm leading-6">
          <label htmlFor="generateCarousel" className="font-medium text-gray-300">
            Generate Carousel for Instagram & LinkedIn
          </label>
          <p className="text-gray-500">Generates a multi-slide post for selected IG/LI platforms.</p>
        </div>
      </div>

      <div>
        <label htmlFor="customInstructions" className="block text-sm font-medium text-gray-300">
          Custom Instructions (Optional)
        </label>
        <div className="mt-1">
          <textarea
            id="customInstructions"
            name="customInstructions"
            rows={3}
            value={customInstructions}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-600 bg-gray-900/50 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm text-white py-2 px-3"
            placeholder="e.g., Include a call-to-action to sign up for a webinar."
          />
        </div>
      </div>

      <div>
        <label htmlFor="customImagePrompt" className="block text-sm font-medium text-gray-300">
          Image Style & Keywords (Optional)
        </label>
        <div className="mt-1">
          <textarea
            id="customImagePrompt"
            name="customImagePrompt"
            rows={2}
            value={customImagePrompt}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-600 bg-gray-900/50 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm text-white py-2 px-3"
            placeholder="e.g., minimalist vector art, pastel colors, professional"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading || !topic.trim() || formData.platforms.length === 0}
          className="flex w-full justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating Posts...' : 'Generate Posts'}
        </button>
      </div>
    </form>
  );
};
