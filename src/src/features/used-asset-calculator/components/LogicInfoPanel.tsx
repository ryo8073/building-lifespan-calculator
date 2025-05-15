import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const LogicInfoPanel: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <Card className="w-full max-w-2xl p-4 mb-8 bg-background/70">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">計算ロジック補助情報</h3>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="logic-info-panel-content">
          {open ? '閉じる' : '詳細を表示'}
        </Button>
      </div>
      {open && (
        <div id="logic-info-panel-content" className="text-sm space-y-4">
          <div>
            <div className="font-bold mb-1">簡便法</div>
            <ul className="list-disc pl-5 mb-1">
              <li>法定耐用年数の全部を経過：<br />
                <span className="font-mono">法定耐用年数 × 20%（切り捨て、2年未満は2年）</span>
              </li>
              <li>法定耐用年数の一部を経過：<br />
                <span className="font-mono">(法定耐用年数 - 経過年数) + (経過年数 × 20%)（切り捨て、2年未満は2年）</span>
              </li>
            </ul>
            <div className="text-muted-foreground">※ 1年未満の端数は切り捨て。2年未満の場合は2年。</div>
          </div>
          <div>
            <div className="font-bold mb-1">法定耐用年数をそのまま適用</div>
            <ul className="list-disc pl-5 mb-1">
              <li>改良費が再取得価額の50%超の場合は、法定耐用年数をそのまま適用</li>
            </ul>
          </div>
          <div>
            <div className="font-bold mb-1">見積法（参考）</div>
            <ul className="list-disc pl-5 mb-1">
              <li>実際の使用可能期間を合理的に見積もれる場合に限り、その年数を適用可能</li>
              <li>見積もりが困難な場合は簡便法を用いる</li>
            </ul>
            <div className="text-muted-foreground text-xs">※ 本アプリでは見積法の自動計算は行いません</div>
          </div>
          <div className="text-xs text-muted-foreground">
            詳細は <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/hojin/5404.htm" target="_blank" rel="noopener noreferrer" className="underline">国税庁: 中古資産の耐用年数</a> をご参照ください。
          </div>
        </div>
      )}
    </Card>
  );
}; 