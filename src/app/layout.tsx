import './globals.css';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { RootAgentProvider } from '../features/root-agent/RootAgentProvider';

export const metadata = {
  title: '建物耐用年数 判定・計算アプリ',
  description: '法定耐用年数の検索と中古資産の耐用年数計算をサポートします',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <RootAgentProvider>
          <div className="min-h-screen">{children}</div>
        </RootAgentProvider>
        <Footer />
      </body>
    </html>
  );
} 