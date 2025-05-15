export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <header className="w-full max-w-2xl py-8">
        <h1 className="text-3xl font-bold text-center">建物耐用年数 判定・計算アプリ</h1>
        <p className="mt-2 text-center text-muted-foreground">法定耐用年数の検索と中古資産の耐用年数計算をサポートします</p>
      </header>
      {/* 今後、主要機能やエージェントUIをここに追加 */}
    </main>
  );
}
