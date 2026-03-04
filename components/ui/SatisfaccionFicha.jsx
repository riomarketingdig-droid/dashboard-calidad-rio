import { useState } from 'react';

export default function SatisfaccionFicha({ queja, onVerDetalle }) {
  const [expandida, setExpandida] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Cabecera siempre visible */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-slate-400">{queja.noQueja}</span>
          <button
            onClick={() => onVerDetalle(queja)}
            className="text-sm font-medium text-[#0066CC] hover:underline"
          >
            {queja.sucursal}
          </button>
          <span className="text-xs px-2 py-1 rounded-full bg-slate-100">
            {queja.proceso}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            queja.status === 'CERRADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {queja.status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">⏱️ {queja.tiempoCierre || 'Pendiente'} hrs</span>
          <button
            onClick={() => setExpandida(!expandida)}
            className="text-slate-400 hover:text-slate-600"
          >
            {expandida ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {/* Vista expandida con preview */}
      {expandida && (
        <div className="p-4 border-t border-slate-100 space-y-3">
          <p className="text-xs text-slate-600 line-clamp-3">{queja.descripcion}</p>
          <div className="flex gap-2 text-[10px]">
            <span className="bg-red-50 text-red-600 px-2 py-1 rounded">⚠️ {queja.motivo}</span>
            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">👤 {queja.responsableFalla || 'Sin responsable'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
