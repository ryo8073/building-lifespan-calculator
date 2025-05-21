"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUsefulLifeStore } from '@/lib/store';
import { calculateUsedAssetUsefulLife, UsedAssetCalculationInput } from '@/features/data-management/usedAssetCalculationLogic';
import { LogicInfoPanel } from '@/features/used-asset-calculator/components/LogicInfoPanel';
import { Select } from '@/components/ui/Select';
import { Tabs, TabItem } from '@/components/ui/Tabs';

// 中古資産耐用年数計算フォーム
// PRD・Cursor Rulesに基づき、UI/UX・バリデーション・計算ロジック分岐・アクセシビリティを厳密実装

/**
 * 中古資産耐用年数計算フォーム
 * @param cardClassName - カードの追加クラス
 * @param inputGroupClassName - 入力グループの追加クラス
 */
export type UsedAssetCalculatorFormValues = {
  purchasePrice: string;
  improvementCost: string;
  elapsedYears: string;
  elapsedMonths: string;
  originalUsefulLife: string;
  reacquisitionPrice: string;
};

export function UsedAssetCalculatorForm({
  cardClassName = "",
  inputGroupClassName = "",
}: {
  cardClassName?: string;
  inputGroupClassName?: string;
}) {
  const usefulLifeEntry = useUsefulLifeStore((s) => s.usefulLifeEntry);
  // --- 簡便法用の状態 ---
  const [kanbenResult, setKanbenResult] = useState<ReturnType<typeof calculateUsedAssetUsefulLife> | null>(null);
  // --- 資本的支出時の判定用の状態 ---
  const [shihonResult, setShihonResult] = useState<ReturnType<typeof calculateUsedAssetUsefulLife> | null>(null);
  const [shihonShowLogicInfo, setShihonShowLogicInfo] = useState(false);
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

  // タブ切り替え状態
  const [activeTab, setActiveTab] = useState<'kanben' | 'shihon'>('kanben');
  // 経過年数入力方法
  const [elapsedInputType, setElapsedInputType] = useState<'direct' | 'fromToday' | 'fromDate'>('direct');
  const [buildDate, setBuildDate] = useState('');
  const [toDate, setToDate] = useState('');

  // 日付差分から年・月を算出
  function calcElapsedFromDates(from: string, to: string) {
    if (!from || !to) return { years: '', months: '' };
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime()) || fromDate > toDate) return { years: '', months: '' };
    let years = toDate.getFullYear() - fromDate.getFullYear();
    let months = toDate.getMonth() - fromDate.getMonth();
    if (months < 0) { years--; months += 12; }
    return { years: String(years), months: String(months) };
  }

  // --- 簡便法専用の計算ロジック ---
  const onSubmitKanben = (data: UsedAssetCalculatorFormValues) => {
    const elapsedYears = Number(data.elapsedYears) + Number(data.elapsedMonths || 0) / 12;
    const input: UsedAssetCalculationInput = {
      originalUsefulLife: Number(data.originalUsefulLife),
      elapsedYears,
      purchasePrice: 0,
      improvementCost: 0,
      reacquisitionPrice: undefined,
    };
    // 簡便法のみ計算
    const kanbenResult = calculateUsedAssetUsefulLife(input);
    setKanbenResult(kanbenResult);
  };

  // --- 資本的支出時の判定用の計算ロジック（従来通り） ---
  const onSubmitShihon = (data: UsedAssetCalculatorFormValues) => {
    const elapsedYears = Number(data.elapsedYears) + Number(data.elapsedMonths || 0) / 12;
    const input: UsedAssetCalculationInput = {
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
    let selectedResult = kanbenResult;
    const improvementCost = input.improvementCost ?? 0;
    if (input.reacquisitionPrice !== undefined) {
      if (improvementCost > input.reacquisitionPrice * 0.5) {
        selectedResult = houteiResult;
      } else if (input.purchasePrice * 0.5 < improvementCost && improvementCost <= input.reacquisitionPrice * 0.5) {
        selectedResult = mitsumoriResult;
      }
    }
    setShihonResult(selectedResult);
    setShihonShowLogicInfo(true);
  };

  /**
   * カンマ区切り補助表示
   */
  function formatNumberWithComma(n: string | number | undefined) {
    if (n === '' || n === undefined || n === null) return '';
    const num = Number(String(n).replace(/,/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString();
  }

  // 経過年数入力欄
  const elapsedInputFields = (
    <div className="space-y-2">
      <div className="flex gap-4 items-center mb-2">
        <label className="flex items-center gap-1">
          <input type="radio" name="elapsedInputType" value="fromDate" checked={elapsedInputType === 'fromDate'} onChange={() => setElapsedInputType('fromDate')} />
          建築年月日＋任意日
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" name="elapsedInputType" value="fromToday" checked={elapsedInputType === 'fromToday'} onChange={() => setElapsedInputType('fromToday')} />
          建築年月日＋今日
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" name="elapsedInputType" value="direct" checked={elapsedInputType === 'direct'} onChange={() => setElapsedInputType('direct')} />
          年月を直接入力
        </label>
      </div>
      {elapsedInputType === 'direct' && (
        <div className="flex gap-2 items-end">
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
            <Label htmlFor="elapsedMonths">月</Label>
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
      )}
      {elapsedInputType === 'fromToday' && (
        <>
          <div className="flex gap-4 items-end">
            <div>
              <Label htmlFor="buildDate" required>建築年月日</Label>
              <Input
                id="buildDate"
                type="date"
                value={buildDate}
                onChange={e => {
                  setBuildDate(e.target.value);
                }}
              />
            </div>
            <div>
              <Label htmlFor="todayDate">今日</Label>
              <Input
                id="todayDate"
                type="date"
                value={new Date().toISOString().slice(0, 10)}
                disabled
                className="bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
          {/* 経過年数表示 */}
          {watch('elapsedYears') !== '' && watch('elapsedMonths') !== '' && (
            <div className="text-sm text-blue-700 mt-2">経過年数: <span className="font-bold">{watch('elapsedYears')}</span> 年 <span className="font-bold">{watch('elapsedMonths')}</span> ヶ月</div>
          )}
        </>
      )}
      {elapsedInputType === 'fromDate' && (
        <>
          <div className="flex gap-4 items-end">
            <div>
              <Label htmlFor="buildDate2" required>建築年月日</Label>
              <Input
                id="buildDate2"
                type="date"
                value={buildDate}
                onChange={e => {
                  setBuildDate(e.target.value);
                  const { years, months } = calcElapsedFromDates(e.target.value, toDate);
                  setValue('elapsedYears', years, { shouldValidate: true });
                  setValue('elapsedMonths', months, { shouldValidate: true });
                }}
              />
            </div>
            <div>
              <Label htmlFor="toDate" required>判定日</Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={e => {
                  setToDate(e.target.value);
                  const { years, months } = calcElapsedFromDates(buildDate, e.target.value);
                  setValue('elapsedYears', years, { shouldValidate: true });
                  setValue('elapsedMonths', months, { shouldValidate: true });
                }}
              />
            </div>
          </div>
          {/* 経過年数表示 */}
          {watch('elapsedYears') !== '' && watch('elapsedMonths') !== '' && (
            <div className="text-sm text-blue-700 mt-2">経過年数: <span className="font-bold">{watch('elapsedYears')}</span> 年 <span className="font-bold">{watch('elapsedMonths')}</span> ヶ月</div>
          )}
        </>
      )}
    </div>
  );

  // 建築年月日＋今日の経過年数自動計算
  React.useEffect(() => {
    if (elapsedInputType === 'fromToday' && buildDate) {
      const today = new Date().toISOString().slice(0, 10);
      const { years, months } = calcElapsedFromDates(buildDate, today);
      setValue('elapsedYears', years, { shouldValidate: true });
      setValue('elapsedMonths', months, { shouldValidate: true });
    }
  }, [buildDate, elapsedInputType, activeTab]);

  // 建築年月日＋任意日を選択したときの経過年数自動計算
  React.useEffect(() => {
    if (elapsedInputType === 'fromDate' && buildDate && toDate) {
      const { years, months } = calcElapsedFromDates(buildDate, toDate);
      setValue('elapsedYears', years, { shouldValidate: true });
      setValue('elapsedMonths', months, { shouldValidate: true });
    }
  }, [elapsedInputType, buildDate, toDate, activeTab]);

  // タブ内容
  const tabItems: TabItem[] = [
    {
      label: '簡便法',
      key: 'kanben',
      content: (
        <form onSubmit={handleSubmit(onSubmitKanben)} aria-label="中古資産耐用年数計算フォーム-簡便法">
          {/* 経過年数入力欄（切り替えUI） */}
          {elapsedInputFields}
          {/* 法定耐用年数 */}
          <div className={`p-4 mb-2 ${inputGroupClassName}`}>
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
          {/* ボタン */}
          <div className="flex items-center justify-between pt-2">
            <Button type="submit" variant="default" size="lg" className="font-bold text-lg px-8 bg-green-600 hover:bg-green-700 text-white">
              計算
            </Button>
            <Button type="button" variant="outline" className="ml-auto border-red-300 text-red-700 hover:bg-red-50" onClick={() => { reset(); setKanbenResult(null); }}>
              リセット
            </Button>
          </div>
          {/* 結果表示 */}
          <div className="pt-6">
            {kanbenResult ? (
              <div className="rounded-md bg-green-100 p-4 border border-green-400 text-lg text-green-900" aria-live="polite">
                <div className="font-bold text-xl mb-2">計算結果: <span className="text-2xl">{kanbenResult.calculatedUsefulLife} 年</span></div>
                <div className="mb-1">適用計算方法: <span className="font-semibold">{kanbenResult.method}</span></div>
                <div className="mb-1">計算式: <span className="font-mono text-sm">{kanbenResult.formula}</span></div>
                <div className="text-sm text-muted-foreground whitespace-pre-line">{kanbenResult.breakdown}</div>
                <div className="text-xs text-muted-foreground mt-2">( 1年未満端数切捨、2年未満は2年 )</div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm" aria-live="polite">
                必須項目を入力し「計算」ボタンを押すと結果が表示されます。
              </div>
            )}
          </div>
        </form>
      ),
    },
    {
      label: '資本的支出時の判定',
      key: 'shihon',
      content: (
        <form onSubmit={handleSubmit(onSubmitShihon)} aria-label="中古資産耐用年数計算フォーム-資本的支出時の判定">
          {/* 購入価額・改良費・経過年数入力欄（経過年数欄は上記切り替えUI） */}
          <div className={`p-4 mb-2 ${inputGroupClassName}`}>
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
              name={register('purchasePrice').name}
              ref={register('purchasePrice').ref}
              onBlur={register('purchasePrice').onBlur}
              aria-invalid={!!errors.purchasePrice}
              aria-describedby="purchasePrice-error"
            />
            {errors.purchasePrice && (
              <span id="purchasePrice-error" className="text-red-500 text-xs">{errors.purchasePrice.message}</span>
            )}
            <div className="text-xs text-muted-foreground mt-1">{formatNumberWithComma(watch('purchasePrice'))}</div>
          </div>
          <div className={`p-4 mb-2 ${inputGroupClassName}`}>
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
              name={register('improvementCost').name}
              ref={register('improvementCost').ref}
              onBlur={register('improvementCost').onBlur}
              aria-invalid={!!errors.improvementCost}
              aria-describedby="improvementCost-error"
            />
            {errors.improvementCost && (
              <span id="improvementCost-error" className="text-red-500 text-xs">{errors.improvementCost.message}</span>
            )}
            <div className="text-xs text-muted-foreground mt-1">{formatNumberWithComma(watch('improvementCost'))}</div>
          </div>
          {elapsedInputFields}
          {/* 法定耐用年数 */}
          <div className={`p-4 mb-2 ${inputGroupClassName}`}>
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
          <div className={`p-4 mb-2 ${inputGroupClassName}`}>
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
              name={register('reacquisitionPrice').name}
              ref={register('reacquisitionPrice').ref}
              onBlur={register('reacquisitionPrice').onBlur}
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
            <Button type="button" variant="outline" className="ml-auto border-red-300 text-red-700 hover:bg-red-50" onClick={() => { reset(); setShihonResult(null); }}>
              リセット
            </Button>
          </div>
          {/* 結果表示 */}
          <div className="pt-6">
            {shihonResult ? (
              <div className="rounded-md bg-green-100 p-4 border border-green-400 text-lg text-green-900" aria-live="polite">
                <div className="font-bold text-xl mb-2">計算結果: <span className="text-2xl">{shihonResult.calculatedUsefulLife} 年</span></div>
                <div className="mb-1">適用計算方法: <span className="font-semibold">{shihonResult.method}</span></div>
                <div className="mb-1">計算式: <span className="font-mono text-sm">{shihonResult.formula}</span></div>
                <div className="text-sm text-muted-foreground whitespace-pre-line">{shihonResult.breakdown}</div>
                <div className="text-xs text-muted-foreground mt-2">( 1年未満端数切捨、2年未満は2年 )</div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm" aria-live="polite">
                必須項目を入力し「計算」ボタンを押すと結果が表示されます。
              </div>
            )}
          </div>
          {/* 計算根拠パネル */}
          {(shihonShowLogicInfo || shihonResult) && (
            <div className="pt-6">
              <LogicInfoPanel
                cardClassName="bg-green-50"
                values={shihonResult?.inputValues}
              />
            </div>
          )}
        </form>
      ),
    },
  ];

  return (
    <Card className={`w-full max-w-2xl p-6 mb-8 shadow-lg ${cardClassName}`}>
      <h2 className="text-xl font-semibold mb-4">2. 中古資産の耐用年数を計算</h2>
      <Tabs items={tabItems} activeKey={activeTab} onTabChange={setActiveTab} />
      {/* タブ内のフォームや結果表示はtabItemsで切り替え */}
    </Card>
  );
} 