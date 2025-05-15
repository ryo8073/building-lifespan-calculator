# 建物耐用年数 判定・計算アプリ (Next.js, Agentアーキテクチャ版)

## 概要

建物の法定耐用年数を構造や用途から段階的に検索し、さらにその結果を用いて中古資産の耐用年数を計算するためのWebアプリケーションです。将来の拡張性と保守性を高めるため、機能ごとに責務を分割したAgentベースのアーキテクチャ（概念モデル）を採用し、Next.jsとTypeScriptで構築されています。

## 機能

-   **法定耐用年数検索 (StatutoryLifespanAgent):**
    -   「構造・用途」「細目」「骨格材の肉厚（金属造の場合のみ）」を選択し、法定耐用年数を特定。
    -   選択肢は動的にフィルタリング。
-   **中古資産耐用年数計算 (UsedAssetCalculatorAgent):**
    -   購入価額、改良費、経過年月（elapsedYears）、法定耐用年数（originalUsefulLife、検索結果を自動入力、編集可）、再取得価額を入力。
    -   国税庁基準に基づき、簡便法、見積法等を適用して中古資産の耐用年数を計算。
    -   計算には、ユーザーが入力した「法定耐用年数（originalUsefulLife）」および「経過年数（elapsedYears）」が必ず利用される。
    -   適用計算方法と計算過程を詳細に表示。
-   **計算ロジック補助情報表示:**
    -   中古資産耐用年数計算の判定基準や計算方法の概要を表示（トグル可能）。
-   **クリア機能 (RootAgent経由):**
    -   ワンクリックで全入力・選択項目と結果をリセット。
-   **モダンUI/UX:**
    -   2024/2025年のデザイントレンドを取り入れた、クリーンで直感的なインターフェース。
    -   ダークモード対応、レスポンシブデザイン、アクセシビリティ配慮。

## 技術スタック

-   **フレームワーク:** [Next.js](https://nextjs.org/) (App Router推奨)
-   **言語:** [TypeScript](https://www.typescriptlang.org/)
-   **状態管理:** React Hooks (`useState`, `useMemo`, `useContext`)。Agent間のより複雑な状態共有には [Zustand](https://zustand-demo.pmnd.rs/) または [Jotai](https://jotai.org/) を検討。
-   **スタイリング:** [Tailwind CSS](https://tailwindcss.com/) または CSS Modules + [PostCSS](https://postcss.org/)
-   **UIコンポーネントライブラリ (任意):** [shadcn/ui](https://ui.shadcn.com/) (Tailwindベース)、[Mantine](https://mantine.dev/) など
-   **フォーム管理 (任意):** [React Hook Form](https://react-hook-form.com/)
-   **テスト:** [Jest](https://jestjs.io/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
-   **リンター/フォーマッター:** ESLint, Prettier

## プロジェクト構造 (詳細は `PROJECT_STRUCTURE.md` を参照)
/
├── app/ # Next.js App Router (推奨)
│ ├── (agents)/ # Agent別ルーティング/UIコンポーネント群 (ルートグループ)
│ │ ├── statutory-lifespan/
│ │ └── used-asset-calculator/
│ ├── layout.tsx # RootAgentが管理するメインレイアウト
│ └── page.tsx # アプリケーションのエントリポイント
├── components/ # 共有UIコンポーネント
│ ├── ui/ # shadcn/ui などのベースコンポーネント (例: Button, Input)
│ └── layout/ # ヘッダー、フッターなど
├── features/ # Agentごとのビジネスロジック、カスタムフック、型定義など
│ ├── statutory-lifespan/ # StatutoryLifespanAgent関連
│ │ ├── components/ # このAgent専用のUIコンポーネント
│ │ ├── hooks/
│ │ ├── services/ # データ処理、計算ロジック
│ │ └── types.ts
│ ├── used-asset-calculator/ # UsedAssetCalculatorAgent関連
│ │ └── ...
│ └── data-management/ # DataManagementAgent関連 (データ本体とアクセス関数)
│ ├── buildingLifespanData.ts
│ └── usedAssetCalculationLogic.ts
├── lib/ # ユーティリティ関数、定数など
├── public/ # 静的アセット
├── styles/ # グローバルスタイル、Tailwind設定など
├── .eslintrc.json
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md # このファイル

## セットアップとローカル実行

1.  **リポジトリをクローン:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```
2.  **依存関係をインストール:**
    ```bash
    npm install
    # または yarn install / pnpm install
    ```
3.  **(初回のみ) データファイル準備:**
    提供されたCSVファイル (`BuildingLifespan(UTF8).csv`) をもとに、`features/data-management/buildingLifespanData.ts` を作成/更新します。
    このファイルは、CSVデータをTypeScriptのオブジェクト配列としてエクスポートする形式が推奨されます。
    ```typescript
    // features/data-management/buildingLifespanData.ts
    import { BuildingLifespanEntry } from '@/features/statutory-lifespan/types'; // 型定義は各featureで

    export const buildingLifespanData: BuildingLifespanEntry[] = [
      { structureUsage: "木造・合成樹脂造のもの", details: "事務所用のもの",  thickness: null, usefulLife: 24 },
      // ... more data
    ];
    ```
4.  **開発サーバーを起動:**
    ```bash
    npm run dev
    # または yarn dev / pnpm dev
    ```
5.  ブラウザで `http://localhost:3000` (または指定されたポート) を開きます。

## ビルドとデプロイ

-   **ビルド:**
    ```bash
    npm run build
    ```
-   デプロイはVercel, Netlifyなどのプラットフォームが推奨されます。

---

# Next.jsプロジェクトセットアップ情報

このアプリは [Next.js](https://nextjs.org) の [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) でブートストラップされています。

## 開発サーバーの起動

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開いてください。

`src/app/page.tsx` を編集してページをカスタマイズできます。保存すると自動でリロードされます。

## Next.jsリソース

- [Next.js Documentation](https://nextjs.org/docs) - Next.jsの機能やAPIについて
- [Learn Next.js](https://nextjs.org/learn) - インタラクティブなNext.jsチュートリアル
- [Next.js GitHub repository](https://github.com/vercel/next.js)

## デプロイ

最も簡単なデプロイ方法は [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) を利用することです。

[Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) も参照してください。
