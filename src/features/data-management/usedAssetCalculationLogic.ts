// 中古資産耐用年数計算ロジック
// PRD D2および国税庁指針 https://www.nta.go.jp/taxes/shiraberu/taxanswer/hojin/5404.htm 参照

export interface UsedAssetCalculationInput {
  originalUsefulLife: number; // 法定耐用年数
  elapsedYears: number; // 経過年数（年＋月/12）
  purchasePrice: number; // 購入価額
  improvementCost?: number; // 改良費（任意）
  reacquisitionPrice?: number; // 再取得価額（任意）
}

export interface UsedAssetCalculationResult {
  method: '簡便法' | '見積法' | '法定耐用年数';
  calculatedUsefulLife: number;
  formula: string;
  breakdown: string;
  inputValues: UsedAssetCalculationInput;
  kanbenRawYears?: number; // 簡便法の途中計算値（小数点2桁）
}

/**
 * 中古資産の耐用年数を計算する
 * @param input 入力値
 * @returns 計算結果
 */
export function calculateUsedAssetUsefulLife(input: UsedAssetCalculationInput): UsedAssetCalculationResult {
  const { originalUsefulLife, elapsedYears, purchasePrice, improvementCost = 0, reacquisitionPrice } = input;
  // 改良費が再取得価額の50%超の場合は法定耐用年数
  if (
    reacquisitionPrice !== undefined &&
    improvementCost > reacquisitionPrice * 0.5
  ) {
    return {
      method: '法定耐用年数',
      calculatedUsefulLife: Math.floor(originalUsefulLife),
      formula: '法定耐用年数をそのまま適用',
      breakdown: `改良費が再取得価額の50%超のため、法定耐用年数（${originalUsefulLife}年）をそのまま適用します。`,
      inputValues: input,
    };
  }
  // 見積法の条件: 購入価額×50%<改良費の額≤再取得価額×50%（両方値がある場合）
  if (
    reacquisitionPrice !== undefined &&
    purchasePrice * 0.5 < improvementCost &&
    improvementCost <= reacquisitionPrice * 0.5
  ) {
    // 簡便法による見積耐用年数（小数点2桁の年数）
    const kanbenResult = calculateUsedAssetUsefulLife({
      ...input,
      improvementCost: 0, // 簡便法は改良費なしで計算
    });
    const kanben = Math.floor(kanbenResult.kanbenRawYears ?? 0); // 整数年で計算
    // 見積法計算（年数で計算）
    const purchaseExImprovement = purchasePrice - improvementCost;
    const denom = (purchaseExImprovement / kanben) + (improvementCost / originalUsefulLife);
    const estimated = purchasePrice / denom;
    const estimatedFixed = Math.floor(estimated < 2 ? 2 : estimated); // 2年未満は2年
    return {
      method: '見積法',
      calculatedUsefulLife: estimatedFixed,
      formula: `${purchasePrice} / ( ${purchaseExImprovement} / ${kanben} + ${improvementCost} / ${originalUsefulLife} )`,
      breakdown: `${purchasePrice} / ( ${purchaseExImprovement} / ${kanben} + ${improvementCost} / ${originalUsefulLife} ) = ${estimated.toFixed(2)}年 → ${estimatedFixed}年（1年未満端数切捨、2年未満は2年）`,
      inputValues: input,
      kanbenRawYears: kanben,
    };
  }
  // 法定耐用年数の全部を経過した資産
  if (elapsedYears >= originalUsefulLife) {
    // 月単位で計算
    const originalUsefulLifeMonths = Math.round(originalUsefulLife * 12);
    const y = Math.floor(originalUsefulLifeMonths * 0.2);
    const n = y;
    const rawYears = n / 12;
    const resultMonths = Math.max(24, y); // 2年未満は2年=24ヶ月
    let resultYears = Math.floor(resultMonths / 12);
    if (resultYears < 2) resultYears = 2;
    return {
      method: '簡便法',
      calculatedUsefulLife: resultYears,
      formula: '法定耐用年数（月）×20%→年数に換算',
      breakdown: `法定耐用年数の全部を経過したため、${originalUsefulLifeMonths}×0.2=${y}ヶ月→${rawYears.toFixed(2)}年→${resultYears}年。2年未満の場合は2年。`,
      inputValues: input,
      kanbenRawYears: rawYears,
    };
  }
  // 法定耐用年数の一部を経過した資産
  if (elapsedYears < originalUsefulLife) {
    // 月単位で計算
    const originalUsefulLifeMonths = Math.round(originalUsefulLife * 12);
    const elapsedMonths = Math.round(elapsedYears * 12);
    const a = originalUsefulLifeMonths - elapsedMonths;
    const b = Math.floor(elapsedMonths * 0.2);
    let n = a + b;
    if (n < 24) n = 24; // 2年未満は2年=24ヶ月
    const rawYears = n / 12;
    const resultYears = Math.floor(n / 12);
    return {
      method: '簡便法',
      calculatedUsefulLife: resultYears,
      formula: '(法定耐用年数（月）-経過月)+(経過月×20%)→年数に換算',
      breakdown: `法定耐用年数の一部を経過したため、(${originalUsefulLifeMonths}-${elapsedMonths})+(${elapsedMonths}×0.2)=${a}+${b}=${n}ヶ月→${rawYears.toFixed(2)}年→${resultYears}年。2年未満の場合は2年。`,
      inputValues: input,
      kanbenRawYears: rawYears,
    };
  }
  // 万一該当しない場合
  return {
    method: '簡便法',
    calculatedUsefulLife: 2,
    formula: '特例: 2年',
    breakdown: '計算条件に該当しないため2年とします。',
    inputValues: input,
  };
} 