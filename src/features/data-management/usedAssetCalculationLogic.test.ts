import { calculateUsedAssetUsefulLife } from './usedAssetCalculationLogic';

describe('calculateUsedAssetUsefulLife', () => {
  it('法定耐用年数（改良費が再取得価額の50%超）', () => {
    const result = calculateUsedAssetUsefulLife({
      originalUsefulLife: 30,
      elapsedYears: 10,
      purchasePrice: 1000,
      improvementCost: 600,
      reacquisitionPrice: 1000,
    });
    expect(result.method).toBe('法定耐用年数');
    expect(result.calculatedUsefulLife).toBe(30);
  });

  it('簡便法（全部経過）', () => {
    const result = calculateUsedAssetUsefulLife({
      originalUsefulLife: 20,
      elapsedYears: 20,
      purchasePrice: 1000,
    });
    expect(result.method).toBe('簡便法');
    expect(result.calculatedUsefulLife).toBe(4); // 20*0.2=4
  });

  it('簡便法（一部経過）', () => {
    const result = calculateUsedAssetUsefulLife({
      originalUsefulLife: 30,
      elapsedYears: 10,
      purchasePrice: 1000,
    });
    // (30-10)+10*0.2 = 20+2=22
    expect(result.method).toBe('簡便法');
    expect(result.calculatedUsefulLife).toBe(22);
  });

  it('2年未満は2年', () => {
    const result = calculateUsedAssetUsefulLife({
      originalUsefulLife: 5,
      elapsedYears: 5,
      purchasePrice: 1000,
    });
    // 5*0.2=1 → 2年
    expect(result.calculatedUsefulLife).toBe(2);
  });

  it('経過年数が小数でも正しく切り捨て', () => {
    const result = calculateUsedAssetUsefulLife({
      originalUsefulLife: 10,
      elapsedYears: 3.5,
      purchasePrice: 1000,
    });
    // (10-3.5)=6.5→6, 3.5*0.2=0.7→0, 6+0=6
    expect(result.calculatedUsefulLife).toBe(6);
  });
}); 