import { useState } from 'react';
import { buildingLifespanData } from '@/features/data-management/buildingLifespanData';
import { StructureSelector } from '@/features/statutory-lifespan/components/StructureSelector';
import { DetailsSelector } from '@/features/statutory-lifespan/components/DetailsSelector';
import { ThicknessSelector } from '@/features/statutory-lifespan/components/ThicknessSelector';
import { useRootAgent } from '@/features/root-agent/RootAgentProvider';

export default function StatutoryLifespanPage() {
  const [structure, setStructure] = useState('');
  const [details, setDetails] = useState('');
  const [thickness, setThickness] = useState('');
  const { setStatutoryLifespan } = useRootAgent();

  // 選択肢生成
  const structureOptions = Array.from(new Set(buildingLifespanData.map(d => d.structureUsage)));
  const detailsOptions = Array.from(new Set(buildingLifespanData.filter(d => !structure || d.structureUsage === structure).map(d => d.details)));
  const showThickness = structure === '金属造のもの';
  const thicknessOptions = showThickness ? Array.from(new Set(buildingLifespanData.filter(d => d.structureUsage === structure && d.details === details && d.thickness).map(d => d.thickness!))) : [];

  // 結果取得
  const filtered = buildingLifespanData.filter(d =>
    (!structure || d.structureUsage === structure) &&
    (!details || d.details === details) &&
    (!showThickness || !d.thickness || d.thickness === thickness)
  );
  const result = filtered.length === 1 ? filtered[0] : null;

  // RootAgentに結果をセット
  if (result) setStatutoryLifespan?.(result.usefulLife);

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">法定耐用年数検索（StatutoryLifespanAgent）</h2>
      <div className="mb-4">
        <label>構造・用途: <StructureSelector value={structure} onChange={setStructure} options={structureOptions} /></label>
      </div>
      <div className="mb-4">
        <label>細目: <DetailsSelector value={details} onChange={setDetails} options={detailsOptions} /></label>
      </div>
      {showThickness && (
        <div className="mb-4">
          <label>骨格材の肉厚: <ThicknessSelector value={thickness} onChange={setThickness} options={thicknessOptions} /></label>
        </div>
      )}
      <div className="mt-6">
        {result ? (
          <div className="p-4 border rounded bg-white">
            <div>法定耐用年数: <span className="font-bold text-lg">{result.usefulLife} 年</span></div>
          </div>
        ) : (
          <div className="text-gray-500">すべて選択すると耐用年数が表示されます</div>
        )}
      </div>
    </main>
  );
} 