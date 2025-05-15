"use client";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { buildingLifespanData } from "../features/data-management/buildingLifespanData";
import { useStatutoryLifespanFilter } from "../features/statutory-lifespan/hooks/useStatutoryLifespanFilter";
import { useUsedAssetCalculation } from "../features/used-asset-calculator/hooks/useUsedAssetCalculation";

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Home() {
  // ダークモード切替
  const [dark, setDark] = useState(false);
  React.useEffect(() => {
    if (dark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [dark]);

  // 法定耐用年数 検索ロジック
  const {
    structure,
    setStructure,
    details,
    setDetails,
    thickness,
    setThickness,
    filtered,
  } = useStatutoryLifespanFilter(buildingLifespanData);
  const result = filtered.length === 1 ? filtered[0] : null;

  // React Hook Form for Used Asset Calculation
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset: resetForm,
    watch,
  } = useForm({
    defaultValues: {
      purchasePrice: "",
      improvementCost: "",
      elapsedYears: "",
      originalUsefulLife: result?.usefulLife ?? "",
      reacquisitionPrice: "",
    },
    mode: "onBlur",
  });

  // 中古資産計算ロジック
  const { result: calcResult, calculate } = useUsedAssetCalculation();
  const [loading, setLoading] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // 法定耐用年数を自動反映
  React.useEffect(() => {
    if (result) {
      setValue("originalUsefulLife", result.usefulLife);
    }
  }, [result, setValue]);

  // セレクトボックス用オプション
  const structureOptions = useMemo(
    () => Array.from(new Set(buildingLifespanData.map((d) => d.structureUsage))),
    []
  );
  const detailsOptions = useMemo(
    () =>
      Array.from(
        new Set(
          buildingLifespanData
            .filter((d) => !structure || d.structureUsage === structure)
            .map((d) => d.details)
        )
      ),
    [structure]
  );
  const thicknessOptions = useMemo(
    () =>
      Array.from(
        new Set(
          buildingLifespanData
            .filter(
              (d) =>
                (!structure || d.structureUsage === structure) &&
                (!details || d.details === details)
            )
            .map((d) => d.thickness)
            .filter(Boolean)
        )
      ),
    [structure, details]
  );

  // クリア
  const handleClear = () => {
    setStructure("");
    setDetails("");
    setThickness("");
    resetForm();
  };

  // 計算実行
  const onSubmit = (data: any) => {
    setLoading(true);
    setTimeout(() => {
      calculate();
      setLoading(false);
    }, 600); // 疑似ローディング
  };

  return (
    <main className={classNames(
      "max-w-3xl mx-auto p-4 md:p-8 space-y-10",
      dark ? "bg-background-dark text-gray-100" : "bg-background-light text-gray-900"
    )}>
      {/* ヘッダー・ダークモードトグル */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">建物耐用年数 判定・計算アプリ</h1>
        <button
          aria-label="ダークモード切替"
          className="rounded-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow hover:scale-105 transition"
          onClick={() => setDark((v) => !v)}
        >
          {dark ? (
            <span aria-hidden>🌙</span>
          ) : (
            <span aria-hidden>☀️</span>
          )}
        </button>
      </header>

      {/* 法定耐用年数検索 */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8 space-y-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg md:text-xl font-semibold">1. 法定耐用年数検索</h2>
          <button
            type="button"
            className="text-sm px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition"
            onClick={handleClear}
          >
            クリア
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 label-required">構造・用途</label>
            <select
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary transition"
              value={structure}
              onChange={(e) => setStructure(e.target.value)}
              aria-required="true"
            >
              <option value="">選択してください</option>
              {structureOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 label-required">細目</label>
            <select
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary transition"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              disabled={!structure}
              aria-required="true"
            >
              <option value="">選択してください</option>
              {detailsOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              肉厚
              {structure === "金属造のもの" && <span className="text-red-500">*</span>}
            </label>
            <select
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary transition"
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              disabled={!details || thicknessOptions.length === 0}
              aria-required={structure === "金属造のもの"}
            >
              <option value="">選択してください</option>
              {thicknessOptions.map((opt) => (
                <option key={opt ?? ""} value={opt ?? ""}>
                  {opt ?? ""}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          {result ? (
            <div className="mt-4 p-4 border rounded-xl bg-blue-50 dark:bg-blue-950 flex flex-col gap-2 animate-fade-in">
              <div className="font-bold text-lg md:text-xl text-primary">法定耐用年数: <span className="text-2xl md:text-3xl">{result.usefulLife} 年</span></div>
              <div className="text-sm text-gray-600 dark:text-gray-300">構造・用途: {result.structureUsage} / 細目: {result.details} {result.thickness ? `/ 肉厚: ${result.thickness}` : ""}</div>
            </div>
          ) : (
            <div className="mt-4 text-gray-500">条件を選択してください</div>
          )}
        </div>
      </section>

      {/* 中古資産耐用年数計算 */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8 space-y-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg md:text-xl font-semibold mb-2">2. 中古資産耐用年数計算</h2>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} autoComplete="off" aria-label="中古資産耐用年数計算フォーム">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 label-required" htmlFor="purchasePrice">購入価額</label>
              <input
                id="purchasePrice"
                type="number"
                className={classNames(
                  "w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary transition",
                  errors.purchasePrice && "border-red-500"
                )}
                placeholder="例: 10000000"
                {...register("purchasePrice", { required: "必須項目です" })}
                aria-invalid={!!errors.purchasePrice}
                aria-required="true"
              />
              {errors.purchasePrice && <span className="text-red-500 text-xs">{errors.purchasePrice.message as string}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="improvementCost">改良費</label>
              <input
                id="improvementCost"
                type="number"
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary transition"
                placeholder="例: 500000"
                {...register("improvementCost")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 label-required" htmlFor="elapsedYears">経過年数</label>
              <input
                id="elapsedYears"
                type="number"
                className={classNames(
                  "w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary transition",
                  errors.elapsedYears && "border-red-500"
                )}
                placeholder="例: 10"
                {...register("elapsedYears", { required: "必須項目です" })}
                aria-invalid={!!errors.elapsedYears}
                aria-required="true"
              />
              {errors.elapsedYears && <span className="text-red-500 text-xs">{errors.elapsedYears.message as string}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 label-required" htmlFor="originalUsefulLife">法定耐用年数</label>
              <input
                id="originalUsefulLife"
                type="number"
                className={classNames(
                  "w-full border rounded-lg p-2 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary transition",
                  errors.originalUsefulLife && "border-red-500"
                )}
                readOnly
                {...register("originalUsefulLife", { required: "必須項目です" })}
                aria-invalid={!!errors.originalUsefulLife}
                aria-required="true"
              />
              {errors.originalUsefulLife && <span className="text-red-500 text-xs">{errors.originalUsefulLife.message as string}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="reacquisitionPrice">再取得価額</label>
              <input
                id="reacquisitionPrice"
                type="number"
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary transition"
                placeholder="例: 2000000"
                {...register("reacquisitionPrice")}
              />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary transition font-semibold disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2"><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>計算中...</span>
              ) : (
                "計算"
              )}
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              onClick={handleClear}
            >
              リセット
            </button>
          </div>
        </form>
        {calcResult && (
          <div className="mt-6 p-4 border rounded-xl bg-green-50 dark:bg-green-900 animate-fade-in">
            <div className="font-bold text-lg md:text-xl text-green-700 dark:text-green-300">計算方法: {calcResult.method}</div>
            <div className="text-2xl md:text-3xl font-bold text-green-800 dark:text-green-200">耐用年数: {calcResult.usefulLife} 年</div>
            <button
              className="mt-2 text-primary underline hover:text-primary-dark transition text-sm"
              onClick={() => setShowBreakdown((v) => !v)}
              aria-expanded={showBreakdown}
              aria-controls="breakdown"
            >
              {showBreakdown ? "計算根拠を隠す" : "計算根拠を表示"}
            </button>
            {showBreakdown && (
              <div id="breakdown" className="mt-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-700">
                {calcResult.breakdown}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 補助情報（プログレッシブ・ディスクロージャー） */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4 md:p-6 border border-gray-100 dark:border-gray-700">
        <details className="group">
          <summary className="cursor-pointer text-primary font-semibold text-base md:text-lg select-none outline-none focus:ring-2 focus:ring-primary rounded transition">
            中古資産耐用年数計算の計算方法・根拠（国税庁指針）
          </summary>
          <div className="mt-3 prose prose-sm dark:prose-invert max-w-none">
            <ul>
              <li>簡便法、見積法、法定耐用年数法の3方式があります。</li>
              <li>経過年数や再取得価額等の条件により自動判定されます。</li>
              <li>計算式や適用条件の詳細は<a href="https://www.nta.go.jp/law/tsutatsu/kobetsu/sozoku/930630/01.htm" target="_blank" rel="noopener noreferrer">国税庁公式サイト</a>を参照してください。</li>
            </ul>
            <table>
              <thead>
                <tr><th>方式</th><th>概要</th><th>主な計算式</th></tr>
              </thead>
              <tbody>
                <tr><td>簡便法</td><td>法定耐用年数の20%+経過年数</td><td>（法定耐用年数−経過年数）×0.2+経過年数</td></tr>
                <tr><td>見積法</td><td>専門家見積もり等</td><td>個別見積もり</td></tr>
                <tr><td>法定耐用年数法</td><td>新築時の耐用年数をそのまま適用</td><td>法定耐用年数</td></tr>
              </tbody>
            </table>
          </div>
        </details>
      </section>
    </main>
  );
} 