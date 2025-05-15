import React from 'react';
import { CalculationResult } from '../types';

interface Props {
  result: CalculationResult | null;
}

export function ResultDisplay({ result }: Props) {
  if (!result) return null;
  return (
    <div className="mt-4 p-4 border rounded bg-white">
      <div>計算方法: {result.method}</div>
      <div>耐用年数: {result.usefulLife} 年</div>
      <div>計算根拠: {result.breakdown}</div>
    </div>
  );
} 