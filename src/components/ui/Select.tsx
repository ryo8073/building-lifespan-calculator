import * as React from "react";

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

// value, onChangeは将来の拡張用。現状未使用だが、ESLintエラー回避のためアンダースコア付きで受け取る。
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Select({ value, onChange, children, className = "" }: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
} 