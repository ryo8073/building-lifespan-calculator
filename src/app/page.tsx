"use client";
import React, { useMemo } from 'react';
import { buildingLifespanData } from '../features/data-management/buildingLifespanData';
import { useStatutoryLifespanFilter } from '../features/statutory-lifespan/hooks/useStatutoryLifespanFilter';
import { useUsedAssetCalculation } from '../features/used-asset-calculator/hooks/useUsedAssetCalculation';

export default function Home() {
  // 法定耐用年数 検索ロジック
  const {
    structure, setStructure,
    details, setDetails,
    thickness, setThickness,
    filtered,
  } = useStatutoryLifespanFilter(buildingLifespanData);

  // 検索結果（1件のみ想定）
  const result = filtered.length === 1 ? filtered[0] : null;

  // 中古資産計算ロジック
  const { input, setInput, result: calcResult, calculate } = useUsedAssetCalculation();

  // 法定耐用年数を自動反映
  React.useEffect(() => {
    if (result) {
      setInput((prev) => ({ ...prev, originalUsefulLife: result.usefulLife }));
    }
  }, [result, setInput]);

  // セレクトボックス用オプション
  const structureOptions = useMemo(() => Array.from(new Set(buildingLifespanData.map(d => d.structureUsage))), []);
  const detailsOptions = useMemo(() => Array.from(new Set(buildingLifespanData.filter(d => !structure || d.structureUsage === structure).map(d => d.details))), [structure]);
  const thicknessOptions = useMemo(() => Array.from(new Set(buildingLifespanData.filter(d => (!structure || d.structureUsage === structure) && (!details || d.details === details)).map(d => d.thickness).filter(Boolean))), [structure, details]);

  // クリア
  const handleClear = () => {
    setStructure('');
    setDetails('');
    setThickness('');
  };

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-8">
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">1. 建物の法定耐用年数検索</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">構造・用途</label>
            <select className="w-full border rounded p-2" value={structure} onChange={e => setStructure(e.target.value)}>
              <option value="">選択してください</option>
              {structureOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">細目</label>
            <select className="w-full border rounded p-2" value={details} onChange={e => setDetails(e.target.value)} disabled={!structure}>
              <option value="">選択してください</option>
              {detailsOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">肉厚</label>
            <select className="w-full border rounded p-2" value={thickness} onChange={e => setThickness(e.target.value)} disabled={!details || thicknessOptions.length === 0}>
              <option value="">選択してください</option>
              {thicknessOptions.map(opt => (
                <option key={opt ?? ''} value={opt ?? ''}>{opt ?? ''}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={handleClear} type="button">クリア</button>
        </div>
        {result ? (
          <div className="mt-4 p-4 border rounded bg-blue-50">
            <div className="font-bold text-lg">法定耐用年数: <span className="text-blue-700">{result.usefulLife} 年</span></div>
            <div className="text-sm text-gray-600">構造・用途: {result.structureUsage} / 細目: {result.details} {result.thickness ? `/ 肉厚: ${result.thickness}` : ''}</div>
          </div>
        ) : (
          <div className="mt-4 text-gray-500">条件を選択してください</div>
        )}
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">2. 中古資産耐用年数計算</h2>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); calculate(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">購入価額</label>
              <input type="number" className="w-full border rounded p-2" value={input.purchasePrice} onChange={e => setInput({ ...input, purchasePrice: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">改良費</label>
              <input type="number" className="w-full border rounded p-2" value={input.improvementCost ?? ''} onChange={e => setInput({ ...input, improvementCost: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">経過年数</label>
              <input type="number" className="w-full border rounded p-2" value={input.elapsedYears} onChange={e => setInput({ ...input, elapsedYears: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">法定耐用年数</label>
              <input type="number" className="w-full border rounded p-2 bg-gray-100" value={input.originalUsefulLife} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">再取得価額</label>
              <input type="number" className="w-full border rounded p-2" value={input.reacquisitionPrice ?? ''} onChange={e => setInput({ ...input, reacquisitionPrice: Number(e.target.value) })} />
            </div>
          </div>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">計算</button>
        </form>
        {calcResult && (
          <div className="mt-6 p-4 border rounded bg-green-50">
            <div className="font-bold text-lg">計算方法: {calcResult.method}</div>
            <div className="text-lg">耐用年数: <span className="text-green-700">{calcResult.usefulLife} 年</span></div>
            <div className="text-sm text-gray-600">計算根拠: {calcResult.breakdown}</div>
          </div>
        )}
      </section>
    </main>
  );
} 