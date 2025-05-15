import React, { createContext, useContext, useState } from 'react';

interface RootAgentContextType {
  statutoryLifespan: number | null;
  setStatutoryLifespan: (value: number) => void;
}

// RootAgentのグローバルコンテキスト（今後拡張）
const RootAgentContext = createContext<RootAgentContextType>({
  statutoryLifespan: null,
  setStatutoryLifespan: () => {},
});

export function RootAgentProvider({ children }: { children: React.ReactNode }) {
  const [statutoryLifespan, setStatutoryLifespan] = useState<number | null>(null);
  // 今後、Agent間連携やグローバル状態管理をここで実装
  return (
    <RootAgentContext.Provider value={{ statutoryLifespan, setStatutoryLifespan }}>
      {children}
    </RootAgentContext.Provider>
  );
}

export function useRootAgent() {
  return useContext(RootAgentContext);
} 