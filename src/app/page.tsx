import Link from 'next/link';

export default function Home() {
  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">建物耐用年数 判定・計算アプリ</h1>
      <p className="mb-8">法定耐用年数の検索と中古資産の耐用年数計算をサポートします。</p>
      <ul className="space-y-4">
        <li>
          <Link href="/(agents)/statutory-lifespan" className="text-blue-600 underline">
            法定耐用年数検索（StatutoryLifespanAgent）
          </Link>
        </li>
        <li>
          <Link href="/(agents)/used-asset-calculator" className="text-blue-600 underline">
            中古資産耐用年数計算（UsedAssetCalculatorAgent）
          </Link>
        </li>
      </ul>
    </main>
  );
} 