"use client";
import React from 'react';
import { StatutoryLifespanForm } from '@/features/statutory-lifespan/components/StatutoryLifespanForm';
import { useUsefulLifeStore } from '@/lib/store';
import { UsedAssetCalculatorForm } from '@/features/used-asset-calculator/components/UsedAssetCalculatorForm';

export default function HomePage() {
  const setUsefulLifeEntry = useUsefulLifeStore((s) => s.setUsefulLifeEntry);

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-8 px-4 bg-background text-foreground">
      <header className="w-full max-w-2xl mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary mb-2">建物耐用年数 判定・計算アプリ</h1>
        <p className="text-muted-foreground text-base md:text-lg">構造・用途から法定耐用年数を検索し、中古資産の耐用年数も計算できます。</p>
      </header>
      {/* 法定耐用年数検索グループ */}
      <section className="w-full max-w-2xl mb-8">
        <StatutoryLifespanForm onUsefulLifeSelected={setUsefulLifeEntry} cardClassName="bg-blue-50 dark:bg-blue-900/20" />
      </section>
      {/* 中古資産耐用年数計算グループ */}
      <section className="w-full max-w-2xl mb-8">
        <UsedAssetCalculatorForm cardClassName="bg-yellow-50 dark:bg-yellow-900/20" />
      </section>
      <footer className="w-full max-w-2xl mt-8 text-xs text-muted-foreground text-center opacity-80">
        &copy; {new Date().getFullYear()} 建物耐用年数 判定・計算アプリ
      </footer>
    </main>
  );
} 