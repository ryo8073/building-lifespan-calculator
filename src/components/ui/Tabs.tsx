import React from 'react';

export type TabItem = {
  label: string;
  key: string;
  content: React.ReactNode;
};

export function Tabs({
  items,
  activeKey,
  onTabChange,
  className = '',
}: {
  items: TabItem[];
  activeKey: string;
  onTabChange: (key: string) => void;
  className?: string;
}) {
  const activeItem = items.find(item => item.key === activeKey) || items[0];
  return (
    <div className={`w-full ${className}`}>
      <div className="flex border-b mb-6 bg-gray-50 rounded-t-lg overflow-x-auto">
        {items.map((item, idx) => (
          <React.Fragment key={item.key}>
            <button
              className={`relative px-8 py-3 text-lg font-semibold transition-colors duration-150 focus:outline-none
                ${item.key === activeKey
                  ? 'text-blue-700 bg-white border-b-4 border-blue-600 shadow-sm z-10'
                  : 'text-gray-400 bg-gray-50 hover:text-blue-600 hover:bg-white border-b-4 border-transparent'}
                ${idx !== 0 ? 'ml-2' : ''}
                rounded-t-lg
              `}
              style={{ minWidth: 120 }}
              onClick={() => onTabChange(item.key)}
              type="button"
              aria-selected={item.key === activeKey}
              role="tab"
            >
              {item.label}
            </button>
            {idx < items.length - 1 && (
              <div className="h-8 w-px bg-gray-200 self-center mx-1" aria-hidden="true"></div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="pt-4" role="tabpanel">
        {activeItem?.content}
      </div>
    </div>
  );
} 