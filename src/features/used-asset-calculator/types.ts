export interface CalculationInput {
  purchasePrice: number;
  improvementCost?: number;
  elapsedYears: number;
  originalUsefulLife: number;
  reacquisitionPrice?: number;
}

export interface CalculationResult {
  method: string;
  usefulLife: number;
  breakdown: string;
} 