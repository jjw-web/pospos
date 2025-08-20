import React from 'react';

// Corrected PlusIcon
export const PlusIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 5V19M5 12H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Corrected MinusIcon
export const MinusIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Corrected TrashIcon
export const TrashIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-6 8v4m4-4v4M5 6l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13H5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// XMarkIcon (kept original as it was not reported as faulty)
export const XMarkIcon: React.FC<{className?: string}> = ({className = "w-8 h-8"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);