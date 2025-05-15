"use client";

import React, { useMemo, useState } from 'react';
import { buildingLifespanData } from '@/features/data-management/buildingLifespanData';
import { BuildingLifespanEntry } from '@/features/statutory-lifespan/types';
import { Select, SelectItem } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';

export function StatutoryLifespanForm({
  onUsefulLifeSelected,
  cardClassName = "bg-background/80"
}: {
  onUsefulLifeSelected?: (entry: BuildingLifespanEntry | null) => void;
  cardClassName?: string;
}) {
  // ステート
  const [structureUsage, setStructureUsage] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [thickness, setThickness] = useState<string>('');

  // 構造・用途の選択肢
  const structureOptions = useMemo(() => {
    return Array.from(new Set(buildingLifespanData.map((d) => d.structureUsage)));
  }, []);

  // 細目の選択肢（構造・用途でフィルタ）
  const detailsOptions = useMemo(() => {
    if (!structureUsage) return [];
    return Array.from(
      new Set(
        buildingLifespanData
          .filter((d) => d.structureUsage === structureUsage)
          .map((d) => d.details)
      )
    );
  }, [structureUsage]);

  // 骨格材の肉厚の選択肢（金属造のもののみ）
  const thicknessOptions = useMemo(() => {
    if (structureUsage !== '金属造のもの' || !details) return [];
    return Array.from(
      new Set(
        buildingLifespanData
          .filter((d) => d.structureUsage === structureUsage && d.details === details)
          .map((d) => d.thickness)
      )
    ).filter(Boolean) as string[];
  }, [structureUsage, details]);

  // 結果の取得
  const selectedEntry = useMemo(() => {
    if (!structureUsage || !details) return null;
    if (structureUsage === '金属造のもの') {
      if (!thickness) return null;
      return buildingLifespanData.find(
        (d) => d.structureUsage === structureUsage && d.details === details && d.thickness === thickness
      ) || null;
    }
    return (
      buildingLifespanData.find(
        (d) => d.structureUsage === structureUsage && d.details === details
      ) || null
    );
  }, [structureUsage, details, thickness]);

  // 結果通知
  React.useEffect(() => {
    if (onUsefulLifeSelected) {
      onUsefulLifeSelected(selectedEntry);
    }
  }, [selectedEntry, onUsefulLifeSelected]);

  // UI
  return (
    <Card className={`w-full max-w-2xl p-6 mb-8 shadow-lg ${cardClassName}`}>
      <h2 className="text-xl font-semibold mb-4">1. 建物の法定耐用年数を検索</h2>
      <form className="space-y-6" aria-label="建物の法定耐用年数検索フォーム">
        {/* 構造・用途 */}
        <div>
          <Label htmlFor="structureUsage" required>
            構造・用途 <span className="text-red-500">*</span>
          </Label>
          <Select
            id="structureUsage"
            name="structureUsage"
            value={structureUsage}
            onChange={(e) => {
              setStructureUsage(e.target.value);
              setDetails('');
              setThickness('');
            }}
            required
            aria-required="true"
          >
            <option value="" disabled>
              選択してください
            </option>
            {structureOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </Select>
        </div>
        {/* 細目 */}
        <div>
          <Label htmlFor="details" required>
            細目 <span className="text-red-500">*</span>
          </Label>
          <Select
            id="details"
            name="details"
            value={details}
            onChange={(e) => {
              setDetails(e.target.value);
              setThickness('');
            }}
            required
            aria-required="true"
            disabled={!structureUsage}
          >
            <option value="" disabled>
              {structureUsage ? '選択してください' : '先に構造・用途を選択'}
            </option>
            {detailsOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </Select>
        </div>
        {/* 骨格材の肉厚（金属造のもののみ） */}
        {structureUsage === '金属造のもの' && (
          <div>
            <Label htmlFor="thickness" required>
              骨格材の肉厚 <span className="text-red-500">*</span>
            </Label>
            <Select
              id="thickness"
              name="thickness"
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              required
              aria-required="true"
              disabled={!details}
            >
              <option value="" disabled>
                {details ? '選択してください' : '先に細目を選択'}
              </option>
              {thicknessOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </Select>
          </div>
        )}
        {/* 結果表示 */}
        <div className="pt-4">
          {selectedEntry ? (
            <div className="rounded-md bg-accent/40 p-4 border border-accent text-lg font-bold text-primary flex items-center gap-2" aria-live="polite">
              法定耐用年数: <span className="text-2xl">{selectedEntry.usefulLife} 年</span>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm" aria-live="polite">
              必須項目をすべて選択すると法定耐用年数が表示されます。
            </div>
          )}
        </div>
      </form>
    </Card>
  );
} 