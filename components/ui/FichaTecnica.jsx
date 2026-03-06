import { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function FichaTecnica({ colaborador, tipo, seguimientos, recomendaciones, onClose }) {
  const [pestanaActiva, setPestanaActiva] = useState('info');

  const calcularSemaforo = (datos) => {
    if (tipo === 'coordinacion') {
      const ftr = datos.ftr || 0;
      const tiempo = datos.tiempoPromedio || 0;
      const noConf = datos.noConformidades || 0;
      if (ftr >= 98 && tiempo <= 7 && noConf === 0) return 'VERDE';
      if (ftr >= 95 || tiempo <= 8 || noConf <= 2) return 'AMARILLO';
      return 'ROJO';
    }
    if (tipo === 'agendamiento') {
      const score = datos.scoreTotal || 0;
      if (score >= 90) return 'VERDE';
      if (score >= 70) return 'AMARILLO';
      return 'ROJO';
    }
    return 'SIN DEFINIR';
  };

  const semaforo = tipo === 'coordinacion' || tipo === 'agendamiento' 
    ? calcularSemaforo(colaborador) 
    : colaborador.semaforo;

  const getSemaforoColor = (sem) => {
    switch(sem) {
      case 'VERDE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'AMARILLO': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'ROJO': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Vista para quejas (con filtro de recomendaciones)
  if (tipo === 'queja' && colaborador.queja) {
    const q = colaborador.queja;
    const diasResolucion = q.fechaCierre && q.fechaRecepcion
      ? Math.round((new Date(q.fechaCierre) - new Date(q.fechaRecepcion)) / (1000 * 60 * 60 * 24))
      : null;

    // Filtrar recomendaciones: solo las que tengan el mismo responsable de falla (si existe) o área "Satisfacción"
    const recomendacionesRelacionadas = recomendaciones?.filter(r => 
      (q.responsableFalla && r.agente?.toLowerCase().includes(q.responsableFalla.toLowerCase())) ||
      r.area === 'Satisfacción'
    ) || [];

    const seguimientosRelacionados = seguimientos?.filter(s => 
      s.recomendacionId && recomendacionesRelacionadas.some(r => r.id === s.recomendacionId)
    ) || [];

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                  q.status === 'CERRADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>{q.status}</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{q.modalidad}</span>
                {diasResolucion && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    diasResolucion <= 2 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>{diasResolucion} días</span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-800">Queja {q.noQuejaCompleto || q.noQueja}</h2>
              <p className="text-xs text-slate-400 mt-1">{q.sucursal} · {q.proceso} · {q.mes}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <div className="border-b border-slate-100 px-6">
            <div className="flex space-x-6">
              <button onClick={() => setPestanaActiva('info')} className={`py-3 border-b-2 font-medium text-sm ${pestanaActiva==='info' ? 'border-[#0066CC] text-[#0066CC]' : 'border-transparent text-slate-400'}`}>📋 Detalle</button>
              <button onClick={() => setPestanaActiva('acciones')} className={`py-3 border-b-2 font-medium text-sm ${pestanaActiva==='acciones' ? 'border-[#0066CC] text-[#0066CC]' : 'border-transparent text-slate-400'}`}>🎯 Plan de acción</button>
              <button onClick={() => setPestanaActiva('historial')} className={`py-3 border-b-2 font-medium text-sm ${pestanaActiva==='historial' ? 'border-[#0066CC] text-[#0066CC]' : 'border-transparent text-slate-400'}`}>📊 Historial ({seguimientosRelacionados.length})</button>
            </div>
          </div>

          <div className="p-6">
            {pestanaActiva === 'info' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg"><p className="text-[10px] text-slate-400 uppercase">Sucursal</p><p className="text-sm font-bold">{q.sucursal}</p></div>
                  <div className="bg-slate-50 p-3 rounded-lg"><p className="text-[10px] text-slate-400 uppercase">Empresa</p><p className="text-sm font-bold">{q.empresa}</p></div>
                  <div className="bg-slate-50 p-3 rounded-lg"><p className="text-[10px] text-slate-400 uppercase">Procedencia</p><p className="text-sm font-bold">{q.procedencia}</p></div>
                  <div className="bg-slate-50 p-3 rounded-lg"><p className="text-[10px] text-slate-400 uppercase">Responsable</p><p className="text-sm font-bold">{q.responsableFalla || 'No asignado'}</p></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-4">⏱️ Línea de tiempo</p>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                    <div className="space-y-6">
                      <div className="relative pl-10">
                        <div className="absolute left-2 top-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                        <p className="text-xs text-slate-400">Recepción</p>
                        <p className="text-sm font-medium">{new Date(q.fechaRecepcion).toLocaleDateString()}</p>
                      </div>
                      {q.fechaCierre && (
                        <div className="relative pl-10">
                          <div className="absolute left-2 top-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                          <p className="text-xs text-slate-400">Cierre</p>
                          <p className="text-sm font-medium">{new Date(q.fechaCierre).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-500 mt-1">Tiempo de resolución: {diasResolucion} días {diasResolucion > 2 && '(⚠️ Excede meta de 2 días)'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">📝 Descripción</p>
                  <p className="text-sm whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-100">{q.descripcion}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-xs font-bold text-red-600 uppercase mb-2">🔍 Causa Raíz</p>
                  <p className="text-sm">{q.causaRaiz || 'No especificada'}</p>
                  {q.comentarios && <p className="text-xs text-slate-500 mt-2 italic">"{q.comentarios}"</p>}
                </div>
              </div>
            )}
            {pestanaActiva === 'acciones' && (
              <div className="space-y-6">
                <div className="bg-emerald-50 p-5 rounded-lg border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-600 uppercase mb-3">📌 Plan de Acción</p>
                  <p className="text-sm mb-4">{q.planAccion || 'No definido'}</p>
                  <div className="flex justify-between text-xs"><span>Responsable: {q.responsablePlan || 'No asignado'}</span>{q.fechaCierre && <span>Cerrado: {new Date(q.fechaCierre).toLocaleDateString()}</span>}</div>
                </div>
                {recomendacionesRelacionadas.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3">🤖 Recomendaciones IA relacionadas</p>
                    <div className="space-y-3">
                      {recomendacionesRelacionadas.slice(0, 3).map((rec, idx) => ( // Mostrar solo 3 para no saturar
                        <div key={idx} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${rec.nivel==='URGENTE'?'bg-red-100 text-red-700':rec.nivel==='CRÍTICO'?'bg-orange-100 text-orange-700':rec.nivel==='ALTO'?'bg-amber-100 text-amber-700':'bg-emerald-100 text-emerald-700'}`}>{rec.nivel}</span>
                            <span className="text-xs text-slate-500">{rec.area}</span>
                          </div>
                          <p className="text-sm">{rec.sugerencia}</p>
                          {rec.feedback && <p className="text-xs text-slate-600 mt-2 italic">"{rec.feedback}"</p>}
                        </div>
                      ))}
                      {recomendacionesRelacionadas.length > 3 && (
                        <p className="text-xs text-slate-400 text-center">+ {recomendacionesRelacionadas.length - 3} más</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {pestanaActiva === 'historial' && (
              <div className="space-y-4">
                {seguimientosRelacionados.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-lg"><p className="text-sm text-slate-400">No hay seguimientos</p></div>
                ) : (
                  seguimientosRelacionados.map((seg, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">{new Date(seg.fechaRegistro).toLocaleDateString()}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${seg.estado==='COMPLETADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{seg.estado}</span>
                      </div>
                      {seg.notas && <p className="text-sm"><span className="font-semibold">Notas:</span> {seg.notas}</p>}
                      {seg.acuerdos && <p className="text-sm"><span className="font-semibold">Acuerdos:</span> {seg.acuerdos}</p>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vista para colaboradores (sin cambios)
  if (tipo === 'coordinacion' || tipo === 'agendamiento') {
    // ... (mantén el código existente para colaboradores)
  }

  return null;
}
