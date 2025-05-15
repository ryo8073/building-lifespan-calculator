import React from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export function StructureSelector({ value, onChange, options }: Props) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option value="">選択してください</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
} 