import { useState } from 'react';

export default function SatisfaccionFicha({ queja, idx, fichaExpandida, setFichaExpandida }) {
  const calcularTiempoCierre = (fechaRecepcion, fechaCierre) => {
    if (!fechaCierre) return 'Pendiente';
    const inicio = new Date(fechaRecepcion);
    const fin = new Date(fechaCierre);
    const horas = Math.round((fin - inicio) / (1000 * 60 * 60));
    return horas;
  };

  const tiempoCierre = queja.tiempoCierre || 
    (queja.fechaCierre ? calcularTiempoCierre(queja.fechaRecepcion, queja.fechaCierre) : 'N/A');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Cabecera de la ficha */}
      <div 
        className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={() => setFichaExpandida(fichaExpandida === idx ? null : idx)}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs font-black text-slate-400">{queja.noQuejaCompleto}</span>
          <span className="text-sm font-medium">{queja.sucursal}</span>
          <span className="text-xs px-2 py-1 rounded-full bg-white border">
            {queja.proceso}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            queja.status === 'CERRADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {queja.status}
          </span>
          <span className="text-xs text-slate-500">
            ⏱️ {typeof tiempoCierre === 'number' ? `${tiempoCierre} hrs` : tiempoCierre}
          </span>
        </div>
        <div className="text-slate-400">
          {fichaExpandida === idx ? '▼' : '▶'}
        </div>
      </div>

      {/* Detalle expandido */}
      {fichaExpandida === idx && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 mb-1">📅 Fecha recepción</p>
              <p className="font-medium">{new Date(queja.fechaRecepcion).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">🏢 Empresa</p>
              <p className="font-medium">{queja.empresa}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">📍 Procedencia</p>
              <p className="font-medium">{queja.procedencia}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">📋 Subproceso</p>
              <p className="font-medium">{queja.subProceso}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">⚠️ Motivo</p>
              <p className="font-medium">{queja.motivo}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">👤 Responsable falla</p>
              <p className="font-medium">{queja.responsableFalla || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">📝 Descripción</p>
            <p className="text-sm">{queja.descripcion}</p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-600 mb-1">🔍 Causa Raíz</p>
            <p className="text-sm">{queja.causaRaiz}</p>
          </div>

          <div className="bg-emerald-50 p-3 rounded-lg">
            <p className="text-xs text-emerald-600 mb-1">📌 Plan de Acción</p>
            <p className="text-sm">{queja.planAccion}</p>
            <p className="text-xs text-emerald-600 mt-2">Responsable: {queja.responsablePlan || 'N/A'}</p>
          </div>

          <div className="flex justify-between text-xs text-slate-400 pt-2 border-t">
            <span>🆔 CITA: {queja.cita}</span>
            <span>📁 MODALIDAD: {queja.modalidad}</span>
            <span>🎫 # acción: {queja.accionCorrectiva}</span>
          </div>
        </div>
      )}
    </div>
  );
}
