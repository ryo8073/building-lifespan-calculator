import { useState } from 'react';
import { BuildingLifespanEntry } from '../types';

export function useStatutoryLifespanFilter(data: BuildingLifespanEntry[]) {
  const [structure, setStructure] = useState('');
  const [details, setDetails] = useState('');
  const [thickness, setThickness] = useState('');

  // 構造・用途でフィルタ
  const filteredByStructure = data.filter(d => !structure || d.structureUsage === structure);
  // 細目でフィルタ
  const filteredByDetails = filteredByStructure.filter(d => !details || d.details === details);
  // 肉厚でフィルタ
  const filteredByThickness = filteredByDetails.filter(d => !thickness || d.thickness === thickness);

  return {
    structure, setStructure,
    details, setDetails,
    thickness, setThickness,
    filtered: filteredByThickness,
  };
} 