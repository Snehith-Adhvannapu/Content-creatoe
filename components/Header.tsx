
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export const Header: React.FC = () => {
  return (
    <header className="py-4 border-b border-gray-700/50">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <SparklesIcon className="h-8 w-8 text-purple-400 mr-3" />
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Social Content AI Generator
        </h1>
      </div>
    </header>
  );
};
