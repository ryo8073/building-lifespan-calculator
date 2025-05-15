import React from 'react';

interface Props {
  message: string;
}

export function InfoTooltip({ message }: Props) {
  return (
    <span className="relative group cursor-pointer">
      <span className="text-blue-500">&#9432;</span>
      <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {message}
      </span>
    </span>
  );
} 