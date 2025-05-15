// shadcn/ui互換のクラス名結合ユーティリティ
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
} 