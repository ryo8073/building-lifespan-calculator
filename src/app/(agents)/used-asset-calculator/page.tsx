import { useEffect } from 'react';
import { useRootAgent } from '@/features/root-agent/RootAgentProvider';
import { useUsedAssetCalculation } from '@/features/used-asset-calculator/hooks/useUsedAssetCalculation';
import { CalculationForm } from '@/features/used-asset-calculator/components/CalculationForm';
import { ResultDisplay } from '@/features/used-asset-calculator/components/ResultDisplay';

export default function UsedAssetCalculatorPage() {
  const { statutoryLifespan } = useRootAgent();
  const { input, setInput, result, calculate } = useUsedAssetCalculation();

  // 法定耐用年数がRootAgentで更新されたら自動反映
  useEffect(() => {
    if (statutoryLifespan && input.originalUsefulLife !== statutoryLifespan) {
      setInput(prev => ({ ...prev, originalUsefulLife: statutoryLifespan }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statutoryLifespan]);

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">中古資産耐用年数計算（UsedAssetCalculatorAgent）</h2>
      <CalculationForm value={input} onChange={setInput} onSubmit={calculate} />
      <ResultDisplay result={result} />
    </main>
  );
} 