export default function MetricCards() {
  // Datos de ejemplo - estos vendrán de Supabase
  const metrics = {
    coordinacion: {
      efectividad: { value: 97.5, meta: 98, unit: '%' },
      tiempo: { value: 84.2, meta: 85, unit: '%' },
      noConformidades: { value: -32, meta: -30, unit: '%', trend: 'down' },
      snc: { value: -28, meta: -30, unit: '%', trend: 'up' }
    },
    agendamiento: {
      oportunidades: { value: 74.5, meta: 75, unit: '%' },
      cierres: { value: -35, meta: -80, unit: '%', trend: 'up' },
      conversion: { value: 94.8, meta: 95, unit: '%' },
      auditorias: { value: 12, meta: 0, unit: '', trend: 'bad' }
    }
  };

  const getStatusColor = (current, meta, isInverse = false) => {
    if (isInverse) {
      return current <= meta ? 'text-emerald-600' : 'text-red-600';
    }
    return current >= meta ? 'text-emerald-600' : 'text-amber-600';
  };

  return (
    <div className="space-y-6">
      {/* Coordinación */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-slate-800 rounded-full"></span>
          COORDINACIÓN
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase mb-1">% Efectividad Registro</div>
            <div className="flex items-end justify-between">
              <div>
                <span className={`text-2xl font-black ${getStatusColor(metrics.coordinacion.efectividad.value, metrics.coordinacion.efectividad.meta)}`}>
                  {metrics.coordinacion.efectividad.value}%
                </span>
                <span className="text-xs text-slate-400 ml-1">/ {metrics.coordinacion.efectividad.meta}%</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Meta</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase mb-1">% Cumplimiento 7min</div>
            <div className="flex items-end justify-between">
              <div>
                <span className={`text-2xl font-black ${getStatusColor(metrics.coordinacion.tiempo.value, metrics.coordinacion.tiempo.meta)}`}>
                  {metrics.coordinacion.tiempo.value}%
                </span>
                <span className="text-xs text-slate-400 ml-1">/ {metrics.coordinacion.tiempo.meta}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase mb-1"># No Conformidades</div>
            <div className="flex items-end justify-between">
              <div>
                <span className={`text-2xl font-black ${getStatusColor(metrics.coordinacion.noConformidades.value, metrics.coordinacion.noConformidades.meta, true)}`}>
                  {metrics.coordinacion.noConformidades.value}%
                </span>
                <span className="text-xs text-slate-400 ml-1">vs ↓30%</span>
              </div>
              <span className={`text-xs font-bold ${metrics.coordinacion.noConformidades.trend === 'down' ? 'text-emerald-600' : 'text-red-600'} bg-slate-50 px-2 py-1 rounded`}>
                {metrics.coordinacion.noConformidades.trend === 'down' ? '↓' : '↑'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase mb-1"># Servicio no conformes</div>
            <div className="flex items-end justify-between">
              <div>
                <span className={`text-2xl font-black ${getStatusColor(metrics.coordinacion.snc.value, metrics.coordinacion.snc.meta, true)}`}>
                  {metrics.coordinacion.snc.value}%
                </span>
                <span className="text-xs text-slate-400 ml-1">vs ↓30%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agendamiento */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-slate-800 rounded-full"></span>
          AGENDAMIENTO
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase mb-1">Oportunidades</div>
            <div className="flex items-end justify-between">
              <div>
                <span className={`text-2xl font-black ${getStatusColor(metrics.agendamiento.oportunidades.value, metrics.agendamiento.oportunidades.meta)}`}>
                  {metrics.agendamiento.oportunidades.value}%
                </span>
                <span className="text-xs text-slate-400 ml-1">/ 75%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase mb-1">Cierres</div>
            <div className="flex items-end justify-between">
              <div>
                <span className={`text-2xl font-black ${getStatusColor(metrics.agendamiento.cierres.value, metrics.agendamiento.cierres.meta, true)}`}>
                  {metrics.agendamiento.cierres.value}%
                </span>
                <span className="text-xs text-slate-400 ml-1">vs ↓80%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase mb-1">% Conversión</div>
            <div className="flex items-end justify-between">
              <div>
                <span className={`text-2xl font-black ${getStatusColor(metrics.agendamiento.conversion.value, metrics.agendamiento.conversion.meta)}`}>
                  {metrics.agendamiento.conversion.value}%
                </span>
                <span className="text-xs text-slate-400 ml-1">/ 95%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase mb-1">Hallazgos Auditoría</div>
            <div className="flex items-end justify-between">
              <div>
                <span className={`text-2xl font-black ${metrics.agendamiento.auditorias.value > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {metrics.agendamiento.auditorias.value}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
