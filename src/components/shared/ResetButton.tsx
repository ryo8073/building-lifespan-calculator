import React from 'react';

interface Props {
  onClick: () => void;
}

export function ResetButton({ onClick }: Props) {
  return (
    <button type="button" onClick={onClick} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
      リセット
    </button>
  );
} 