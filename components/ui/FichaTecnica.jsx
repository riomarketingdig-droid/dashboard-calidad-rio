import { useState } from 'react';
import InfoTooltip from './InfoTooltip';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function FichaTecnica({ colaborador, tipo, seguimientos, recomendaciones, onClose }) {
  const [pestanaActiva, setPestanaActiva] = useState('info');

  // Función para calcular semáforo (unificada)
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
      // Puedes definir reglas para agendamiento
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

  // ============================================
  // VISTA PARA QUEJAS (igual que antes)
  // ============================================
  if (tipo === 'queja' && colaborador.queja) {
    // ... (mantén todo el código existente para quejas, sin cambios)
    // Por brevedad, no lo repito, pero asegúrate de conservar lo que ya funciona.
    // En tu archivo actual ya tienes esa parte, no la borres.
  }

  // ============================================
  // VISTA PARA COLABORADORES (MEJORADA)
  // ============================================
  if (tipo === 'coordinacion' || tipo === 'agendamiento') {
    const datos = colaborador;
    const recomendacionesColaborador = recomendaciones?.filter(r => 
      r.agente === datos.colaborador || r.agente === datos.asesor
    ) || [];
    const seguimientosColaborador = seguimientos?.filter(s => 
      recomendacionesColaborador.some(r => r.id === s.recomendacionId)
    ) || [];

    // Preparar datos para radar (valores normalizados 0-100)
    const radarData = [];
    if (tipo === 'coordinacion') {
      radarData.push(
        { metric: 'FTR', value: datos.ftr || 0, fullMark: 100 },
        { metric: 'Tiempo', value: datos.tiempoPromedio ? Math.max(0, 10 - datos.tiempoPromedio) * 10 : 0, fullMark: 100 }, // invertido: a menor tiempo mejor
        { metric: 'No Conformidades', value: datos.noConformidades ? Math.max(0, 5 - datos.noConformidades) * 20 : 100, fullMark: 100 },
        { metric: 'SNC', value: datos.snc ? Math.max(0, 5 - datos.snc) * 20 : 100, fullMark: 100 }
      );
    } else {
      radarData.push(
        { metric: 'Oportunidades', value: datos.oportunidadesAprovechadas || 0, fullMark: 100 },
        { metric: 'Efect. Hallazgos', value: datos.efectividadHallazgos || 0, fullMark: 100 },
        { metric: 'Score', value: datos.scoreTotal || 0, fullMark: 100 },
        { metric: 'No Conformidades', value: datos.noConformidades ? Math.max(0, 5 - datos.noConformidades) * 20 : 100, fullMark: 100 }
      );
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          
          {/* Header con semáforo */}
          <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getSemaforoColor(semaforo)}`}>
                  <span className={`w-2 h-2 rounded-full ${
                    semaforo === 'VERDE' ? 'bg-emerald-500' :
                    semaforo === 'AMARILLO' ? 'bg-amber-500' : 'bg-red-500'
                  }`}></span>
                  {semaforo === 'VERDE' ? 'Excelente' : 
                   semaforo === 'AMARILLO' ? 'En desarrollo' : 
                   semaforo === 'ROJO' ? 'Atención' : 'Sin definir'}
                </span>
              </div>
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
                📊 Métricas actuales
              </button>
              <button
                onClick={() => setPestanaActiva('radar')}
                className={`py-3 border-b-2 font-medium text-sm ${
                  pestanaActiva === 'radar' ? 'border-[#0066CC] text-[#0066CC]' : 'border-transparent text-slate-400'
                }`}
              >
                🕸️ Puntos fuertes/débiles
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

          {/* Contenido */}
          <div className="p-6">
            {pestanaActiva === 'info' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(datos).map(([key, value]) => {
                  if (key === 'colaborador' || key === 'asesor' || key === 'unidad' || key === 'fechaObj') return null;
                  return (
                    <div key={key} className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-[10px] text-slate-400 uppercase">{key}</p>
                      <p className="text-sm font-medium">{value?.toString() || '-'}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {pestanaActiva === 'radar' && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Análisis de competencias</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Colaborador" dataKey="value" stroke="#0066CC" fill="#0066CC" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  * Valores normalizados: a mayor área, mejor desempeño.
                </p>
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

  return null;
}
