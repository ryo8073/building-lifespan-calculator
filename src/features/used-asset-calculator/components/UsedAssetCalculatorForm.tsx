"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUsefulLifeStore } from '@/lib/store';
import { calculateUsedAssetUsefulLife } from '@/features/data-management/usedAssetCalculationLogic';
import { LogicInfoPanel } from '@/features/used-asset-calculator/components/LogicInfoPanel';
import { Select } from '@/components/ui/Select';

// 型定義（削除されている場合用）
export type UsedAssetCalculatorFormValues = {
  purchasePrice: string;
  improvementCost: string;
  elapsedYears: string;
  elapsedMonths: string;
  originalUsefulLife: string;
  reacquisitionPrice: string;
};

export function UsedAssetCalculatorForm({
  cardClassName = "bg-gray-50 dark:bg-neutral-900"
}: {
  cardClassName?: string;
}) {
  const usefulLifeEntry = useUsefulLifeStore((s) => s.usefulLifeEntry);
  const [result, setResult] = useState<ReturnType<typeof calculateUsedAssetUsefulLife> | null>(null);
  const [showLogicInfo, setShowLogicInfo] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UsedAssetCalculatorFormValues>({
    defaultValues: {
      purchasePrice: '',
      improvementCost: '',
      elapsedYears: '',
      elapsedMonths: '',
      originalUsefulLife: String(usefulLifeEntry?.usefulLife ?? ''),
      reacquisitionPrice: '',
    },
  });

  // usefulLifeEntryが変わったらoriginalUsefulLifeを更新
  React.useEffect(() => {
    setValue('originalUsefulLife', String(usefulLifeEntry?.usefulLife ?? ''));
  }, [usefulLifeEntry, setValue]);

  const onSubmit = (data: UsedAssetCalculatorFormValues) => {
    // 入力値を計算ロジック用に整形
    const elapsedYears = Number(data.elapsedYears) + Number(data.elapsedMonths || 0) / 12;
    const input = {
      originalUsefulLife: Number(data.originalUsefulLife),
      elapsedYears,
      purchasePrice: Number(data.purchasePrice),
      improvementCost: data.improvementCost === '' ? 0 : Number(data.improvementCost),
      reacquisitionPrice: data.reacquisitionPrice === '' ? undefined : Number(data.reacquisitionPrice),
    };
    // 全方式の計算を実行
    const kanbenResult = calculateUsedAssetUsefulLife({ ...input, improvementCost: 0 });
    const mitsumoriResult = calculateUsedAssetUsefulLife(input);
    const houteiResult = {
      method: '法定耐用年数' as const,
      calculatedUsefulLife: Math.floor(input.originalUsefulLife),
      formula: '法定耐用年数をそのまま適用',
      breakdown: `改良費が再取得価額の50%超のため、法定耐用年数（${input.originalUsefulLife}年）をそのまま適用します。`,
      inputValues: input,
    };
    // 判定表の分岐ロジック
    let selectedResult = kanbenResult;
    if (input.reacquisitionPrice !== undefined) {
      if (input.improvementCost > input.reacquisitionPrice * 0.5) {
        selectedResult = houteiResult;
      } else if (input.purchasePrice * 0.5 < input.improvementCost && input.improvementCost <= input.reacquisitionPrice * 0.5) {
        selectedResult = mitsumoriResult;
      }
    }
    setResult(selectedResult);
    setShowLogicInfo(true);
  };

  function formatNumberWithComma(n: string | number | undefined) {
    if (n === '' || n === undefined || n === null) return '';
    const num = Number(String(n).replace(/,/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString();
  }

  // 金額欄用register分割
  const { ref: purchasePriceRef, name: purchasePriceName, onBlur: purchasePriceOnBlur } = register('purchasePrice', {
    required: '必須項目です',
    validate: v => {
      if (typeof v !== 'string') return '数字のみで入力してください';
      if (v === '' || !/^\d+$/.test(v)) return '数字のみで入力してください';
      if (Number(v) < 0) return '0以上で入力してください';
      return true;
    },
  });
  const { ref: improvementCostRef, name: improvementCostName, onBlur: improvementCostOnBlur } = register('improvementCost', {
    validate: v => {
      if (v === '') return true;
      if (typeof v !== 'string') return '数字のみで入力してください';
      if (!/^\d+$/.test(v)) return '数字のみで入力してください';
      if (Number(v) < 0) return '0以上で入力してください';
      return true;
    },
  });
  const { ref: reacquisitionPriceRef, name: reacquisitionPriceName, onBlur: reacquisitionPriceOnBlur } = register('reacquisitionPrice', {
    validate: v => {
      if (v === '') return true;
      if (typeof v !== 'string') return '数字のみで入力してください';
      if (!/^\d+$/.test(v)) return '数字のみで入力してください';
      if (Number(v) < 0) return '0以上で入力してください';
      return true;
    },
  });

  return (
    <Card className={`w-full max-w-2xl p-6 mb-8 shadow-lg ${cardClassName}`}>
      <h2 className="text-xl font-semibold mb-4">2. 中古資産の耐用年数を計算</h2>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} aria-label="中古資産耐用年数計算フォーム">
        {/* 購入価額 */}
        <div className="p-4 mb-2">
          <Label htmlFor="purchasePrice" required>
            購入価額 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="purchasePrice"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={String(watch('purchasePrice') ?? '')}
            onChange={e => {
              const raw = e.target.value.replace(/,/g, '');
              if (!/^\d*$/.test(raw)) return;
              setValue('purchasePrice', String(raw), { shouldValidate: true });
            }}
            name={purchasePriceName}
            ref={purchasePriceRef}
            onBlur={purchasePriceOnBlur}
            aria-invalid={!!errors.purchasePrice}
            aria-describedby="purchasePrice-error"
          />
          {errors.purchasePrice && (
            <span id="purchasePrice-error" className="text-red-500 text-xs">{errors.purchasePrice.message}</span>
          )}
          <div className="text-xs text-muted-foreground mt-1">{formatNumberWithComma(watch('purchasePrice'))}</div>
        </div>
        {/* 改良費 */}
        <div className="p-4 mb-2">
          <Label htmlFor="improvementCost">
            うち改良に要した金額
          </Label>
          <Input
            id="improvementCost"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={String(watch('improvementCost') ?? '')}
            onChange={e => {
              const raw = e.target.value.replace(/,/g, '');
              if (!/^\d*$/.test(raw)) return;
              setValue('improvementCost', String(raw), { shouldValidate: true });
            }}
            name={improvementCostName}
            ref={improvementCostRef}
            onBlur={improvementCostOnBlur}
            aria-invalid={!!errors.improvementCost}
            aria-describedby="improvementCost-error"
          />
          {errors.improvementCost && (
            <span id="improvementCost-error" className="text-red-500 text-xs">{errors.improvementCost.message}</span>
          )}
          <div className="text-xs text-muted-foreground mt-1">{formatNumberWithComma(watch('improvementCost'))}</div>
        </div>
        {/* 経過年月 */}
        <div className="flex gap-2 items-end p-4 mb-2">
          <div className="flex-1">
            <Label htmlFor="elapsedYears" required>
              経過年数 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="elapsedYears"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={String(watch('elapsedYears') ?? '')}
              onChange={e => {
                const raw = e.target.value.replace(/,/g, '');
                if (!/^\d*$/.test(raw)) return;
                setValue('elapsedYears', String(raw), { shouldValidate: true });
              }}
              name={register('elapsedYears').name}
              ref={register('elapsedYears').ref}
              onBlur={register('elapsedYears').onBlur}
              aria-invalid={!!errors.elapsedYears}
              aria-describedby="elapsedYears-error"
            />
            {errors.elapsedYears && (
              <span id="elapsedYears-error" className="text-red-500 text-xs">{errors.elapsedYears.message}</span>
            )}
          </div>
          <span className="pb-2">年</span>
          <div className="flex-1">
            <Label htmlFor="elapsedMonths">
              月
            </Label>
            <Select
              id="elapsedMonths"
              {...register('elapsedMonths', { required: false })}
              defaultValue="0"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </Select>
            {errors.elapsedMonths && (
              <span id="elapsedMonths-error" className="text-red-500 text-xs">{errors.elapsedMonths.message}</span>
            )}
          </div>
        </div>
        {/* 法定耐用年数 */}
        <div className="p-4 mb-2">
          <Label htmlFor="originalUsefulLife" required>
            法定耐用年数 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="originalUsefulLife"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={String(watch('originalUsefulLife') ?? '')}
            onChange={e => {
              const raw = e.target.value.replace(/,/g, '');
              if (!/^\d*$/.test(raw)) return;
              setValue('originalUsefulLife', String(raw), { shouldValidate: true });
            }}
            name={register('originalUsefulLife').name}
            ref={register('originalUsefulLife').ref}
            onBlur={register('originalUsefulLife').onBlur}
            aria-invalid={!!errors.originalUsefulLife}
            aria-describedby="originalUsefulLife-error"
          />
          {errors.originalUsefulLife && (
            <span id="originalUsefulLife-error" className="text-red-500 text-xs">{errors.originalUsefulLife.message}</span>
          )}
        </div>
        {/* 再取得価額 */}
        <div className="p-4 mb-2">
          <Label htmlFor="reacquisitionPrice">
            再取得価額
          </Label>
          <Input
            id="reacquisitionPrice"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={String(watch('reacquisitionPrice') ?? '')}
            onChange={e => {
              const raw = e.target.value.replace(/,/g, '');
              if (!/^\d*$/.test(raw)) return;
              setValue('reacquisitionPrice', String(raw), { shouldValidate: true });
            }}
            name={reacquisitionPriceName}
            ref={reacquisitionPriceRef}
            onBlur={reacquisitionPriceOnBlur}
            aria-invalid={!!errors.reacquisitionPrice}
            aria-describedby="reacquisitionPrice-error"
          />
          {errors.reacquisitionPrice && (
            <span id="reacquisitionPrice-error" className="text-red-500 text-xs">{errors.reacquisitionPrice.message}</span>
          )}
          <div className="text-xs text-muted-foreground mt-1">{formatNumberWithComma(watch('reacquisitionPrice'))}</div>
        </div>
        {/* ボタン */}
        <div className="flex items-center justify-between pt-2">
          <Button type="submit" variant="default" size="lg" className="font-bold text-lg px-8 bg-green-600 hover:bg-green-700 text-white">
            計算
          </Button>
          <Button type="button" variant="outline" className="ml-auto border-red-300 text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => { reset(); setResult(null); setShowLogicInfo(false); }}>
            リセット
          </Button>
        </div>
      </form>
      {/* 結果表示 */}
      <div className="pt-6">
        {result ? (
          <div className="rounded-md bg-green-100 dark:bg-green-900/30 p-4 border border-green-400 text-lg text-green-900 dark:text-green-100" aria-live="polite">
            <div className="font-bold text-xl mb-2">計算結果: <span className="text-2xl">{result.calculatedUsefulLife} 年</span></div>
            <div className="mb-1">適用計算方法: <span className="font-semibold">{result.method}</span></div>
            <div className="mb-1">計算式: <span className="font-mono text-sm">{result.formula}</span></div>
            <div className="text-sm text-muted-foreground whitespace-pre-line">{result.breakdown}</div>
            <div className="text-xs text-muted-foreground mt-2">( 1年未満端数切捨、2年未満は2年 )</div>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm" aria-live="polite">
            必須項目を入力し「計算」ボタンを押すと結果が表示されます。
          </div>
        )}
      </div>
      {/* 計算根拠パネル */}
      {(showLogicInfo || result) && (
        <div className="pt-6">
          <LogicInfoPanel
            cardClassName="bg-green-50 dark:bg-green-900/20"
            values={result?.inputValues}
          />
        </div>
      )}
    </Card>
  );
} 