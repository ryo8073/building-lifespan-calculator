# Project Structure - 建物耐用年数 判定・計算アプリ

このドキュメントは、プロジェクトのディレクトリ構造と各ファイル/ディレクトリの役割について詳述します。
Agentベースのアーキテクチャを採用し、機能ごとの関心の分離と将来の拡張性を目指します。

## トップレベルディレクトリ

-   **`/app`**: Next.js 13+ の App Router を使用したアプリケーションのコア。ルーティング、レイアウト、ページが含まれます。
    -   **`/(agents)/`**: ルートグループとしてAgentごとのUIコンポーネント群を配置します。これによりURL構造に影響を与えずにファイルを整理できます。
        -   **`statutory-lifespan/`**: 法定耐用年数検索機能（F1）に関連するUIコンポーネントや、この機能専用のページセクションを含みます。`features/statutory-lifespan` のロジックを利用します。
        -   **`used-asset-calculator/`**: 中古資産耐用年数計算機能（F2）に関連するUIコンポーネントや、専用のページセクションを含みます。`features/used-asset-calculator` のロジックを利用します。
    -   **`layout.tsx`**: アプリケーション全体のルートレイアウト。HTMLの`<body>`やグローバルなコンテキストプロバイダー（テーマ、状態管理など）を定義します。RootAgentの責務の一部。
    -   **`page.tsx`**: アプリケーションのメインページ (`/`)。各AgentのUIコンポーネントを組み合わせて表示します。RootAgentがオーケストレーションを行います。
    -   **`globals.css`**: グローバルなCSSスタイル。Tailwind CSSのベーススタイルやカスタムグローバルスタイルを定義。
    -   **`loading.tsx` (任意)**: ルートレベルのローディングUI。
    -   **`error.tsx` (任意)**: ルートレベルのエラーUI。

-   **`/components`**: アプリケーション全体で再利用可能なUIコンポーネント。
    -   **`/ui/`**: `shadcn/ui`のようなライブラリから導入した汎用UIコンポーネント（Button, Input, Select, Cardなど）。これらはスタイル付けされた基本的なビルディングブロックです。
    -   **`/layout/`**: ヘッダー、フッター、サイドバー、メインコンテンツラッパーなど、ページ構造を定義するコンポーネント。
    -   **`/shared/`**: プロジェクト固有の共有コンポーネントで、特定の機能に密結合していないもの（例: ResetButton, InfoTooltip）。

-   **`/features`**: アプリケーションの各主要機能（Agentの責務に対応）のビジネスロジック、状態管理、カスタムフック、APIサービス、型定義などを格納します。UIからロジックを分離し、再利用性とテスト容易性を高めます。
    -   **`/statutory-lifespan/` (StatutoryLifespanAgent関連):**
        -   `components/`: この機能（法定耐用年数検索）専用のUIコンポーネント（例: `StructureSelector`, `DetailsSelector`）。`app/(agents)/statutory-lifespan/` から利用されます。
        -   `hooks/`: この機能特有のカスタムフック（例: `useStatutoryLifespanFilter`）。
        -   `services/`: データフィルタリングロジック、`DataManagementAgent`へのアクセスなど。
        -   `types.ts`: この機能に関連するTypeScriptの型定義（例: `BuildingLifespanEntry`, `FilterState`）。
    -   **`/used-asset-calculator/` (UsedAssetCalculatorAgent関連):**
        -   `components/`: この機能（中古資産耐用年数計算）専用のUIコンポーネント（例: `CalculationForm`, `ResultDisplay`, `LogicBreakdown`）。`app/(agents)/used-asset-calculator/` から利用されます。
        -   `hooks/`: この機能特有のカスタムフック（例: `useUsedAssetCalculation`）。
        -   `services/`: 計算実行ロジック、`DataManagementAgent`へのアクセスなど。
        -   `types.ts`: この機能に関連するTypeScriptの型定義（例: `CalculationInput`, `CalculationResult`）。
    -   **`/data-management/` (DataManagementAgent関連):**
        -   `buildingLifespanData.ts`: 法定耐用年数のマスターデータ（CSVから変換）。
        -   `usedAssetCalculationLogic.ts`: 中古資産耐用年数の計算式や判定ロジックを実装した関数群。
        -   `dataAccess.ts` (任意): データへの統一的なアクセスポイントを提供する関数群。

-   **`/lib`**: アプリケーション全体で使われる汎用的なユーティリティ関数、ヘルパー、定数など。特定の機能に依存しないもの。
    -   `utils.ts`: フォーマッター、バリデーターなどの汎用関数。
    -   `constants.ts`: アプリケーション全体で使われる定数。

-   **`/public`**: 静的ファイル（画像、フォントファイル、faviconなど）を格納します。Next.jsによってルートパスから配信されます。

-   **`/styles`**: グローバルなスタイルシートやTailwind CSSの設定ファイルなど。
    -   `tailwind.config.ts`: Tailwind CSSの設定ファイル。
    -   `postcss.config.js`: PostCSSの設定ファイル。

## 設定ファイル (ルート)

-   `.eslintrc.json`: ESLintの設定ファイル。コード品質とスタイルの一貫性を保ちます。
-   `.gitignore`: Gitが追跡しないファイルやディレクトリを指定します。
-   `next.config.js`: Next.jsのカスタム設定を行います（例: 環境変数、リダイレクト、画像最適化）。
-   `package.json`: プロジェクトの依存関係、スクリプト（dev, build, testなど）を定義します。
-   `tsconfig.json`: TypeScriptコンパイラの設定ファイル。
-   `README.md`: プロジェクトの概要、セットアップ手順、主要機能などを記述します。
-   `PROJECT_STRUCTURE.md`: このファイル。

## Agentアーキテクチャとディレクトリ構造の関連

-   **RootAgent:** `/app/layout.tsx` でグローバルな状態管理・Agent間連携・指示を担うProvider（例: `RootAgentProvider`）をラップし、UIの全体構造とAgentの協調を管理します。グローバルな状態管理やイベント仲介はReact Contextで実装されます。
-   **StatutoryLifespanAgent, UsedAssetCalculatorAgent:** これらは概念的なAgentであり、その責務は `/features/<agent-name>/` ディレクトリ内のロジックと、`/app/(agents)/<agent-name>/` ディレクトリ内のUIに分散して実装されます。
-   **DataManagementAgent:** 主に `/features/data-management/` ディレクトリ内のデータとそのアクセスロジックとして実装されます。

この構造は、関心の分離を促進し、各機能（Agent）の開発とテストを独立して行いやすくすることを目的としています。