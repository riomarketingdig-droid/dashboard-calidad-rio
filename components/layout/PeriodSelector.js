import { useState } from 'react';

export default function PeriodSelector() {
  const [period, setPeriod] = useState('year');
  const [includeDeparted, setIncludeDeparted] = useState(false);

  const periods = [
    { id: '52weeks', label: 'Últimas 52 Semanas' },
    { id: 'year', label: 'Año Completo' },
    { id: 'semester', label: 'Semestre' },
    { id: 'quarter', label: 'Trimestre' },
    { id: 'bimonth', label: 'Bimestre' },
    { id: 'month', label: 'Mes' },
    { id: 'week', label: 'Semana' },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Período:</span>
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            {periods.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>
        
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input 
            type="checkbox" 
            checked={includeDeparted}
            onChange={(e) => setIncludeDeparted(e.target.checked)}
            className="rounded border-slate-300 text-slate-800 focus:ring-slate-200"
          />
          Incluir agentes que se fueron
        </label>

        <div className="ml-auto text-xs text-slate-400 font-mono bg-slate-50 px-3 py-1.5 rounded-lg">
          Ene 2025 - Dic 2025
        </div>
      </div>
    </div>
  );
}
