import { useState } from 'react';
import { CalculationInput, CalculationResult } from '../types';
import { calculateUsedAssetUsefulLife } from '../../data-management/usedAssetCalculationLogic';

export function useUsedAssetCalculation() {
  const [input, setInput] = useState<CalculationInput>({
    purchasePrice: 0,
    improvementCost: 0,
    elapsedYears: 0,
    originalUsefulLife: 0,
    reacquisitionPrice: 0,
  });
  const [result, setResult] = useState<CalculationResult | null>(null);

  function calculate() {
    // 仮ロジック: 計算関数を呼び出し
    const usefulLife = calculateUsedAssetUsefulLife(input.originalUsefulLife, input.elapsedYears);
    setResult({
      method: '仮ロジック',
      usefulLife,
      breakdown: 'originalUsefulLife - elapsedYears',
    });
  }

  return { input, setInput, result, calculate };
} 