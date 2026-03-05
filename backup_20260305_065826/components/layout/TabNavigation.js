import { useState } from 'react';

export default function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'gerencial', label: 'VISIÓN GERENCIAL', icon: '📊' },
    { id: 'coordinacion', label: 'COORDINACIÓN', icon: '✓' },
    { id: 'agendamiento', label: 'AGENDAMIENTO', icon: '📅' },
  ];

  return (
    <div className="border-b border-slate-200 mb-6">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
              ${activeTab === tab.id
                ? 'border-slate-800 text-slate-800'
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
              }
            `}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
