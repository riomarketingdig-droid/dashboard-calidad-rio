import { useState } from 'react';
import InfoTooltip from './InfoTooltip';

export default function FichaTecnica({ colaborador, tipo, seguimientos, recomendaciones, onClose }) {
  const [pestanaActiva, setPestanaActiva] = useState('info');
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  // ============================================
  // VISTA PARA QUEJAS (mejorada)
  // ============================================
  if (tipo === 'queja' && colaborador.queja) {
    const q = colaborador.queja;
    
    // Calcular tiempo de resolución si no viene
    const tiempoResolucion = q.tiempoCierre || (q.fechaCierre && q.fechaRecepcion 
      ? Math.round((new Date(q.fechaCierre) - new Date(q.fechaRecepcion)) / (1000 * 60 * 60))
      : null);

    // Buscar recomendaciones relacionadas con esta queja
    const recomendacionesRelacionadas = recomendaciones?.filter(r => 
      r.area === q.proceso || r.agente === q.responsableFalla
    ) || [];

    // Buscar seguimientos relacionados
    const seguimientosRelacionados = seguimientos?.filter(s => 
      s.recomendacionId && recomendacionesRelacionadas.some(r => r.id === s.recomendacionId)
    ) || [];

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          
          {/* HEADER MEJORADO */}
          <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                  q.status === 'CERRADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {q.status}
                </span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                  {q.modalidad}
                </span>
                {tiempoResolucion && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tiempoResolucion <= 48 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {tiempoResolucion} hrs
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-800">Queja {q.noQuejaCompleto}</h2>
              <p className="text-xs text-slate-400 mt-1">
                {q.sucursal} · {q.proceso} · {q.mes} {q.semana ? `Sem ${q.semana}` : ''}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* PESTAÑAS DE NAVEGACIÓN */}
          <div className="border-b border-slate-100 px-6">
            <div className="flex space-x-6">
              <button
                onClick={() => setPestanaActiva('info')}
                className={`py-3 border-b-2 font-medium text-sm transition-colors ${
                  pestanaActiva === 'info'
                    ? 'border-[#0066CC] text-[#0066CC]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                📋 Detalle de la queja
              </button>
              <button
                onClick={() => setPestanaActiva('acciones')}
                className={`py-3 border-b-2 font-medium text-sm transition-colors ${
                  pestanaActiva === 'acciones'
                    ? 'border-[#0066CC] text-[#0066CC]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                🎯 Plan de acción
              </button>
              <button
                onClick={() => setPestanaActiva('historial')}
                className={`py-3 border-b-2 font-medium text-sm transition-colors ${
                  pestanaActiva === 'historial'
                    ? 'border-[#0066CC] text-[#0066CC]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                📊 Historial ({seguimientosRelacionados.length})
              </button>
            </div>
          </div>

          {/* CONTENIDO SEGÚN PESTAÑA */}
          <div className="p-6">
            {/* PESTAÑA INFO - DETALLE COMPLETO */}
            {pestanaActiva === 'info' && (
              <div className="space-y-6">
                {/* Métricas clave */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-[10px] text-slate-400 uppercase">Sucursal</p>
                    <p className="text-sm font-bold">{q.sucursal}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-[10px] text-slate-400 uppercase">Empresa</p>
                    <p className="text-sm font-bold">{q.empresa}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-[10px] text-slate-400 uppercase">Procedencia</p>
                    <p className="text-sm font-bold">{q.procedencia}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-[10px] text-slate-400 uppercase">Responsable falla</p>
                    <p className="text-sm font-bold">{q.responsableFalla || 'No asignado'}</p>
                  </div>
                </div>

                {/* Línea de tiempo */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-4">⏱️ Línea de tiempo</p>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                    <div className="space-y-6">
                      <div className="relative pl-10">
                        <div className="absolute left-2 top-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                        <p className="text-xs text-slate-400">Recepción</p>
                        <p className="text-sm font-medium">{new Date(q.fechaRecepcion).toLocaleString()}</p>
                      </div>
                      {q.fechaCierre && (
                        <div className="relative pl-10">
                          <div className="absolute left-2 top-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                          <p className="text-xs text-slate-400">Cierre</p>
                          <p className="text-sm font-medium">{new Date(q.fechaCierre).toLocaleString()}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Tiempo de resolución: {tiempoResolucion} horas
                            {tiempoResolucion > 48 && ' (⚠️ Excede meta de 48hrs)'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">📝 Descripción</p>
                  <p className="text-sm whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-100">
                    {q.descripcion}
                  </p>
                </div>

                {/* Causa Raíz */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-xs font-bold text-red-600 uppercase mb-2">🔍 Causa Raíz</p>
                  <p className="text-sm">{q.causaRaiz || 'No especificada'}</p>
                  {q.comentarios && (
                    <p className="text-xs text-slate-500 mt-2 italic">"{q.comentarios}"</p>
                  )}
                </div>

                {/* Metadata adicional */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-lg">
                  <div>
                    <span className="text-slate-400 block">Motivo:</span>
                    <span className="font-medium">{q.motivo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Subproceso:</span>
                    <span className="font-medium">{q.subProceso}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">CITA:</span>
                    <span className="font-medium">{q.cita}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block"># Acción correctiva:</span>
                    <span className="font-medium">{q.accionCorrectiva || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Responsable plan:</span>
                    <span className="font-medium">{q.responsablePlan || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA ACCIONES - PLAN DE ACCIÓN */}
            {pestanaActiva === 'acciones' && (
              <div className="space-y-6">
                {/* Plan de Acción principal */}
                <div className="bg-emerald-50 p-5 rounded-lg border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-600 uppercase mb-3">📌 Plan de Acción</p>
                  <p className="text-sm mb-4">{q.planAccion || 'No se ha definido un plan de acción'}</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-600 font-medium">Responsable: {q.responsablePlan || 'No asignado'}</span>
                    {q.fechaCierre && <span className="text-slate-500">Cerrado: {new Date(q.fechaCierre).toLocaleDateString()}</span>}
                  </div>
                </div>

                {/* Recomendaciones relacionadas */}
                {recomendacionesRelacionadas.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3">🤖 Recomendaciones IA relacionadas</p>
                    <div className="space-y-3">
                      {recomendacionesRelacionadas.map((rec, idx) => (
                        <div key={idx} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                              rec.nivel === 'URGENTE' ? 'bg-red-100 text-red-700' :
                              rec.nivel === 'CRÍTICO' ? 'bg-orange-100 text-orange-700' :
                              rec.nivel === 'ALTO' ? 'bg-amber-100 text-amber-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>
                              {rec.nivel}
                            </span>
                            <span className="text-xs text-slate-500">{rec.area}</span>
                          </div>
                          <p className="text-sm">{rec.sugerencia}</p>
                          {rec.feedback && (
                            <p className="text-xs text-slate-600 mt-2 italic">"{rec.feedback}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Acciones preventivas sugeridas */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-3">🛡️ Acciones preventivas sugeridas</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span>Documentar el caso en la base de conocimiento para evitar recurrencia</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span>Compartir lección aprendida con el equipo de {q.proceso}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span>Revisar si hay otros casos similares con {q.responsableFalla || 'el mismo responsable'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* PESTAÑA HISTORIAL */}
            {pestanaActiva === 'historial' && (
              <div className="space-y-4">
                {seguimientosRelacionados.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-400">No hay seguimientos registrados para esta queja</p>
                  </div>
                ) : (
                  seguimientosRelacionados.map((seg, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase">
                            {new Date(seg.fechaRegistro).toLocaleDateString()}
                          </span>
                          <span className={`ml-3 text-xs px-2 py-0.5 rounded-full font-bold ${
                            seg.estado === 'COMPLETADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {seg.estado}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{seg.responsable}</span>
                      </div>
                      {seg.notas && (
                        <div className="mb-2">
                          <p className="text-xs text-slate-500">📝 Notas:</p>
                          <p className="text-sm">{seg.notas}</p>
                        </div>
                      )}
                      {seg.acuerdos && (
                        <div>
                          <p className="text-xs text-slate-500">🤝 Acuerdos:</p>
                          <p className="text-sm">{seg.acuerdos}</p>
                        </div>
                      )}
                      {seg.fechaCompromiso && (
                        <p className="text-xs text-slate-400 mt-2">
                          📅 Compromiso: {new Date(seg.fechaCompromiso).toLocaleDateString()}
                        </p>
                      )}
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

  // ============================================
  // VISTA PARA COLABORADORES (tu implementación original mejorada)
  // ============================================
  if (tipo === 'coordinacion' || tipo === 'agendamiento') {
    const datos = colaborador;
    const recomendacionesColaborador = recomendaciones?.filter(r => 
      r.agente === datos.colaborador || r.agente === datos.asesor
    ) || [];
    const seguimientosColaborador = seguimientos?.filter(s => 
      recomendacionesColaborador.some(r => r.id === s.recomendacionId)
    ) || [];

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {datos.colaborador || datos.asesor}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {datos.unidad} · {tipo === 'coordinacion' ? 'Coordinación' : 'Agendamiento'}
              </p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          {/* Pestañas */}
          <div className="border-b border-slate-100 px-6">
            <div className="flex space-x-6">
              <button
                onClick={() => setPestanaActiva('info')}
                className={`py-3 border-b-2 font-medium text-sm ${
                  pestanaActiva === 'info' ? 'border-[#0066CC] text-[#0066CC]' : 'border-transparent text-slate-400'
                }`}
              >
                📊 Métricas
              </button>
              <button
                onClick={() => setPestanaActiva('recomendaciones')}
                className={`py-3 border-b-2 font-medium text-sm ${
                  pestanaActiva === 'recomendaciones' ? 'border-[#0066CC] text-[#0066CC]' : 'border-transparent text-slate-400'
                }`}
              >
                🎯 Recomendaciones ({recomendacionesColaborador.length})
              </button>
              <button
                onClick={() => setPestanaActiva('seguimientos')}
                className={`py-3 border-b-2 font-medium text-sm ${
                  pestanaActiva === 'seguimientos' ? 'border-[#0066CC] text-[#0066CC]' : 'border-transparent text-slate-400'
                }`}
              >
                📋 Seguimientos ({seguimientosColaborador.length})
              </button>
            </div>
          </div>

          {/* Contenido según pestaña */}
          <div className="p-6">
            {pestanaActiva === 'info' && (
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(datos).map(([key, value]) => {
                  if (key === 'colaborador' || key === 'asesor' || key === 'unidad') return null;
                  return (
                    <div key={key} className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-[10px] text-slate-400 uppercase">{key}</p>
                      <p className="text-sm font-medium">{value?.toString() || '-'}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {pestanaActiva === 'recomendaciones' && (
              <div className="space-y-3">
                {recomendacionesColaborador.map((rec, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border ${
                    rec.nivel === 'URGENTE' ? 'bg-red-50 border-red-200' :
                    rec.nivel === 'CRÍTICO' ? 'bg-orange-50 border-orange-200' :
                    rec.nivel === 'ALTO' ? 'bg-amber-50 border-amber-200' :
                    'bg-emerald-50 border-emerald-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        rec.nivel === 'URGENTE' ? 'bg-red-100 text-red-700' :
                        rec.nivel === 'CRÍTICO' ? 'bg-orange-100 text-orange-700' :
                        rec.nivel === 'ALTO' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {rec.nivel}
                      </span>
                      <span className="text-xs text-slate-500">{rec.area}</span>
                    </div>
                    <p className="text-sm font-medium mb-2">{rec.sugerencia}</p>
                    {rec.feedback && (
                      <p className="text-xs text-slate-600 italic">"{rec.feedback}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {pestanaActiva === 'seguimientos' && (
              <div className="space-y-3">
                {seguimientosColaborador.map((seg, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-400">
                        {new Date(seg.fechaRegistro).toLocaleDateString()}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        seg.estado === 'COMPLETADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {seg.estado}
                      </span>
                    </div>
                    {seg.notas && <p className="text-sm mb-2">{seg.notas}</p>}
                    {seg.acuerdos && <p className="text-sm text-slate-600">{seg.acuerdos}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
