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

  it('経過年数が小数でも正しく切り捨て（最終結果のみfloor）', () => {
    const result = calculateUsedAssetUsefulLife({
      originalUsefulLife: 10,
      elapsedYears: 3.5,
      purchasePrice: 1000,
    });
    // (10-3.5)+(3.5*0.2)=6.5+0.7=7.2→floor→7
    expect(result.calculatedUsefulLife).toBe(7);
  });

  it('簡便法（一部経過・端数処理は最終結果のみ）: 法定20年, 経過7年6ヶ月', () => {
    const result = calculateUsedAssetUsefulLife({
      originalUsefulLife: 20,
      elapsedYears: 7.5, // 7年6ヶ月
      purchasePrice: 1000,
    });
    // (20-7.5)+(7.5*0.2)=12.5+1.5=14.0→floor→14
    expect(result.method).toBe('簡便法');
    expect(result.calculatedUsefulLife).toBe(14);
  });

  it('簡便法（全部経過・ちょうど法定耐用年数）', () => {
    const result = calculateUsedAssetUsefulLife({
      originalUsefulLife: 22,
      elapsedYears: 22,
      purchasePrice: 1000,
    });
    // 22*0.2=4.4→floor→4
    expect(result.method).toBe('簡便法');
    expect(result.calculatedUsefulLife).toBe(4);
  });

  it('簡便法（全部経過超え）', () => {
    const result = calculateUsedAssetUsefulLife({
      originalUsefulLife: 22,
      elapsedYears: 30,
      purchasePrice: 1000,
    });
    // 22*0.2=4.4→floor→4
    expect(result.method).toBe('簡便法');
    expect(result.calculatedUsefulLife).toBe(4);
  });

  it('見積法の計算', () => {
    const result = calculateUsedAssetUsefulLife({
      originalUsefulLife: 30,
      elapsedYears: 10,
      purchasePrice: 10000000,
      improvementCost: 6000000,
      reacquisitionPrice: 20000000,
    });
    // 改良費600万 > 購入価額1000万×50%=500万 かつ 改良費600万 ≤ 再取得価額2000万×50%=1000万
    expect(result.method).toBe('見積法');
  });
}); 