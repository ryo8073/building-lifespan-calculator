import React from 'react';

export function Footer() {
  return (
    <footer className="w-full py-4 px-8 bg-gray-100 text-gray-600 text-center mt-8">
      <small>&copy; {new Date().getFullYear()} 建物耐用年数 判定・計算アプリ</small>
    </footer>
  );
} 