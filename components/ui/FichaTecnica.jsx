// components/ui/FichaTecnica.jsx
// Modal de ficha técnica del colaborador - Fase 3
// Se abre al hacer clic en el nombre en cualquier tabla

import { useMemo } from 'react';

const NIVEL_COLOR = {
  URGENTE: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  CRITICO: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  ALTO: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  VERDE: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

// Radar SVG simple sin librerías externas
function RadarChart({ datos }) {
  const cx = 100, cy = 100, r = 75;
  const n = datos.length;

  const puntos = datos.map((d, i) => {
    const angulo = (i * 2 * Math.PI) / n - Math.PI / 2;
    const pct = Math.min(d.valor / d.max, 1);
    return {
      x: cx + r * pct * Math.cos(angulo),
      y: cy + r * pct * Math.sin(angulo),
      lx: cx + (r + 18) * Math.cos(angulo),
      ly: cy + (r + 18) * Math.sin(angulo),
      bx: cx + r * Math.cos(angulo),
      by: cy + r * Math.sin(angulo),
      label: d.label,
      valor: d.valor,
      max: d.max,
      color: d.color,
    };
  });

  const poligono = puntos.map(p => `${p.x},${p.y}`).join(' ');
  const base = puntos.map(p => `${p.bx},${p.by}`).join(' ');

  // Círculos de referencia
  const circulos = [0.25, 0.5, 0.75, 1].map(pct => ({
    r: r * pct,
    opacity: pct === 1 ? 0.3 : 0.1,
  }));

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[200px] mx-auto">
      {/* Círculos de referencia */}
      {circulos.map((c, i) => (
        <circle key={i} cx={cx} cy={cy} r={c.r} fill="none" stroke="#94a3b8" strokeWidth={0.5} opacity={c.opacity * 3} />
      ))}

      {/* Líneas de eje */}
      {puntos.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.bx} y2={p.by} stroke="#cbd5e1" strokeWidth={0.5} />
      ))}

      {/* Área base */}
      <polygon points={base} fill="#e2e8f0" opacity={0.3} />

      {/* Área de datos */}
      <polygon points={poligono} fill="#0066CC" opacity={0.25} stroke="#0066CC" strokeWidth={1.5} />

      {/* Puntos */}
      {puntos.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#0066CC" />
      ))}

      {/* Labels */}
      {puntos.map((p, i) => (
        <text
          key={i}
          x={p.lx}
          y={p.ly}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="8"
          fill="#475569"
          fontWeight="600"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}

// Barra de progreso horizontal
function BarraMetrica({ label, valor, max, color = '#0066CC', sufijo = '' }) {
  const pct = Math.min((valor / max) * 100, 100);
  return (
    <div className="mb-2">
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className="font-bold text-slate-700">{valor}{sufijo}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function FichaTecnica({ colaborador, tipo, seguimientos = [], recomendaciones = [], onClose }) {
  if (!colaborador) return null;

  const nombre = tipo === 'coordinacion' ? colaborador.colaborador : colaborador.asesor;

  // Clasificación automática Triple A / En desarrollo / En riesgo
  const clasificacion = useMemo(() => {
    if (tipo === 'coordinacion') {
      const { efectividadSIO, tiempoPromedio, noConformidades, reincidencias } = colaborador;
      if (efectividadSIO >= 98 && tiempoPromedio <= 7 && noConformidades === 0 && reincidencias === 0)
        return { nivel: 'TRIPLE A ⭐', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', desc: 'Desempeño sobresaliente' };
      if (efectividadSIO >= 95 && reincidencias <= 1)
        return { nivel: 'EN DESARROLLO 📈', color: 'bg-amber-100 text-amber-800 border-amber-300', desc: 'Potencial identificado' };
      return { nivel: 'EN RIESGO ⚠️', color: 'bg-red-100 text-red-800 border-red-300', desc: 'Requiere intervención' };
    } else {
      const { conversion, reincidencias, hallazgosCitas = 0, hallazgosCotizacion = 0, hallazgosAgendas = 0 } = colaborador;
      const totalH = hallazgosCitas + hallazgosCotizacion + hallazgosAgendas;
      if (conversion >= 60 && reincidencias === 0 && totalH === 0)
        return { nivel: 'TRIPLE A ⭐', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', desc: 'Desempeño sobresaliente' };
      if (conversion >= 50 && reincidencias <= 1)
        return { nivel: 'EN DESARROLLO 📈', color: 'bg-amber-100 text-amber-800 border-amber-300', desc: 'Potencial identificado' };
      return { nivel: 'EN RIESGO ⚠️', color: 'bg-red-100 text-red-800 border-red-300', desc: 'Requiere intervención' };
    }
  }, [colaborador, tipo]);

  // Datos para el radar según tipo
  const radarDatos = useMemo(() => {
    if (tipo === 'coordinacion') {
      return [
        { label: 'Efectividad', valor: colaborador.efectividadSIO, max: 100, color: '#10b981' },
        { label: 'Velocidad', valor: Math.max(0, 15 - colaborador.tiempoPromedio), max: 15, color: '#3b82f6' },
        { label: 'Calidad', valor: Math.max(0, 10 - colaborador.noConformidades), max: 10, color: '#8b5cf6' },
        { label: 'Hallazgos', valor: colaborador.efectividadHallazgos, max: 100, color: '#f59e0b' },
        { label: 'Disciplina', valor: Math.max(0, 5 - colaborador.reincidencias), max: 5, color: '#ef4444' },
      ];
    } else {
      const totalH = (colaborador.hallazgosCitas || 0) + (colaborador.hallazgosCotizacion || 0) + (colaborador.hallazgosAgendas || 0);
      return [
        { label: 'Conversión', valor: colaborador.conversion, max: 100, color: '#10b981' },
        { label: 'Cierres', valor: colaborador.cierres, max: colaborador.oportunidades || 10, color: '#3b82f6' },
        { label: 'Calidad', valor: Math.max(0, 10 - (colaborador.noConformidades || 0)), max: 10, color: '#8b5cf6' },
        { label: 'Gestión', valor: Math.max(0, 10 - totalH), max: 10, color: '#f59e0b' },
        { label: 'Disciplina', valor: Math.max(0, 5 - (colaborador.reincidencias || 0)), max: 5, color: '#ef4444' },
      ];
    }
  }, [colaborador, tipo]);

  // Historial de seguimientos de este colaborador
  const historial = useMemo(() =>
    seguimientos.filter(s => s.colaborador?.toLowerCase().includes(nombre?.toLowerCase()))
  , [seguimientos, nombre]);

  // Recomendaciones activas de este colaborador
  const recsActivas = useMemo(() =>
    recomendaciones.filter(r => r.agente?.toLowerCase().includes(nombre?.toLowerCase()))
  , [recomendaciones, nombre]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-[#0066CC] px-6 py-4 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-1">
                Ficha Técnica · {tipo === 'coordinacion' ? 'Coordinación' : 'Agendamiento'}
              </p>
              <h2 className="text-white text-xl font-black">{nombre}</h2>
              {tipo === 'coordinacion' && (
                <p className="text-blue-200 text-xs mt-0.5">{colaborador.unidad}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${clasificacion.color}`}>
                {clasificacion.nivel}
              </span>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors text-xl font-light"
              >
                ✕
              </button>
            </div>
          </div>
          <p className="text-blue-200 text-[10px] mt-2">{clasificacion.desc}</p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* COLUMNA IZQUIERDA */}
          <div className="space-y-5">

            {/* Radar de competencias */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">
                🎯 Radar de Competencias
              </p>
              <RadarChart datos={radarDatos} />
            </div>

            {/* Métricas detalladas */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">
                📊 Métricas Actuales
              </p>
              {tipo === 'coordinacion' ? (
                <>
                  <BarraMetrica label="Efectividad SIO" valor={colaborador.efectividadSIO} max={100} color="#10b981" sufijo="%" />
                  <BarraMetrica label="Tiempo promedio" valor={colaborador.tiempoPromedio} max={15} color="#3b82f6" sufijo=" min" />
                  <BarraMetrica label="Registros" valor={colaborador.cantidadRegistros} max={50} color="#8b5cf6" />
                  <BarraMetrica label="No conformidades" valor={colaborador.noConformidades} max={10} color="#ef4444" />
                  <BarraMetrica label="Efect. hallazgos" valor={colaborador.efectividadHallazgos} max={100} color="#f59e0b" sufijo="%" />
                </>
              ) : (
                <>
                  <BarraMetrica label="Conversión" valor={colaborador.conversion} max={100} color="#10b981" sufijo="%" />
                  <BarraMetrica label="Oportunidades" valor={colaborador.oportunidades} max={50} color="#3b82f6" />
                  <BarraMetrica label="Cierres" valor={colaborador.cierres} max={colaborador.oportunidades || 30} color="#8b5cf6" />
                  <BarraMetrica label="Hallazgos citas" valor={colaborador.hallazgosCitas || 0} max={10} color="#ef4444" />
                  <BarraMetrica label="Hallazgos agendas" valor={colaborador.hallazgosAgendas || 0} max={10} color="#f59e0b" />
                </>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="space-y-5">

            {/* Semáforo y estado */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Semáforo</p>
                <div className={`w-10 h-10 rounded-full mx-auto mb-2 ${
                  (colaborador.semaforo || colaborador.estatus) === 'VERDE' || colaborador.estatus === 'Activo' ? 'bg-emerald-500' :
                  (colaborador.semaforo || colaborador.estatus) === 'AMARILLO' || colaborador.estatus === 'Observado' ? 'bg-amber-500' :
                  'bg-red-500'
                }`} />
                <p className="text-xs font-bold text-slate-700">
                  {colaborador.semaforo === 'VERDE' || colaborador.estatus === 'Activo' ? 'Excelente' :
                   colaborador.semaforo === 'AMARILLO' || colaborador.estatus === 'Observado' ? 'En desarrollo' :
                   'Atención'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Reincidencias</p>
                <p className={`text-3xl font-black ${
                  (colaborador.reincidencias || 0) === 0 ? 'text-emerald-600' :
                  (colaborador.reincidencias || 0) === 1 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {colaborador.reincidencias || 0}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {(colaborador.reincidencias || 0) === 0 ? 'Sin reincidencias' :
                   (colaborador.reincidencias || 0) === 1 ? 'Retroalimentación' :
                   (colaborador.reincidencias || 0) === 2 ? 'Plan de mejora' : 'Acta administrativa'}
                </p>
              </div>
            </div>

            {/* Alertas activas */}
            {recsActivas.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">
                  🚨 Alertas activas ({recsActivas.length})
                </p>
                <div className="space-y-2">
                  {recsActivas.map((r, i) => {
                    const c = NIVEL_COLOR[r.nivel] || NIVEL_COLOR.VERDE;
                    return (
                      <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${c.bg}`}>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-[10px] font-black uppercase ${c.text}`}>{r.nivel}</p>
                          <p className="text-[10px] text-slate-600 truncate">{r.area} · {r.metrica}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Historial de seguimientos */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">
                📋 Historial de sesiones ({historial.length})
              </p>
              {historial.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  Sin sesiones registradas aún
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {historial.slice().reverse().map((s, i) => (
                    <div key={i} className="bg-white rounded-lg border border-slate-200 p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-slate-500">{s.fechaRegistro}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          s.estado === 'COMPLETADO'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {s.estado}
                        </span>
                      </div>
                      {s.acuerdos && (
                        <p className="text-[10px] text-slate-600 line-clamp-2">
                          <span className="font-semibold">Acuerdos:</span> {s.acuerdos}
                        </p>
                      )}
                      {s.fechaCompromiso && (
                        <p className="text-[10px] text-slate-400 mt-1">📅 {s.fechaCompromiso}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Datos adicionales */}
            {tipo === 'coordinacion' && colaborador.ultimaAccion && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider mb-2">
                  📌 Última acción registrada
                </p>
                <p className="text-xs text-blue-700">{colaborador.ultimaAccion}</p>
                {colaborador.proximoSeguimiento && (
                  <p className="text-[10px] text-blue-400 mt-2">
                    🗓 Próximo seguimiento: {colaborador.proximoSeguimiento}
                  </p>
                )}
              </div>
            )}

            {tipo === 'agendamiento' && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider mb-2">
                  📌 Última auditoría
                </p>
                <p className="text-xs text-blue-700">{colaborador.ultimaAuditoria || 'No registrada'}</p>
                {colaborador.proximaRevision && (
                  <p className="text-[10px] text-blue-400 mt-2">
                    🗓 Próxima revisión: {colaborador.proximaRevision}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 pb-4">
          <p className="text-[10px] text-slate-300 text-center">
            Grupo RIO · Ficha generada automáticamente desde datos del período seleccionado
          </p>
        </div>
      </div>
    </div>
  );
}
