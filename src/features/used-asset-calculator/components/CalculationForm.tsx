import React from 'react';
import { CalculationInput } from '../types';

interface Props {
  value: CalculationInput;
  onChange: (value: CalculationInput) => void;
  onSubmit: () => void;
}

export function CalculationForm({ value, onChange, onSubmit }: Props) {
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
      <div>
        <label>購入価額: <input type="number" value={value.purchasePrice} onChange={e => onChange({ ...value, purchasePrice: Number(e.target.value) })} /></label>
      </div>
      <div>
        <label>改良費: <input type="number" value={value.improvementCost ?? ''} onChange={e => onChange({ ...value, improvementCost: Number(e.target.value) })} /></label>
      </div>
      <div>
        <label>経過年数: <input type="number" value={value.elapsedYears} onChange={e => onChange({ ...value, elapsedYears: Number(e.target.value) })} /></label>
      </div>
      <div>
        <label>法定耐用年数: <input type="number" value={value.originalUsefulLife} onChange={e => onChange({ ...value, originalUsefulLife: Number(e.target.value) })} /></label>
      </div>
      <div>
        <label>再取得価額: <input type="number" value={value.reacquisitionPrice ?? ''} onChange={e => onChange({ ...value, reacquisitionPrice: Number(e.target.value) })} /></label>
      </div>
      <button type="submit">計算</button>
    </form>
  );
} 