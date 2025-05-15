// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateUsedAssetUsefulLife(originalUsefulLife: number, elapsedYears: number): number {
  // TODO: PRD D2のロジックに従い、originalUsefulLife（法定耐用年数）とelapsedYears（経過年数）を使って計算する
  // 現状はESLintエラー回避のため一時的に利用
  if (typeof originalUsefulLife !== "number" || typeof elapsedYears !== "number") {
    return 0;
  }
  // 仮のロジック（本実装時に削除）
  return originalUsefulLife - elapsedYears;
} 