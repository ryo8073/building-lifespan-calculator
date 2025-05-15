"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function formatNumber(n: number | string | undefined) {
  if (n === undefined || n === null || n === '—') return '—';
  return Number(n).toLocaleString();
}

export function LogicInfoPanel({
  cardClassName = "bg-muted/60",
  values,
  // calcResult（未使用）
}: {
  cardClassName?: string;
  values?: {
    originalUsefulLife?: number;
    elapsedYears?: number;
    purchasePrice?: number;
    improvementCost?: number;
    reacquisitionPrice?: number;
  };
  // calcResult（未使用）
}) {
  const [open, setOpen] = useState(true);
  // 動的な式生成
  // 簡便法の式（月数ベースで途中経過も表示）
  let kanbenExpr = '';
  if (values && values.originalUsefulLife && values.elapsedYears !== undefined) {
    const originalUsefulLifeMonths = Math.round(values.originalUsefulLife * 12);
    const elapsedMonths = Math.round((values.elapsedYears ?? 0) * 12);
    const a = originalUsefulLifeMonths - elapsedMonths;
    const b = Math.floor(elapsedMonths * 0.2);
    const n = a + b;
    const rawYears = n / 12;
    const resultYears = Math.floor(Math.max(n, 24) / 12);
    kanbenExpr = `(${formatNumber(originalUsefulLifeMonths)}-${formatNumber(elapsedMonths)})+(${formatNumber(elapsedMonths)}×0.2)=${formatNumber(a)}+${formatNumber(b)}=${formatNumber(n)}ヶ月→${rawYears.toFixed(2)}年→${resultYears}年`;
  }
  // 見積法の式（年数で計算、答えも正しい値を表示）
  let mitsumoriExpr = '';
  if (
    values &&
    values.purchasePrice !== undefined &&
    values.improvementCost !== undefined &&
    values.originalUsefulLife !== undefined &&
    values.reacquisitionPrice !== undefined
  ) {
    // 簡便法の整数年
    const originalUsefulLifeMonths = Math.round(values.originalUsefulLife * 12);
    const elapsedMonths = Math.round((values.elapsedYears ?? 0) * 12);
    const a = originalUsefulLifeMonths - elapsedMonths;
    const b = Math.floor(elapsedMonths * 0.2);
    const n = a + b;
    const kanbenInt = Math.floor(Math.max(n, 24) / 12);
    const purchaseExImprovement = values.purchasePrice - values.improvementCost;
    // 分母
    const denom = (purchaseExImprovement / kanbenInt) + (values.improvementCost / values.originalUsefulLife);
    const estimated = values.purchasePrice / denom;
    const estimatedFixed = Math.floor(estimated < 2 ? 2 : estimated);
    mitsumoriExpr = `${formatNumber(values.purchasePrice)} / ( ${formatNumber(purchaseExImprovement)} / ${kanbenInt} ＋ ${formatNumber(values.improvementCost)} / ${values.originalUsefulLife} ) = ${estimated.toFixed(2)}年 → ${estimatedFixed}年`;
  }
  // 判定ロジック
  let 判定簡便法 = false, 判定見積法 = false, 判定法定 = false;
  if (values && values.purchasePrice !== undefined && values.improvementCost !== undefined && values.reacquisitionPrice !== undefined) {
    const purchase = Number(values.purchasePrice);
    const improvement = Number(values.improvementCost);
    const reacquisition = Number(values.reacquisitionPrice);
    if (purchase * 0.5 >= improvement) {
      判定簡便法 = true;
    } else if (purchase * 0.5 < improvement && improvement <= reacquisition * 0.5) {
      判定見積法 = true;
    } else if (improvement > reacquisition * 0.5) {
      判定法定 = true;
    }
  }
  return (
    <section className="w-full max-w-2xl mb-8">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold">計算根拠：</span>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="logic-info-panel">
          {open ? "非表示" : "表示"}
        </Button>
      </div>
      {open && (
        <Card id="logic-info-panel" className={`p-6 ${cardClassName}`}>
          <ol className="list-decimal pl-6 space-y-4 text-sm">
            <li>
              <span className="font-bold">簡便法</span><br />
              <span className="text-xs">（法定耐用年月－経過年月）＋経過年月×20％＝見積耐用年数</span><br />
              <span className="font-mono">{kanbenExpr}</span>
            </li>
            <li>
              <span className="font-bold">見積法</span><br />
              <span className="text-xs">中古資産の購入価額（改良費含む）／（中古資産の購入価額（改良費除く）／簡便法による見積耐用年数＋改良費の額／法定耐用年数）＝見積耐用年数</span><br />
              <span className="font-mono">{mitsumoriExpr}</span>
            </li>
            <li>
              <span className="font-bold">判定</span>
              <div className="overflow-x-auto mt-2">
                <table className="min-w-full border text-xs">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border px-2 py-1">判定</th>
                      <th className="border px-2 py-1">見積方法</th>
                      <th className="border px-2 py-1">結果</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-2 py-1">中古資産の購入価額×50％<span className='mx-1'>&ge;</span>改良費</td>
                      <td className="border px-2 py-1">簡便法</td>
                      <td className="border px-2 py-1 text-center">{判定簡便法 ? '✔' : ''}</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1">
                        <span>中古資産の購入価額×50％<span className='mx-1'>&lt;</span>改良費の額</span><br />
                        <span className="inline-block pl-4">改良費の額<span className='mx-1'>&le;</span>再取得価額×50％</span>
                      </td>
                      <td className="border px-2 py-1">見積法</td>
                      <td className="border px-2 py-1 text-center">{判定見積法 ? '✔' : ''}</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1">改良費<span className='mx-1'>&gt;</span>再取得価額×50％</td>
                      <td className="border px-2 py-1">法定耐用年数</td>
                      <td className="border px-2 py-1 text-center">{判定法定 ? '✔' : ''}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </li>
          </ol>
        </Card>
      )}
    </section>
  );
} 