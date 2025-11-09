import React from 'react';

export const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V4zm3 1a1 1 0 00-1 1v1a1 1 0 102 0V6a1 1 0 00-1-1z" />
    <path d="M3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
  </svg>
);